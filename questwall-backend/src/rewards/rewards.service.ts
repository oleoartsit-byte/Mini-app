import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RewardStatus, PayoutStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface WithdrawDto {
  asset: string;
  amount: string;
  toAddress: string;
}

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  // 获取用户的奖励列表
  async getMyRewards(userId: bigint) {
    const rewards = await this.prisma.reward.findMany({
      where: { userId },
      include: {
        quest: {
          select: { title: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 按类型汇总
    const summary: Record<string, Decimal> = {};
    
    rewards.forEach(reward => {
      const key = reward.asset || reward.type;
      if (!summary[key]) {
        summary[key] = new Decimal(0);
      }
      summary[key] = summary[key].plus(reward.amount);
    });

    return {
      items: rewards.map(r => ({
        id: r.id.toString(),
        questId: r.questId.toString(),
        questTitle: r.quest.title,
        questType: r.quest.type,
        type: r.type,
        amount: r.amount.toString(),
        asset: r.asset,
        status: r.status,
        txHash: r.txHash,
        createdAt: r.createdAt
      })),
      total: rewards.length,
      summary: Object.entries(summary).map(([asset, amount]) => ({
        asset,
        amount: amount.toString()
      }))
    };
  }

  // 获取用户余额
  async getBalance(userId: bigint) {
    const rewards = await this.prisma.reward.findMany({
      where: { 
        userId,
        status: RewardStatus.COMPLETED
      }
    });

    const payouts = await this.prisma.payout.findMany({
      where: {
        beneficiaryId: userId,
        status: PayoutStatus.COMPLETED
      }
    });

    // 计算各类资产余额
    const balances: Record<string, Decimal> = {};

    // 加上奖励
    rewards.forEach(reward => {
      const key = reward.asset || reward.type;
      if (!balances[key]) {
        balances[key] = new Decimal(0);
      }
      balances[key] = balances[key].plus(reward.amount);
    });

    // 减去提现
    payouts.forEach(payout => {
      const key = payout.asset;
      if (balances[key]) {
        balances[key] = balances[key].minus(payout.amount);
      }
    });

    return Object.entries(balances).map(([asset, amount]) => ({
      asset,
      amount: amount.toString(),
      available: amount.greaterThan(0)
    }));
  }

  // 发起提现
  async withdraw(userId: bigint, dto: WithdrawDto) {
    // 1. 验证提现地址
    if (!dto.toAddress || !dto.toAddress.startsWith('EQ') && !dto.toAddress.startsWith('UQ')) {
      throw new BadRequestException('Invalid TON wallet address');
    }

    // 2. 检查余额
    const balances = await this.getBalance(userId);
    const assetBalance = balances.find(b => b.asset === dto.asset);
    
    if (!assetBalance || new Decimal(assetBalance.amount).lessThan(dto.amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    // 3. 检查最小提现金额
    const minWithdraw = this.getMinWithdraw(dto.asset);
    if (new Decimal(dto.amount).lessThan(minWithdraw)) {
      throw new BadRequestException(`Minimum withdrawal amount is ${minWithdraw} ${dto.asset}`);
    }

    // 4. 更新用户钱包地址
    await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddr: dto.toAddress }
    });

    // 5. 创建提现记录
    const payout = await this.prisma.payout.create({
      data: {
        beneficiaryId: userId,
        asset: dto.asset,
        amount: new Decimal(dto.amount),
        toAddress: dto.toAddress,
        status: PayoutStatus.PENDING
      }
    });

    return {
      success: true,
      payoutId: payout.id.toString(),
      message: 'Withdrawal request submitted',
      estimatedTime: '24 hours'
    };
  }

  // 获取提现记录
  async getPayouts(userId: bigint) {
    const payouts = await this.prisma.payout.findMany({
      where: { beneficiaryId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return payouts.map(p => ({
      id: p.id.toString(),
      asset: p.asset,
      amount: p.amount.toString(),
      toAddress: p.toAddress,
      status: p.status,
      txHash: p.txHash,
      createdAt: p.createdAt,
      processedAt: p.processedAt
    }));
  }

  // 获取单个提现状态
  async getPayoutStatus(payoutId: bigint) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId }
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return {
      id: payout.id.toString(),
      asset: payout.asset,
      amount: payout.amount.toString(),
      toAddress: payout.toAddress,
      status: payout.status,
      txHash: payout.txHash,
      createdAt: payout.createdAt,
      processedAt: payout.processedAt
    };
  }

  // 处理提现（管理接口）
  async processPayout(payoutId: bigint, txHash: string) {
    const payout = await this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.COMPLETED,
        txHash,
        processedAt: new Date()
      }
    });

    return {
      success: true,
      payoutId: payout.id.toString(),
      txHash: payout.txHash
    };
  }

  // 获取最小提现金额
  private getMinWithdraw(asset: string): Decimal {
    const minAmounts: Record<string, string> = {
      'TON': '0.5',
      'USDT': '5',
      'STARS': '100',
      'POINTS': '1000'
    };
    return new Decimal(minAmounts[asset] || '1');
  }

  // 获取排行榜
  async getLeaderboard(limit: number = 10) {
    // 按用户积分排序
    const users = await this.prisma.user.findMany({
      take: limit,
      orderBy: {
        points: 'desc'
      },
      include: {
        _count: {
          select: { actions: true }
        }
      }
    });

    return users.map((user, index) => {
      return {
        rank: index + 1,
        id: user.id.toString(),
        username: user.username || user.firstName || `用户${user.id}`,
        avatarUrl: user.avatarUrl,  // 用户真实头像
        avatar: this.getAvatarEmoji(index),  // 保留 emoji 作为备用
        points: user.points,
        quests: user._count.actions,
      };
    });
  }

  // 获取用户排名
  async getUserRank(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { actions: true }
        }
      }
    });

    if (!user) {
      return { rank: 0, points: 0, quests: 0 };
    }

    // 计算排名（比当前用户积分高的用户数 + 1）
    const higherRankCount = await this.prisma.user.count({
      where: {
        points: { gt: user.points }
      }
    });

    const rank = higherRankCount + 1;

    return {
      rank,
      points: user.points,
      quests: user._count.actions,
      username: user.username || user.firstName || `用户${user.id}`,
    };
  }

  // 根据排名获取头像 emoji
  private getAvatarEmoji(index: number): string {
    const emojis = ['👑', '⭐', '🏆', '🚀', '⚔️', '💎', '🦄', '🎨', '🎯', '🌟'];
    return emojis[index] || '🎮';
  }
}
