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
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const MIN_WITHDRAW_AMOUNT = 5;
let PayoutService = class PayoutService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalance(userId) {
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
        const checkInPoints = await this.prisma.checkIn.aggregate({
            where: { userId },
            _sum: { points: true },
        });
        const inviterBonus = await this.prisma.invite.aggregate({
            where: { inviterId: userId },
            _sum: { bonus: true },
        });
        const inviteeBonus = await this.prisma.invite.aggregate({
            where: { inviteeId: userId },
            _sum: { inviteeBonus: true },
        });
        const rewardMap = new Map();
        rewards.forEach((r) => {
            rewardMap.set(r.type, parseFloat(r._sum.amount?.toString() || '0'));
        });
        const payoutMap = new Map();
        payouts.forEach((p) => {
            payoutMap.set(p.asset, parseFloat(p._sum.amount?.toString() || '0'));
        });
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
            minWithdrawAmount: MIN_WITHDRAW_AMOUNT,
        };
    }
    async requestWithdraw(userId, asset, amount, toAddress) {
        if (asset !== 'USDT') {
            throw new common_1.BadRequestException('目前只支持 USDT 提现');
        }
        if (amount < MIN_WITHDRAW_AMOUNT) {
            throw new common_1.BadRequestException(`最低提现金额为 ${MIN_WITHDRAW_AMOUNT} USDT`);
        }
        if (!this.isValidAddress('USDT', toAddress)) {
            throw new common_1.BadRequestException('请输入有效的 TRC20 或 ERC20 地址');
        }
        const balanceInfo = await this.getBalance(userId);
        const availableBalance = balanceInfo.balances.usdt;
        if (amount > availableBalance) {
            throw new common_1.BadRequestException(`余额不足，当前可用 ${availableBalance} USDT`);
        }
        const payout = await this.prisma.payout.create({
            data: {
                beneficiaryId: userId,
                asset: 'USDT',
                amount,
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
            actualAmount: amount,
            status: 'PENDING',
            message: '提现申请已提交，请等待审核',
        };
    }
    async getHistory(userId, page = 1, pageSize = 10) {
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
    async getPayoutDetail(userId, payoutId) {
        const payout = await this.prisma.payout.findFirst({
            where: {
                id: payoutId,
                beneficiaryId: userId,
            },
        });
        if (!payout) {
            throw new common_1.BadRequestException('提现记录不存在');
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
    async cancelWithdraw(userId, payoutId) {
        const payout = await this.prisma.payout.findFirst({
            where: {
                id: payoutId,
                beneficiaryId: userId,
            },
        });
        if (!payout) {
            throw new common_1.BadRequestException('提现记录不存在');
        }
        if (payout.status !== 'PENDING') {
            throw new common_1.BadRequestException('只能取消待处理的提现申请');
        }
        await this.prisma.payout.delete({
            where: { id: payoutId },
        });
        return {
            success: true,
            message: '提现申请已取消',
        };
    }
    async getTransactionHistory(userId, page = 1, pageSize = 20) {
        const skip = (page - 1) * pageSize;
        const rewards = await this.prisma.reward.findMany({
            where: { userId, status: 'COMPLETED' },
            include: {
                quest: {
                    select: { title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const checkIns = await this.prisma.checkIn.findMany({
            where: { userId },
            orderBy: { checkedAt: 'desc' },
        });
        const invitesAsInviter = await this.prisma.invite.findMany({
            where: { inviterId: userId },
            orderBy: { createdAt: 'desc' },
        });
        const invitesAsInvitee = await this.prisma.invite.findMany({
            where: { inviteeId: userId },
            orderBy: { createdAt: 'desc' },
        });
        const payouts = await this.prisma.payout.findMany({
            where: { beneficiaryId: userId },
            orderBy: { createdAt: 'desc' },
        });
        const transactions = [
            ...rewards.map((r) => ({
                id: `reward_${r.id}`,
                type: 'REWARD',
                asset: r.type,
                amount: parseFloat(r.amount.toString()),
                direction: 'IN',
                description: `任务奖励: ${r.quest?.title || '未知任务'}`,
                createdAt: r.createdAt,
            })),
            ...checkIns.map((c) => ({
                id: `checkin_${c.id}`,
                type: 'CHECKIN',
                asset: 'USDT',
                amount: c.points,
                direction: 'IN',
                description: c.day > 0 ? `签到第 ${c.day} 天` : '补签',
                createdAt: c.checkedAt,
            })),
            ...invitesAsInviter.map((i) => ({
                id: `invite_${i.id}`,
                type: 'INVITE',
                asset: 'USDT',
                amount: parseFloat(i.bonus.toString()),
                direction: 'IN',
                description: '邀请好友奖励',
                createdAt: i.createdAt,
            })),
            ...invitesAsInvitee.map((i) => ({
                id: `invitee_${i.id}`,
                type: 'INVITE',
                asset: 'USDT',
                amount: parseFloat(i.inviteeBonus.toString()),
                direction: 'IN',
                description: '受邀注册奖励',
                createdAt: i.createdAt,
            })),
            ...payouts.map((p) => ({
                id: `payout_${p.id}`,
                type: 'PAYOUT',
                asset: 'USDT',
                amount: parseFloat(p.amount.toString()),
                direction: 'OUT',
                description: '提现',
                status: p.status,
                txHash: p.txHash,
                createdAt: p.createdAt,
            })),
        ];
        transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const paginatedTransactions = transactions.slice(skip, skip + pageSize);
        return {
            items: paginatedTransactions,
            page,
            pageSize,
            total: transactions.length,
            totalPages: Math.ceil(transactions.length / pageSize),
        };
    }
    isValidAddress(asset, address) {
        if (!address)
            return false;
        switch (asset) {
            case 'TON':
                return ((address.startsWith('EQ') || address.startsWith('UQ')) &&
                    address.length === 48);
            case 'USDT':
                if (address.startsWith('T') && address.length === 34) {
                    return true;
                }
                if (address.startsWith('0x') && address.length === 42) {
                    return true;
                }
                return false;
            default:
                return true;
        }
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayoutService);
//# sourceMappingURL=payout.service.js.map