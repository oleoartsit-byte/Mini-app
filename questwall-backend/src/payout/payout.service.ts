import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 提现配置 - 只支持 USDT
const MIN_WITHDRAW_AMOUNT = 5; // 最低提现金额

@Injectable()
export class PayoutService {
  constructor(private prisma: PrismaService) {}

  // 获取用户余额
  async getBalance(userId: bigint) {
    // 获取用户奖励汇总
    const rewards = await this.prisma.reward.groupBy({
      by: ['type'],
      where: {
        userId,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    // 获取用户已提现金额
    const payouts = await this.prisma.payout.groupBy({
      by: ['asset'],
      where: {
        beneficiaryId: userId,
        status: { in: ['COMPLETED', 'PROCESSING', 'PENDING'] },
      },
      _sum: {
        amount: true,
      },
    });

    // 获取签到积分
    const checkInPoints = await this.prisma.checkIn.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    // 获取邀请奖励（作为邀请人）
    const inviterBonus = await this.prisma.invite.aggregate({
      where: { inviterId: userId },
      _sum: { bonus: true },
    });

    // 获取被邀请奖励（作为被邀请人）
    const inviteeBonus = await this.prisma.invite.aggregate({
      where: { inviteeId: userId },
      _sum: { inviteeBonus: true },
    });

    // 计算可用余额
    const rewardMap = new Map<string, number>();
    rewards.forEach((r) => {
      rewardMap.set(r.type, parseFloat(r._sum.amount?.toString() || '0'));
    });

    const payoutMap = new Map<string, number>();
    payouts.forEach((p) => {
      payoutMap.set(p.asset, parseFloat(p._sum.amount?.toString() || '0'));
    });

    // Stars = 任务奖励 + 签到积分 + 邀请奖励(邀请人+被邀请人) - 已提现
    const starsFromRewards = rewardMap.get('STARS') || 0;
    const starsFromCheckIn = checkInPoints._sum.points || 0;
    const starsFromInviter = parseFloat(inviterBonus._sum.bonus?.toString() || '0');
    const starsFromInvitee = parseFloat(inviteeBonus._sum.inviteeBonus?.toString() || '0');
    const starsFromInvite = starsFromInviter + starsFromInvitee;
    const starsWithdrawn = payoutMap.get('STARS') || 0;

    const balances = {
      stars: Math.max(0, starsFromRewards + starsFromCheckIn + starsFromInvite - starsWithdrawn),
      ton: Math.max(0, (rewardMap.get('TON') || 0) - (payoutMap.get('TON') || 0)),
      usdt: Math.max(0, (rewardMap.get('USDT') || 0) - (payoutMap.get('USDT') || 0)),
      points: rewardMap.get('POINTS') || 0,
    };

    return {
      balances,
      minWithdrawAmount: MIN_WITHDRAW_AMOUNT, // 只支持 USDT，最低 5 USDT
    };
  }

  // 申请提现 - 只支持 USDT
  async requestWithdraw(
    userId: bigint,
    asset: 'STARS' | 'TON' | 'USDT',
    amount: number,
    toAddress: string,
  ) {
    // 只支持 USDT 提现
    if (asset !== 'USDT') {
      throw new BadRequestException('目前只支持 USDT 提现');
    }

    // 验证提现金额
    if (amount < MIN_WITHDRAW_AMOUNT) {
      throw new BadRequestException(
        `最低提现金额为 ${MIN_WITHDRAW_AMOUNT} USDT`,
      );
    }

    // 验证地址格式 (TRC20 或 ERC20)
    if (!this.isValidAddress('USDT', toAddress)) {
      throw new BadRequestException('请输入有效的 TRC20 或 ERC20 地址');
    }

    // 获取用户余额
    const balanceInfo = await this.getBalance(userId);
    const availableBalance = balanceInfo.balances.usdt;

    if (amount > availableBalance) {
      throw new BadRequestException(
        `余额不足，当前可用 ${availableBalance} USDT`,
      );
    }

    // 创建提现记录 - 状态为 PENDING，等待人工审核（无手续费）
    const payout = await this.prisma.payout.create({
      data: {
        beneficiaryId: userId,
        asset: 'USDT',
        amount, // 无手续费，全额提现
        toAddress,
        status: 'PENDING',
      },
    });

    console.log(`📤 新提现申请: 用户 ${userId}, 金额 ${amount} USDT, 地址 ${toAddress}`);

    return {
      success: true,
      payoutId: payout.id.toString(),
      asset: 'USDT',
      requestedAmount: amount,
      actualAmount: amount, // 无手续费
      status: 'PENDING',
      message: '提现申请已提交，请等待审核',
    };
  }

  // 获取提现历史
  async getHistory(userId: bigint, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where: { beneficiaryId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.payout.count({
        where: { beneficiaryId: userId },
      }),
    ]);

    return {
      items: payouts.map((p) => ({
        id: p.id.toString(),
        asset: p.asset,
        amount: parseFloat(p.amount.toString()),
        toAddress: p.toAddress,
        status: p.status,
        txHash: p.txHash,
        createdAt: p.createdAt,
        processedAt: p.processedAt,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取提现详情
  async getPayoutDetail(userId: bigint, payoutId: bigint) {
    const payout = await this.prisma.payout.findFirst({
      where: {
        id: payoutId,
        beneficiaryId: userId,
      },
    });

    if (!payout) {
      throw new BadRequestException('提现记录不存在');
    }

    return {
      id: payout.id.toString(),
      asset: payout.asset,
      amount: parseFloat(payout.amount.toString()),
      toAddress: payout.toAddress,
      status: payout.status,
      txHash: payout.txHash,
      createdAt: payout.createdAt,
      processedAt: payout.processedAt,
    };
  }

  // 取消提现（仅限 PENDING 状态）
  async cancelWithdraw(userId: bigint, payoutId: bigint) {
    const payout = await this.prisma.payout.findFirst({
      where: {
        id: payoutId,
        beneficiaryId: userId,
      },
    });

    if (!payout) {
      throw new BadRequestException('提现记录不存在');
    }

    if (payout.status !== 'PENDING') {
      throw new BadRequestException('只能取消待处理的提现申请');
    }

    await this.prisma.payout.delete({
      where: { id: payoutId },
    });

    return {
      success: true,
      message: '提现申请已取消',
    };
  }

  // 获取交易历史（只包含提现记录）
  async getTransactionHistory(userId: bigint, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    // 获取提现记录
    const payouts = await this.prisma.payout.findMany({
      where: { beneficiaryId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // 交易历史只包含提现记录
    const transactions = payouts.map((p) => ({
      id: `payout_${p.id}`,
      type: 'PAYOUT' as const,
      asset: 'USDT',
      amount: parseFloat(p.amount.toString()),
      direction: 'OUT' as const,
      description: '提现',
      status: p.status,
      txHash: p.txHash,
      createdAt: p.createdAt,
    }));

    // 分页
    const paginatedTransactions = transactions.slice(skip, skip + pageSize);

    return {
      items: paginatedTransactions,
      page,
      pageSize,
      total: transactions.length,
      totalPages: Math.ceil(transactions.length / pageSize),
    };
  }

  // 获取奖励记录（签到、任务、邀请奖励）
  async getRewardHistory(userId: bigint, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    // 获取任务奖励记录
    const rewards = await this.prisma.reward.findMany({
      where: { userId, status: 'COMPLETED' },
      include: {
        quest: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 获取签到记录
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { checkedAt: 'desc' },
    });

    // 获取邀请奖励（作为邀请人）
    const invitesAsInviter = await this.prisma.invite.findMany({
      where: { inviterId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // 获取被邀请奖励（作为被邀请人）
    const invitesAsInvitee = await this.prisma.invite.findMany({
      where: { inviteeId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // 合并所有奖励记录
    const allRewards = [
      ...rewards.map((r) => ({
        id: `reward_${r.id}`,
        type: 'quest' as const,
        title: `任务奖励: ${r.quest?.title || '未知任务'}`,
        amount: parseFloat(r.amount.toString()),
        currency: r.type,
        createdAt: r.createdAt,
      })),
      ...checkIns.map((c) => ({
        id: `checkin_${c.id}`,
        type: 'checkin' as const,
        title: `签到奖励 ${new Date(c.checkedAt).toLocaleDateString('zh-CN')}`,
        amount: c.points,
        currency: 'USDT',
        createdAt: c.checkedAt,
      })),
      ...invitesAsInviter.map((i) => ({
        id: `invite_${i.id}`,
        type: 'invite' as const,
        title: '邀请好友奖励',
        amount: parseFloat(i.bonus.toString()),
        currency: 'USDT',
        createdAt: i.createdAt,
      })),
      ...invitesAsInvitee.map((i) => ({
        id: `invitee_${i.id}`,
        type: 'invite' as const,
        title: '受邀注册奖励',
        amount: parseFloat(i.inviteeBonus.toString()),
        currency: 'USDT',
        createdAt: i.createdAt,
      })),
    ];

    // 按时间排序
    allRewards.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // 分页
    const paginatedRewards = allRewards.slice(skip, skip + pageSize);

    return {
      items: paginatedRewards,
      page,
      pageSize,
      total: allRewards.length,
      totalPages: Math.ceil(allRewards.length / pageSize),
    };
  }

  // 验证地址格式
  private isValidAddress(asset: string, address: string): boolean {
    if (!address) return false;

    switch (asset) {
      case 'TON':
        // TON 地址格式验证
        return (
          (address.startsWith('EQ') || address.startsWith('UQ')) &&
          address.length === 48
        );
      case 'USDT':
        // TRC20 或 ERC20 地址
        if (address.startsWith('T') && address.length === 34) {
          return true; // TRC20
        }
        if (address.startsWith('0x') && address.length === 42) {
          return true; // ERC20
        }
        return false;
      default:
        return true;
    }
  }
}
