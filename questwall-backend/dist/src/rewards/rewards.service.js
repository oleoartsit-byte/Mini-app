"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
let RewardsService = class RewardsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyRewards(userId) {
        const rewards = await this.prisma.reward.findMany({
            where: { userId },
            include: {
                quest: {
                    select: { title: true, type: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const summary = {};
        rewards.forEach(reward => {
            const key = reward.asset || reward.type;
            if (!summary[key]) {
                summary[key] = new library_1.Decimal(0);
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
    async getBalance(userId) {
        const rewards = await this.prisma.reward.findMany({
            where: {
                userId,
                status: client_1.RewardStatus.COMPLETED
            }
        });
        const payouts = await this.prisma.payout.findMany({
            where: {
                beneficiaryId: userId,
                status: client_1.PayoutStatus.COMPLETED
            }
        });
        const balances = {};
        rewards.forEach(reward => {
            const key = reward.asset || reward.type;
            if (!balances[key]) {
                balances[key] = new library_1.Decimal(0);
            }
            balances[key] = balances[key].plus(reward.amount);
        });
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
    async withdraw(userId, dto) {
        if (!dto.toAddress || !dto.toAddress.startsWith('EQ') && !dto.toAddress.startsWith('UQ')) {
            throw new common_1.BadRequestException('Invalid TON wallet address');
        }
        const balances = await this.getBalance(userId);
        const assetBalance = balances.find(b => b.asset === dto.asset);
        if (!assetBalance || new library_1.Decimal(assetBalance.amount).lessThan(dto.amount)) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const minWithdraw = this.getMinWithdraw(dto.asset);
        if (new library_1.Decimal(dto.amount).lessThan(minWithdraw)) {
            throw new common_1.BadRequestException(`Minimum withdrawal amount is ${minWithdraw} ${dto.asset}`);
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { walletAddr: dto.toAddress }
        });
        const payout = await this.prisma.payout.create({
            data: {
                beneficiaryId: userId,
                asset: dto.asset,
                amount: new library_1.Decimal(dto.amount),
                toAddress: dto.toAddress,
                status: client_1.PayoutStatus.PENDING
            }
        });
        return {
            success: true,
            payoutId: payout.id.toString(),
            message: 'Withdrawal request submitted',
            estimatedTime: '24 hours'
        };
    }
    async getPayouts(userId) {
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
    async getPayoutStatus(payoutId) {
        const payout = await this.prisma.payout.findUnique({
            where: { id: payoutId }
        });
        if (!payout) {
            throw new common_1.NotFoundException('Payout not found');
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
    async processPayout(payoutId, txHash) {
        const payout = await this.prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: client_1.PayoutStatus.COMPLETED,
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
    getMinWithdraw(asset) {
        const minAmounts = {
            'TON': '0.5',
            'USDT': '5',
            'STARS': '100',
            'POINTS': '1000'
        };
        return new library_1.Decimal(minAmounts[asset] || '1');
    }
    async getLeaderboard(limit = 10) {
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
                avatarUrl: user.avatarUrl,
                avatar: this.getAvatarEmoji(index),
                points: user.points,
                quests: user._count.actions,
            };
        });
    }
    async getUserRank(userId) {
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
    getAvatarEmoji(index) {
        const emojis = ['👑', '⭐', '🏆', '🚀', '⚔️', '💎', '🦄', '🎨', '🎯', '🌟'];
        return emojis[index] || '🎮';
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map