import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { RiskService } from '../risk/risk.service';
import * as bcrypt from 'bcrypt';
import { QuestStatus, ActionStatus, PayoutStatus, BlacklistType, TutorialStatus, TutorialType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private telegramService: TelegramService,
    private riskService: RiskService,
  ) {}

  // ==================== 认证相关 ====================

  // 管理员登录
  async login(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成 JWT
    const token = this.jwtService.sign({
      sub: admin.id.toString(),
      username: admin.username,
      role: admin.role,
      type: 'admin',
    });

    return {
      token,
      user: {
        id: admin.id.toString(),
        username: admin.username,
        role: admin.role,
      },
    };
  }

  // 创建管理员（初始化用）
  async createAdmin(username: string, password: string, role: string = 'admin') {
    const existing = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (existing) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    return {
      id: admin.id.toString(),
      username: admin.username,
      role: admin.role,
    };
  }

  // ==================== 统计数据 ====================

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalQuests,
      totalRewardsResult,
      todayUsers,
      recentQuests,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.quest.count(),
      this.prisma.reward.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.quest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { actions: true },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalQuests,
      totalRewards: totalRewardsResult._sum.amount?.toString() || '0',
      todayUsers,
      recentQuests: recentQuests.map((q) => ({
        id: q.id.toString(),
        title: q.title,
        type: q.type,
        status: q.status,
        completedCount: q._count.actions,
      })),
    };
  }

  // ==================== 任务管理 ====================

  async getQuests(page: number = 1, pageSize: number = 10, status?: QuestStatus) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.quest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { username: true } },
          _count: { select: { actions: true } },
        },
      }),
      this.prisma.quest.count({ where }),
    ]);

    return {
      items: items.map((q) => ({
        id: q.id.toString(),
        type: q.type,
        title: q.title,
        titleEn: q.titleEn,
        description: q.description,
        descriptionEn: q.descriptionEn,
        reward: {
          type: q.rewardType,
          amount: q.rewardAmount.toString(),
          points: q.rewardPoints,
          asset: q.rewardAsset,
        },
        limits: q.limits,
        status: q.status,
        targetUrl: q.targetUrl,
        channelId: q.channelId,
        targetCountries: q.targetCountries,
        stepDetails: q.stepDetails,
        owner: q.owner?.username,
        actionCount: q._count.actions,
        createdAt: q.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getQuestDetail(id: bigint) {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
      include: {
        owner: { select: { username: true } },
        _count: {
          select: { actions: true, rewards: true },
        },
      },
    });

    if (!quest) {
      throw new BadRequestException('任务不存在');
    }

    return {
      id: quest.id.toString(),
      type: quest.type,
      title: quest.title,
      titleEn: quest.titleEn,
      description: quest.description,
      descriptionEn: quest.descriptionEn,
      reward: {
        type: quest.rewardType,
        amount: quest.rewardAmount.toString(),
        points: quest.rewardPoints,
        asset: quest.rewardAsset,
      },
      limits: quest.limits,
      status: quest.status,
      targetUrl: quest.targetUrl,
      channelId: quest.channelId,
      targetCountries: quest.targetCountries,
      stepDetails: quest.stepDetails,
      owner: quest.owner?.username,
      actionCount: quest._count.actions,
      rewardCount: quest._count.rewards,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
    };
  }

  async createQuest(data: any) {
    // 需要一个默认的 owner，这里用第一个用户或创建系统用户
    let owner = await this.prisma.user.findFirst();
    if (!owner) {
      owner = await this.prisma.user.create({
        data: {
          tgId: BigInt(0),
          username: 'system',
        },
      });
    }

    // 如果没有指定积分，则默认为 USDT × 10
    const rewardAmount = new Decimal(data.reward.amount);
    const rewardPoints = data.reward.points !== undefined
      ? data.reward.points
      : Math.floor(rewardAmount.toNumber() * 10);

    const quest = await this.prisma.quest.create({
      data: {
        ownerId: owner.id,
        type: data.type,
        title: data.title,
        titleEn: data.titleEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        rewardType: data.reward.type,
        rewardAmount: rewardAmount,
        rewardPoints: rewardPoints,
        rewardAsset: data.reward.asset,
        limits: data.limits || { dailyCap: 100, perUserCap: 1 },
        targetUrl: data.targetUrl,
        channelId: data.channelId,
        targetCountries: data.targetCountries || [],
        stepDetails: data.stepDetails || null,
        status: QuestStatus.DRAFT,
      },
    });

    return {
      id: quest.id.toString(),
      message: '任务创建成功',
    };
  }

  async updateQuest(id: bigint, data: any) {
    const quest = await this.prisma.quest.findUnique({ where: { id } });
    if (!quest) {
      throw new BadRequestException('任务不存在');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.targetUrl !== undefined) updateData.targetUrl = data.targetUrl;
    if (data.channelId !== undefined) updateData.channelId = data.channelId;
    if (data.limits !== undefined) updateData.limits = data.limits;
    if (data.targetCountries !== undefined) updateData.targetCountries = data.targetCountries;
    if (data.stepDetails !== undefined) updateData.stepDetails = data.stepDetails;
    if (data.reward?.type !== undefined) updateData.rewardType = data.reward.type;
    if (data.reward?.amount !== undefined) updateData.rewardAmount = new Decimal(data.reward.amount);
    if (data.reward?.points !== undefined) updateData.rewardPoints = data.reward.points;
    if (data.reward?.asset !== undefined) updateData.rewardAsset = data.reward.asset;

    await this.prisma.quest.update({
      where: { id },
      data: updateData,
    });

    return { message: '任务更新成功' };
  }

  async updateQuestStatus(id: bigint, status: QuestStatus) {
    const quest = await this.prisma.quest.findUnique({ where: { id } });
    if (!quest) {
      throw new BadRequestException('任务不存在');
    }

    await this.prisma.quest.update({
      where: { id },
      data: { status },
    });

    return { message: `任务状态已更新为 ${status}` };
  }

  async deleteQuest(id: bigint) {
    const quest = await this.prisma.quest.findUnique({ where: { id } });
    if (!quest) {
      throw new BadRequestException('任务不存在');
    }

    // 硬删除：使用事务删除关联数据
    await this.prisma.$transaction(async (tx) => {
      // 1. 先删除奖励记录（依赖 action 和 quest）
      await tx.reward.deleteMany({
        where: { questId: id },
      });

      // 2. 再删除行为记录（依赖 quest）
      await tx.action.deleteMany({
        where: { questId: id },
      });

      // 3. 最后删除任务本身
      await tx.quest.delete({
        where: { id },
      });
    });

    return { message: '任务已删除' };
  }

  // ==================== 用户管理 ====================

  async getUsers(page: number = 1, pageSize: number = 10, search?: string) {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { tgId: { equals: BigInt(search) || undefined } },
          ].filter(Boolean),
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { actions: true, rewards: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id.toString(),
        tgId: u.tgId.toString(),
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        walletAddr: u.walletAddr,
        locale: u.locale,
        riskScore: u.riskScore,
        actionCount: u._count.actions,
        rewardCount: u._count.rewards,
        createdAt: u.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUserDetail(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { actions: true, rewards: true } },
        rewards: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 计算总奖励
    const totalRewards = await this.prisma.reward.aggregate({
      where: { userId: id },
      _sum: { amount: true },
    });

    // 获取风控事件历史
    const riskEvents = await this.prisma.riskEvent.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 获取风险分详情
    const riskDetails = await this.riskService.getRiskScore(id);

    return {
      id: user.id.toString(),
      tgId: user.tgId.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      walletAddr: user.walletAddr,
      locale: user.locale,
      riskScore: riskDetails.score,
      riskLevel: riskDetails.level,
      riskFactors: riskDetails.factors,
      completedQuests: user._count.actions,
      totalRewards: totalRewards._sum.amount?.toString() || '0',
      recentRewards: user.rewards.map((r) => ({
        id: r.id.toString(),
        type: r.type,
        amount: r.amount.toString(),
        createdAt: r.createdAt,
      })),
      riskEvents: riskEvents.map((e) => ({
        id: e.id.toString(),
        eventType: e.eventType,
        severity: e.severity,
        details: e.details,
        createdAt: e.createdAt,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // ==================== 奖励管理 ====================

  async getRewards(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.reward.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, tgId: true } },
          quest: { select: { title: true } },
        },
      }),
      this.prisma.reward.count(),
    ]);

    return {
      items: items.map((r) => ({
        id: r.id.toString(),
        userId: r.userId.toString(),
        username: r.user?.username,
        tgId: r.user?.tgId.toString(),
        questId: r.questId.toString(),
        questTitle: r.quest?.title,
        type: r.type,
        amount: r.amount.toString(),
        status: r.status,
        createdAt: r.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ==================== 提现管理 ====================

  // 获取提现列表
  async getPayouts(page: number = 1, pageSize: number = 10, status?: PayoutStatus) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};

    const [items, total, pendingCount] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          beneficiary: {
            select: { username: true, tgId: true, walletAddr: true, riskScore: true },
          },
        },
      }),
      this.prisma.payout.count({ where }),
      this.prisma.payout.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id.toString(),
        beneficiaryId: p.beneficiaryId.toString(),
        username: p.beneficiary?.username,
        tgId: p.beneficiary?.tgId.toString(),
        userWallet: p.beneficiary?.walletAddr,
        riskScore: p.beneficiary?.riskScore || 0,
        asset: p.asset,
        amount: p.amount.toString(),
        toAddress: p.toAddress,
        status: p.status,
        txHash: p.txHash,
        proofImage: p.proofImage,
        createdAt: p.createdAt,
        processedAt: p.processedAt,
      })),
      total,
      pendingCount,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取提现详情
  async getPayoutDetail(id: bigint) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        beneficiary: {
          select: {
            id: true,
            username: true,
            tgId: true,
            walletAddr: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!payout) {
      throw new BadRequestException('提现记录不存在');
    }

    // 获取用户余额信息
    const userRewards = await this.prisma.reward.aggregate({
      where: { userId: payout.beneficiaryId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const userPayouts = await this.prisma.payout.aggregate({
      where: {
        beneficiaryId: payout.beneficiaryId,
        status: { in: ['COMPLETED', 'PROCESSING', 'PENDING'] },
      },
      _sum: { amount: true },
    });

    // 获取用户风险评估
    const riskDetails = await this.riskService.getRiskScore(payout.beneficiaryId);

    // 获取用户风控事件
    const riskEvents = await this.prisma.riskEvent.findMany({
      where: { userId: payout.beneficiaryId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      id: payout.id.toString(),
      beneficiaryId: payout.beneficiaryId.toString(),
      user: payout.beneficiary ? {
        username: payout.beneficiary.username,
        tgId: payout.beneficiary.tgId.toString(),
        walletAddr: payout.beneficiary.walletAddr,
        firstName: payout.beneficiary.firstName,
        lastName: payout.beneficiary.lastName,
      } : null,
      riskScore: riskDetails.score,
      riskLevel: riskDetails.level,
      riskFactors: riskDetails.factors,
      riskEvents: riskEvents.map((e) => ({
        id: e.id.toString(),
        eventType: e.eventType,
        severity: e.severity,
        details: e.details,
        createdAt: e.createdAt,
      })),
      asset: payout.asset,
      amount: payout.amount.toString(),
      toAddress: payout.toAddress,
      status: payout.status,
      txHash: payout.txHash,
      proofImage: payout.proofImage,
      totalEarned: userRewards._sum.amount?.toString() || '0',
      totalWithdrawn: userPayouts._sum.amount?.toString() || '0',
      createdAt: payout.createdAt,
      processedAt: payout.processedAt,
    };
  }

  // 审核通过提现
  async approvePayout(id: bigint, txHash?: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        beneficiary: { select: { tgId: true } },
      },
    });
    if (!payout) {
      throw new BadRequestException('提现记录不存在');
    }

    if (payout.status !== 'PENDING') {
      throw new BadRequestException('只能审核待处理的提现申请');
    }

    await this.prisma.payout.update({
      where: { id },
      data: {
        status: txHash ? 'COMPLETED' : 'PROCESSING',
        txHash: txHash || null,
        processedAt: new Date(),
      },
    });

    console.log(`✅ 提现审核通过: ID=${id}, 金额=${payout.amount} ${payout.asset}, txHash=${txHash || '待填写'}`);

    // 发送通知给用户
    if (payout.beneficiary?.tgId) {
      const amount = payout.amount.toString();
      if (txHash) {
        // 直接完成，发送完成通知
        this.telegramService.sendPayoutCompletedNotification(
          payout.beneficiary.tgId,
          amount,
          payout.asset,
          txHash
        ).catch(err => console.error('发送提现完成通知失败:', err));
      } else {
        // 审核通过但未转账，发送处理中通知
        this.telegramService.sendPayoutApprovedNotification(
          payout.beneficiary.tgId,
          amount,
          payout.asset
        ).catch(err => console.error('发送提现审核通知失败:', err));
      }
    }

    return { message: txHash ? '提现已完成' : '提现已审核通过，等待转账' };
  }

  // 拒绝提现
  async rejectPayout(id: bigint, reason?: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        beneficiary: { select: { tgId: true } },
      },
    });
    if (!payout) {
      throw new BadRequestException('提现记录不存在');
    }

    if (payout.status !== 'PENDING') {
      throw new BadRequestException('只能拒绝待处理的提现申请');
    }

    await this.prisma.payout.update({
      where: { id },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
      },
    });

    console.log(`❌ 提现被拒绝: ID=${id}, 金额=${payout.amount} ${payout.asset}, 原因=${reason || '未说明'}`);

    // 发送拒绝通知给用户
    if (payout.beneficiary?.tgId) {
      this.telegramService.sendPayoutRejectedNotification(
        payout.beneficiary.tgId,
        payout.amount.toString(),
        payout.asset,
        reason
      ).catch(err => console.error('发送提现拒绝通知失败:', err));
    }

    return { message: '提现已拒绝，金额将返还用户余额' };
  }

  // 标记提现完成（填写交易哈希或上传截图）
  async completePayout(id: bigint, txHash?: string, proofImage?: string) {
    if (!txHash && !proofImage) {
      throw new BadRequestException('请提供交易哈希或上传转账截图');
    }

    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        beneficiary: { select: { tgId: true } },
      },
    });
    if (!payout) {
      throw new BadRequestException('提现记录不存在');
    }

    if (payout.status !== 'PROCESSING' && payout.status !== 'PENDING') {
      throw new BadRequestException('只能完成处理中或待处理的提现');
    }

    await this.prisma.payout.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        txHash: txHash || null,
        proofImage: proofImage || null,
        processedAt: new Date(),
      },
    });

    console.log(`💰 提现完成: ID=${id}, txHash=${txHash || '无'}, proofImage=${proofImage || '无'}`);

    // 发送完成通知给用户
    if (payout.beneficiary?.tgId) {
      this.telegramService.sendPayoutCompletedNotification(
        payout.beneficiary.tgId,
        payout.amount.toString(),
        payout.asset,
        txHash
      ).catch(err => console.error('发送提现完成通知失败:', err));
    }

    return { message: '提现已完成' };
  }

  // 获取提现统计
  async getPayoutStats() {
    const [
      pendingCount,
      pendingAmount,
      processingCount,
      processingAmount,
      completedCount,
      completedAmount,
      failedCount,
    ] = await Promise.all([
      this.prisma.payout.count({ where: { status: 'PENDING' } }),
      this.prisma.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.payout.count({ where: { status: 'PROCESSING' } }),
      this.prisma.payout.aggregate({
        where: { status: 'PROCESSING' },
        _sum: { amount: true },
      }),
      this.prisma.payout.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payout.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      pending: {
        count: pendingCount,
        amount: pendingAmount._sum.amount?.toString() || '0',
      },
      processing: {
        count: processingCount,
        amount: processingAmount._sum.amount?.toString() || '0',
      },
      completed: {
        count: completedCount,
        amount: completedAmount._sum.amount?.toString() || '0',
      },
      failed: {
        count: failedCount,
      },
    };
  }

  // ==================== 风控管理 ====================

  // 获取风控事件列表
  async getRiskEvents(
    page: number = 1,
    pageSize: number = 20,
    severity?: string,
    eventType?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (severity) {
      where.severity = severity;
    }
    if (eventType) {
      where.eventType = eventType;
    }

    const [items, total] = await Promise.all([
      this.prisma.riskEvent.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.riskEvent.count({ where }),
    ]);

    // 获取相关用户信息
    const userIds = items.map(e => e.userId).filter(Boolean) as bigint[];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, firstName: true, tgId: true },
    });
    const userMap = new Map(users.map(u => [u.id.toString(), u]));

    return {
      items: items.map(e => {
        const user = e.userId ? userMap.get(e.userId.toString()) : null;
        return {
          id: e.id.toString(),
          userId: e.userId?.toString(),
          username: user?.username || user?.firstName || (e.userId ? `User${e.userId}` : '-'),
          tgId: user?.tgId?.toString(),
          eventType: e.eventType,
          severity: e.severity,
          details: e.details,
          ip: e.ip,
          visitorId: e.visitorId,
          createdAt: e.createdAt,
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取风控统计
  async getRiskStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      todayHighRisk,
      todayMediumRisk,
      weekTotal,
      bySeverity,
      byEventType,
    ] = await Promise.all([
      this.prisma.riskEvent.count({
        where: { severity: 'high', createdAt: { gte: todayStart } },
      }),
      this.prisma.riskEvent.count({
        where: { severity: 'medium', createdAt: { gte: todayStart } },
      }),
      this.prisma.riskEvent.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.riskEvent.groupBy({
        by: ['severity'],
        _count: { id: true },
      }),
      this.prisma.riskEvent.groupBy({
        by: ['eventType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      today: {
        high: todayHighRisk,
        medium: todayMediumRisk,
      },
      weekTotal,
      bySeverity: bySeverity.map(s => ({
        severity: s.severity,
        count: s._count.id,
      })),
      byEventType: byEventType.map(e => ({
        eventType: e.eventType,
        count: e._count.id,
      })),
    };
  }

  // 获取用户风控历史
  async getUserRiskHistory(userId: bigint) {
    const events = await this.prisma.riskEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        tgId: true,
        riskScore: true,
        createdAt: true,
      },
    });

    return {
      user: user ? {
        id: user.id.toString(),
        username: user.username || user.firstName,
        tgId: user.tgId.toString(),
        riskScore: user.riskScore,
        createdAt: user.createdAt,
      } : null,
      events: events.map(e => ({
        id: e.id.toString(),
        eventType: e.eventType,
        severity: e.severity,
        details: e.details,
        createdAt: e.createdAt,
      })),
      totalEvents: events.length,
    };
  }

  // ==================== 黑名单管理 ====================

  // 获取黑名单列表
  async getBlacklist(type?: BlacklistType) {
    const list = await this.prisma.blacklist.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: list.map(item => ({
        id: item.id.toString(),
        type: item.type,
        value: item.value,
        reason: item.reason,
        expiresAt: item.expiresAt,
        createdAt: item.createdAt,
        isExpired: item.expiresAt ? new Date(item.expiresAt) < new Date() : false,
      })),
      total: list.length,
    };
  }

  // 添加到黑名单
  async addToBlacklist(type: BlacklistType, value: string, reason?: string, expiresAt?: Date) {
    // 检查是否已存在
    const existing = await this.prisma.blacklist.findFirst({
      where: { type, value },
    });

    if (existing) {
      // 更新现有记录
      await this.prisma.blacklist.update({
        where: { id: existing.id },
        data: { reason, expiresAt },
      });
      return { success: true, message: '黑名单记录已更新' };
    }

    // 创建新记录
    await this.prisma.blacklist.create({
      data: { type, value, reason, expiresAt },
    });

    // 记录风控事件
    await this.prisma.riskEvent.create({
      data: {
        eventType: 'blacklist_add',
        severity: 'high',
        details: { type, value, reason },
      },
    });

    return { success: true, message: `已添加到${type === 'USER' ? '用户' : type === 'DEVICE' ? '设备' : 'IP'}黑名单` };
  }

  // 从黑名单移除
  async removeFromBlacklist(id: bigint) {
    const record = await this.prisma.blacklist.findUnique({
      where: { id },
    });

    if (!record) {
      throw new BadRequestException('黑名单记录不存在');
    }

    await this.prisma.blacklist.delete({
      where: { id },
    });

    // 记录风控事件
    await this.prisma.riskEvent.create({
      data: {
        eventType: 'blacklist_remove',
        severity: 'medium',
        details: { type: record.type, value: record.value },
      },
    });

    return { success: true, message: '已从黑名单移除' };
  }

  // ==================== 用户任务查询 ====================

  // ==================== 截图审核管理 ====================

  // 获取待审核截图列表
  async getPendingReviews(page: number = 1, pageSize: number = 10, status?: ActionStatus) {
    const skip = (page - 1) * pageSize;
    // 默认只显示 SUBMITTED 状态（待审核）
    const where = {
      status: status || ActionStatus.SUBMITTED,
      proofImage: { not: null },  // 只显示有截图的
    };

    const [items, total, pendingCount] = await Promise.all([
      this.prisma.action.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              tgId: true,
              twitterUsername: true,
              riskScore: true,
            },
          },
          quest: {
            select: {
              id: true,
              type: true,
              title: true,
              targetUrl: true,
              rewardType: true,
              rewardAmount: true,
            },
          },
        },
      }),
      this.prisma.action.count({ where }),
      this.prisma.action.count({
        where: { status: ActionStatus.SUBMITTED, proofImage: { not: null } },
      }),
    ]);

    return {
      items: items.map((action) => ({
        id: action.id.toString(),
        status: action.status,
        proofImage: action.proofImage,
        proof: action.proof,  // 包含 AI 验证结果
        submittedAt: action.submittedAt,
        user: action.user ? {
          id: action.user.id.toString(),
          username: action.user.username || action.user.firstName || '-',
          tgId: action.user.tgId.toString(),
          twitterUsername: action.user.twitterUsername,
          riskScore: action.user.riskScore,
        } : null,
        quest: action.quest ? {
          id: action.quest.id.toString(),
          type: action.quest.type,
          title: action.quest.title,
          targetUrl: action.quest.targetUrl,
          rewardType: action.quest.rewardType,
          rewardAmount: action.quest.rewardAmount.toString(),
        } : null,
      })),
      total,
      pendingCount,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取审核统计
  async getReviewStats() {
    const [pendingCount, approvedToday, rejectedToday] = await Promise.all([
      this.prisma.action.count({
        where: { status: ActionStatus.SUBMITTED, proofImage: { not: null } },
      }),
      this.prisma.action.count({
        where: {
          status: ActionStatus.REWARDED,
          proofImage: { not: null },
          verifiedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.action.count({
        where: {
          status: ActionStatus.REJECTED,
          proofImage: { not: null },
          verifiedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return {
      pending: pendingCount,
      approvedToday,
      rejectedToday,
    };
  }

  // 获取审核详情
  async getReviewDetail(actionId: bigint) {
    const action = await this.prisma.action.findUnique({
      where: { id: actionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            tgId: true,
            twitterId: true,
            twitterUsername: true,
            riskScore: true,
            createdAt: true,
          },
        },
        quest: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            targetUrl: true,
            rewardType: true,
            rewardAmount: true,
            rewardAsset: true,
          },
        },
      },
    });

    if (!action) {
      throw new BadRequestException('记录不存在');
    }

    // 获取用户完成的任务数量
    const userStats = await this.prisma.action.groupBy({
      by: ['status'],
      where: { userId: action.userId },
      _count: { id: true },
    });

    return {
      id: action.id.toString(),
      status: action.status,
      proofImage: action.proofImage,
      proof: action.proof,  // 包含 AI 验证结果
      twitterId: action.twitterId,
      claimedAt: action.claimedAt,
      submittedAt: action.submittedAt,
      verifiedAt: action.verifiedAt,
      user: action.user ? {
        id: action.user.id.toString(),
        username: action.user.username || action.user.firstName || '-',
        tgId: action.user.tgId.toString(),
        twitterId: action.user.twitterId,
        twitterUsername: action.user.twitterUsername,
        riskScore: action.user.riskScore,
        createdAt: action.user.createdAt,
        stats: userStats.reduce((acc, s) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {} as Record<string, number>),
      } : null,
      quest: action.quest ? {
        id: action.quest.id.toString(),
        type: action.quest.type,
        title: action.quest.title,
        description: action.quest.description,
        targetUrl: action.quest.targetUrl,
        rewardType: action.quest.rewardType,
        rewardAmount: action.quest.rewardAmount.toString(),
        rewardAsset: action.quest.rewardAsset,
      } : null,
    };
  }

  // 审核通过（发放奖励）
  async approveReview(actionId: bigint) {
    const action = await this.prisma.action.findUnique({
      where: { id: actionId },
      include: {
        quest: true,
        user: { select: { tgId: true } },
      },
    });

    if (!action) {
      throw new BadRequestException('记录不存在');
    }

    if (action.status !== ActionStatus.SUBMITTED) {
      throw new BadRequestException('只能审核待审核状态的记录');
    }

    // 使用事务发放奖励
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新状态为已奖励
      const updatedAction = await tx.action.update({
        where: { id: actionId },
        data: {
          status: ActionStatus.REWARDED,
          verifiedAt: new Date(),
        },
      });

      // 创建奖励记录
      const reward = await tx.reward.create({
        data: {
          userId: action.userId,
          questId: action.questId,
          actionId: actionId,
          type: action.quest.rewardType,
          amount: action.quest.rewardAmount,
          asset: action.quest.rewardAsset,
          status: 'COMPLETED',
        },
      });

      return { updatedAction, reward };
    });

    console.log(`✅ 审核通过: actionId=${actionId}, 奖励=${action.quest.rewardAmount} ${action.quest.rewardType}`);

    // 发送通知
    if (action.user?.tgId) {
      this.telegramService.sendQuestCompletedNotification(
        action.user.tgId,
        action.quest.title,
        Number(action.quest.rewardAmount),
        action.quest.rewardType
      ).catch(err => console.error('发送奖励通知失败:', err));
    }

    return {
      success: true,
      message: '审核通过，奖励已发放',
      reward: {
        type: action.quest.rewardType,
        amount: action.quest.rewardAmount.toString(),
      },
    };
  }

  // 审核拒绝
  async rejectReview(actionId: bigint, reason?: string) {
    const action = await this.prisma.action.findUnique({
      where: { id: actionId },
      include: {
        quest: { select: { title: true } },
        user: { select: { tgId: true } },
      },
    });

    if (!action) {
      throw new BadRequestException('记录不存在');
    }

    if (action.status !== ActionStatus.SUBMITTED) {
      throw new BadRequestException('只能审核待审核状态的记录');
    }

    // 更新状态为已拒绝
    await this.prisma.action.update({
      where: { id: actionId },
      data: {
        status: ActionStatus.REJECTED,
        verifiedAt: new Date(),
        proof: {
          ...(action.proof as object || {}),
          rejectReason: reason,
          rejectedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`❌ 审核拒绝: actionId=${actionId}, 原因=${reason || '未说明'}`);

    // 发送拒绝通知给用户
    if (action.user?.tgId) {
      this.telegramService.sendMessage(
        action.user.tgId,
        `❌ 您提交的任务「${action.quest.title}」审核未通过${reason ? `\n原因：${reason}` : ''}\n\n请重新完成任务并提交正确的截图。`
      ).catch(err => console.error('发送拒绝通知失败:', err));
    }

    return {
      success: true,
      message: '已拒绝该审核',
    };
  }

  // 获取用户已完成的任务列表
  async getUserCompletedQuests(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        tgId: true,
        twitterUsername: true,
      },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 获取用户已完成（已奖励）的任务
    const completedActions = await this.prisma.action.findMany({
      where: {
        userId,
        status: ActionStatus.REWARDED,
      },
      include: {
        quest: {
          select: {
            id: true,
            type: true,
            title: true,
            titleEn: true,
            rewardType: true,
            rewardAmount: true,
            rewardAsset: true,
          },
        },
        reward: {
          select: {
            id: true,
            amount: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { verifiedAt: 'desc' },
    });

    // 计算总奖励
    const totalReward = completedActions.reduce((sum, action) => {
      return sum + (action.reward?.amount?.toNumber() || 0);
    }, 0);

    return {
      user: {
        id: user.id.toString(),
        username: user.username || user.firstName || '-',
        tgId: user.tgId.toString(),
        twitterUsername: user.twitterUsername,
      },
      completedQuests: completedActions.map((action) => ({
        questId: action.quest.id.toString(),
        questType: action.quest.type,
        questTitle: action.quest.title,
        questTitleEn: action.quest.titleEn,
        rewardType: action.quest.rewardType,
        rewardAmount: action.reward?.amount?.toString() || action.quest.rewardAmount.toString(),
        rewardAsset: action.quest.rewardAsset,
        completedAt: action.verifiedAt || action.submittedAt,
        twitterId: action.twitterId,
      })),
      summary: {
        totalCompleted: completedActions.length,
        totalReward: totalReward.toFixed(4),
      },
    };
  }

  // ==================== 教程管理 ====================

  // 获取教程列表
  async getTutorials(page: number = 1, pageSize: number = 10, status?: TutorialStatus) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.tutorial.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.tutorial.count({ where }),
    ]);

    return {
      items: items.map((t) => ({
        id: t.id.toString(),
        type: t.type,
        category: t.category,
        title: t.title,
        titleEn: t.titleEn,
        description: t.description,
        descriptionEn: t.descriptionEn,
        coverImage: t.coverImage,
        videoUrl: t.videoUrl,
        icon: t.icon,
        sortOrder: t.sortOrder,
        viewCount: t.viewCount,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取教程详情
  async getTutorialDetail(id: bigint) {
    const tutorial = await this.prisma.tutorial.findUnique({
      where: { id },
    });

    if (!tutorial) {
      throw new BadRequestException('教程不存在');
    }

    return {
      id: tutorial.id.toString(),
      type: tutorial.type,
      category: tutorial.category,
      title: tutorial.title,
      titleEn: tutorial.titleEn,
      description: tutorial.description,
      descriptionEn: tutorial.descriptionEn,
      content: tutorial.content,
      contentEn: tutorial.contentEn,
      coverImage: tutorial.coverImage,
      videoUrl: tutorial.videoUrl,
      images: tutorial.images,
      icon: tutorial.icon,
      sortOrder: tutorial.sortOrder,
      viewCount: tutorial.viewCount,
      status: tutorial.status,
      createdAt: tutorial.createdAt,
      updatedAt: tutorial.updatedAt,
    };
  }

  // 创建教程
  async createTutorial(data: {
    type?: TutorialType;
    category?: string;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    content?: string;
    contentEn?: string;
    coverImage?: string;
    videoUrl?: string;
    images?: string[];
    icon?: string;
    sortOrder?: number;
  }) {
    const tutorial = await this.prisma.tutorial.create({
      data: {
        type: data.type || 'ARTICLE',
        category: data.category || 'other',
        title: data.title,
        titleEn: data.titleEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        content: data.content,
        contentEn: data.contentEn,
        coverImage: data.coverImage,
        videoUrl: data.videoUrl,
        images: data.images || [],
        icon: data.icon || '📖',
        sortOrder: data.sortOrder || 0,
        status: 'DRAFT',
      },
    });

    return {
      id: tutorial.id.toString(),
      message: '教程创建成功',
    };
  }

  // 更新教程
  async updateTutorial(id: bigint, data: {
    type?: TutorialType;
    category?: string;
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    content?: string;
    contentEn?: string;
    coverImage?: string;
    videoUrl?: string;
    images?: string[];
    icon?: string;
    sortOrder?: number;
  }) {
    const tutorial = await this.prisma.tutorial.findUnique({ where: { id } });
    if (!tutorial) {
      throw new BadRequestException('教程不存在');
    }

    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.contentEn !== undefined) updateData.contentEn = data.contentEn;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    await this.prisma.tutorial.update({
      where: { id },
      data: updateData,
    });

    return { message: '教程更新成功' };
  }

  // 更新教程状态
  async updateTutorialStatus(id: bigint, status: TutorialStatus) {
    const tutorial = await this.prisma.tutorial.findUnique({ where: { id } });
    if (!tutorial) {
      throw new BadRequestException('教程不存在');
    }

    await this.prisma.tutorial.update({
      where: { id },
      data: { status },
    });

    return { message: `教程状态已更新为 ${status}` };
  }

  // 删除教程
  async deleteTutorial(id: bigint) {
    const tutorial = await this.prisma.tutorial.findUnique({ where: { id } });
    if (!tutorial) {
      throw new BadRequestException('教程不存在');
    }

    await this.prisma.tutorial.delete({
      where: { id },
    });

    return { message: '教程已删除' };
  }
}
