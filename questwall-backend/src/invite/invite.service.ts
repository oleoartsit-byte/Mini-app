import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

// 默认邀请奖励配置（USDT）
const DEFAULT_INVITER_REWARD = 1; // 邀请人奖励 1 USDT
const DEFAULT_INVITEE_REWARD = 1; // 被邀请人奖励 1 USDT
const DEFAULT_MAX_INVITES = 100; // 最大邀请数

// 风控配置
const RISK_CONFIG = {
  // 短时间内邀请数量阈值
  SHORT_TIME_WINDOW_MINUTES: 60,  // 1小时内
  SHORT_TIME_MAX_INVITES: 10,     // 最多10个邀请

  // 每日邀请限制
  DAILY_MAX_INVITES: 20,          // 每天最多20个邀请

  // 新账号限制（账号创建后多久才能获得邀请奖励）
  NEW_ACCOUNT_WAIT_HOURS: 24,     // 新账号24小时内被邀请不给奖励

  // 可疑行为阈值
  SUSPICIOUS_INVITE_RATE: 5,      // 5分钟内超过这个数量视为可疑
  SUSPICIOUS_TIME_WINDOW_MINUTES: 5,
};

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  // ==================== 风控检测 ====================

  /**
   * 检查邀请人是否存在异常行为
   * 返回风险评估结果
   */
  async checkInviterRisk(inviterId: bigint): Promise<{
    allowed: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    reason?: string;
    shouldRecordEvent: boolean;
  }> {
    const now = new Date();

    // 1. 检查5分钟内的邀请数量（可疑行为检测）
    const fiveMinutesAgo = new Date(now.getTime() - RISK_CONFIG.SUSPICIOUS_TIME_WINDOW_MINUTES * 60 * 1000);
    const recentFiveMinInvites = await this.prisma.invite.count({
      where: {
        inviterId,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (recentFiveMinInvites >= RISK_CONFIG.SUSPICIOUS_INVITE_RATE) {
      console.log(`🚨 高风险: 用户 ${inviterId} 在5分钟内邀请了 ${recentFiveMinInvites} 人`);
      return {
        allowed: false,
        riskLevel: 'high',
        reason: '操作过于频繁，请稍后再试',
        shouldRecordEvent: true,
      };
    }

    // 2. 检查1小时内的邀请数量
    const oneHourAgo = new Date(now.getTime() - RISK_CONFIG.SHORT_TIME_WINDOW_MINUTES * 60 * 1000);
    const recentHourInvites = await this.prisma.invite.count({
      where: {
        inviterId,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentHourInvites >= RISK_CONFIG.SHORT_TIME_MAX_INVITES) {
      console.log(`⚠️ 中风险: 用户 ${inviterId} 在1小时内邀请了 ${recentHourInvites} 人`);
      return {
        allowed: false,
        riskLevel: 'medium',
        reason: '邀请过于频繁，请1小时后再试',
        shouldRecordEvent: true,
      };
    }

    // 3. 检查今日邀请数量
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayInvites = await this.prisma.invite.count({
      where: {
        inviterId,
        createdAt: { gte: todayStart },
      },
    });

    if (todayInvites >= RISK_CONFIG.DAILY_MAX_INVITES) {
      console.log(`⚠️ 达到每日上限: 用户 ${inviterId} 今日已邀请 ${todayInvites} 人`);
      return {
        allowed: false,
        riskLevel: 'medium',
        reason: `今日邀请已达上限（${RISK_CONFIG.DAILY_MAX_INVITES}人），请明天再试`,
        shouldRecordEvent: false,
      };
    }

    return {
      allowed: true,
      riskLevel: 'low',
      shouldRecordEvent: false,
    };
  }

  /**
   * 检查被邀请人是否是新账号（可能是刷子账号）
   */
  async checkInviteeRisk(inviteeId: bigint): Promise<{
    isNewAccount: boolean;
    shouldDelayReward: boolean;
    accountAgeHours: number;
  }> {
    const invitee = await this.prisma.user.findUnique({
      where: { id: inviteeId },
      select: { createdAt: true },
    });

    if (!invitee) {
      return { isNewAccount: true, shouldDelayReward: true, accountAgeHours: 0 };
    }

    const accountAgeMs = Date.now() - invitee.createdAt.getTime();
    const accountAgeHours = accountAgeMs / (1000 * 60 * 60);

    const isNewAccount = accountAgeHours < RISK_CONFIG.NEW_ACCOUNT_WAIT_HOURS;

    return {
      isNewAccount,
      shouldDelayReward: isNewAccount,
      accountAgeHours: Math.floor(accountAgeHours),
    };
  }

  /**
   * 记录风控事件
   */
  async recordRiskEvent(
    userId: bigint,
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any
  ) {
    try {
      await this.prisma.riskEvent.create({
        data: {
          userId,
          eventType,
          severity,
          details,
        },
      });
      console.log(`📝 风控事件已记录: ${eventType} - ${severity}`);
    } catch (error) {
      console.error('记录风控事件失败:', error);
    }
  }

  // 获取邀请配置
  async getConfig() {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'invite_config' },
    });

    if (config?.value) {
      const val = config.value as any;
      return {
        inviterReward: val.inviterReward || DEFAULT_INVITER_REWARD,
        inviteeReward: val.inviteeReward || DEFAULT_INVITEE_REWARD,
        maxInvites: val.maxInvites || DEFAULT_MAX_INVITES,
      };
    }

    return {
      inviterReward: DEFAULT_INVITER_REWARD,
      inviteeReward: DEFAULT_INVITEE_REWARD,
      maxInvites: DEFAULT_MAX_INVITES,
    };
  }

  // 获取用户邀请状态
  async getStatus(userId: bigint) {
    const config = await this.getConfig();

    // 获取邀请记录
    const invites = await this.prisma.invite.findMany({
      where: { inviterId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // 获取被邀请人信息
    const inviteeIds = invites.map((i) => i.inviteeId);
    const invitees = await this.prisma.user.findMany({
      where: { id: { in: inviteeIds } },
      select: { id: true, username: true, firstName: true, createdAt: true },
    });

    const inviteeMap = new Map(invitees.map((u) => [u.id.toString(), u]));

    // 计算邀请奖励（初始邀请奖励，每人10 Stars）
    // 只统计实际发放的奖励（bonus > 0 的记录）
    const inviteBonus = invites.reduce((sum, i) => {
      // inviteeBonus 和 bonus 初始值相同，如果 inviteeBonus > 0 说明奖励已发放
      const initialBonus = parseFloat(i.inviteeBonus.toString());
      return sum + (initialBonus > 0 ? config.inviterReward : 0);
    }, 0);

    // 返佣奖励暂时设为0（后续如需实现返佣功能，需要修改数据库 schema）
    // TODO: 返佣功能需要单独的表或将 Reward.questId 改为可选
    const commissionBonus = 0;

    // 总奖励 = 邀请奖励 + 返佣
    const totalBonus = inviteBonus + commissionBonus;

    // 生成邀请链接
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tgId: true },
    });

    const botUsername = process.env.BOT_USERNAME || 'questwall_test_bot';
    // 使用 Bot 深度链接格式，Bot 会处理 /start 命令并引导用户打开 Mini App
    const inviteLink = `https://t.me/${botUsername}?start=ref_${user?.tgId}`;

    return {
      inviteCount: invites.length,
      totalBonus,
      inviteBonus,        // 邀请奖励（Stars）
      commissionBonus,    // 返佣奖励（USDT）
      remainingInvites: config.maxInvites - invites.length,
      inviteLink,
      config,
      invitedUsers: invites.map((i) => {
        const invitee = inviteeMap.get(i.inviteeId.toString());
        return {
          id: i.inviteeId.toString(),
          username: invitee?.username || invitee?.firstName || `User${i.inviteeId}`,
          bonus: parseFloat(i.inviteeBonus.toString()) > 0 ? config.inviterReward : 0, // 邀请奖励
          invitedAt: i.createdAt,
        };
      }),
    };
  }

  // 处理邀请（被邀请人调用）
  async processInvite(inviteeId: bigint, inviterTgId: string) {
    const config = await this.getConfig();

    // 查找邀请人
    const inviter = await this.prisma.user.findUnique({
      where: { tgId: BigInt(inviterTgId) },
    });

    if (!inviter) {
      throw new BadRequestException('邀请人不存在');
    }

    // 检查是否自己邀请自己
    if (inviter.id === inviteeId) {
      throw new BadRequestException('不能邀请自己');
    }

    // 检查是否已经被邀请过
    const existingInvite = await this.prisma.invite.findUnique({
      where: { inviteeId },
    });

    if (existingInvite) {
      throw new BadRequestException('该用户已被邀请过');
    }

    // 检查邀请人是否达到邀请上限
    const inviteCount = await this.prisma.invite.count({
      where: { inviterId: inviter.id },
    });

    if (inviteCount >= config.maxInvites) {
      throw new BadRequestException('邀请人已达到邀请上限');
    }

    // ========== 风控检测 ==========
    // 1. 检查邀请人是否存在异常行为
    const inviterRisk = await this.checkInviterRisk(inviter.id);
    if (!inviterRisk.allowed) {
      // 记录风控事件
      if (inviterRisk.shouldRecordEvent) {
        await this.recordRiskEvent(inviter.id, 'invite_rate_limit', inviterRisk.riskLevel, {
          action: 'invite_blocked',
          reason: inviterRisk.reason,
          inviteeId: inviteeId.toString(),
        });
      }
      throw new BadRequestException(inviterRisk.reason || '邀请失败，请稍后再试');
    }

    // 2. 检查被邀请人账号风险
    const inviteeRisk = await this.checkInviteeRisk(inviteeId);

    // 根据被邀请人账号年龄决定是否发放奖励
    let actualInviterReward = config.inviterReward;
    let actualInviteeReward = config.inviteeReward;
    let rewardDelayed = false;

    if (inviteeRisk.shouldDelayReward) {
      // 新账号暂不发放奖励（设为0），后续可以通过定时任务补发
      actualInviterReward = 0;
      actualInviteeReward = 0;
      rewardDelayed = true;
      console.log(`⏳ 新账号邀请: 被邀请人账号仅 ${inviteeRisk.accountAgeHours} 小时，奖励暂缓发放`);
    }

    // 获取被邀请人信息（用于通知）
    const invitee = await this.prisma.user.findUnique({
      where: { id: inviteeId },
      select: { username: true, firstName: true },
    });
    const inviteeName = invitee?.username || invitee?.firstName || '新用户';

    // 创建邀请记录（同时记录邀请人和被邀请人的奖励）
    const result = await this.prisma.$transaction(async (tx) => {
      const invite = await tx.invite.create({
        data: {
          inviterId: inviter.id,
          inviteeId,
          bonus: actualInviterReward,        // 邀请人奖励（可能为0）
          inviteeBonus: actualInviteeReward, // 被邀请人奖励（可能为0）
        },
      });

      return {
        invite,
        inviterReward: actualInviterReward,
        inviteeReward: actualInviteeReward,
      };
    });

    // 发送 TG 通知给邀请人
    try {
      await this.telegramService.sendInviteSuccessNotification(
        inviter.tgId,
        inviteeName,
        rewardDelayed ? 0 : result.inviterReward,
      );
      console.log(`📤 邀请成功通知已发送给用户 ${inviter.tgId}`);
    } catch (error) {
      console.error('发送邀请通知失败:', error);
      // 通知失败不影响邀请逻辑
    }

    // 根据是否延迟奖励返回不同的消息
    if (rewardDelayed) {
      return {
        success: true,
        inviterReward: 0,
        inviteeReward: 0,
        rewardDelayed: true,
        message: '邀请成功！奖励将在24小时后发放（新用户验证期）',
      };
    }

    return {
      success: true,
      inviterReward: result.inviterReward,
      inviteeReward: result.inviteeReward,
      rewardDelayed: false,
      message: `邀请成功！邀请人获得 ${result.inviterReward} Stars，您获得 ${result.inviteeReward} Stars`,
    };
  }

  // 验证邀请码
  async validateInviteCode(inviteCode: string) {
    // 邀请码格式：ref_<tgId>
    if (!inviteCode.startsWith('ref_')) {
      return { valid: false, message: '无效的邀请码格式' };
    }

    const tgId = inviteCode.replace('ref_', '');

    // 查找邀请人
    const inviter = await this.prisma.user.findUnique({
      where: { tgId: BigInt(tgId) },
      select: { id: true, username: true, firstName: true },
    });

    if (!inviter) {
      return { valid: false, message: '邀请人不存在' };
    }

    // 检查邀请人是否达到上限
    const config = await this.getConfig();
    const inviteCount = await this.prisma.invite.count({
      where: { inviterId: inviter.id },
    });

    if (inviteCount >= config.maxInvites) {
      return { valid: false, message: '邀请人已达到邀请上限' };
    }

    return {
      valid: true,
      inviter: {
        id: inviter.id.toString(),
        username: inviter.username || inviter.firstName,
      },
      rewards: {
        inviterReward: config.inviterReward,
        inviteeReward: config.inviteeReward,
      },
    };
  }

  // 获取邀请排行榜
  async getLeaderboard(limit = 10) {
    const result = await this.prisma.invite.groupBy({
      by: ['inviterId'],
      _count: { id: true },
      _sum: { bonus: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // 获取用户信息
    const userIds = result.map((r) => r.inviterId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, firstName: true },
    });

    const userMap = new Map(users.map((u) => [u.id.toString(), u]));

    return result.map((r, index) => {
      const user = userMap.get(r.inviterId.toString());
      return {
        rank: index + 1,
        userId: r.inviterId.toString(),
        username: user?.username || user?.firstName || `User${r.inviterId}`,
        inviteCount: r._count.id,
        totalBonus: parseFloat(r._sum.bonus?.toString() || '0'),
      };
    });
  }
}
