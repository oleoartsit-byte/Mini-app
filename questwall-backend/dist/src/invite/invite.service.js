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
exports.InviteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_INVITER_REWARD = 1;
const DEFAULT_INVITEE_REWARD = 1;
const DEFAULT_MAX_INVITES = 100;
const RISK_CONFIG = {
    SHORT_TIME_WINDOW_MINUTES: 60,
    SHORT_TIME_MAX_INVITES: 10,
    DAILY_MAX_INVITES: 20,
    NEW_ACCOUNT_WAIT_HOURS: 24,
    SUSPICIOUS_INVITE_RATE: 5,
    SUSPICIOUS_TIME_WINDOW_MINUTES: 5,
};
let InviteService = class InviteService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkInviterRisk(inviterId) {
        const now = new Date();
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
    async checkInviteeRisk(inviteeId) {
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
    async recordRiskEvent(userId, eventType, severity, details) {
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
        }
        catch (error) {
            console.error('记录风控事件失败:', error);
        }
    }
    async getConfig() {
        const config = await this.prisma.systemConfig.findUnique({
            where: { key: 'invite_config' },
        });
        if (config?.value) {
            const val = config.value;
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
    async getStatus(userId) {
        const config = await this.getConfig();
        const invites = await this.prisma.invite.findMany({
            where: { inviterId: userId },
            orderBy: { createdAt: 'desc' },
        });
        const inviteeIds = invites.map((i) => i.inviteeId);
        const invitees = await this.prisma.user.findMany({
            where: { id: { in: inviteeIds } },
            select: { id: true, username: true, firstName: true, createdAt: true },
        });
        const inviteeMap = new Map(invitees.map((u) => [u.id.toString(), u]));
        const inviteBonus = invites.reduce((sum, i) => {
            const initialBonus = parseFloat(i.inviteeBonus.toString());
            return sum + (initialBonus > 0 ? config.inviterReward : 0);
        }, 0);
        const commissionBonus = 0;
        const totalBonus = inviteBonus + commissionBonus;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { tgId: true },
        });
        const botUsername = process.env.BOT_USERNAME || 'questwall_test_bot';
        const inviteLink = `https://t.me/${botUsername}?start=ref_${user?.tgId}`;
        return {
            inviteCount: invites.length,
            totalBonus,
            inviteBonus,
            commissionBonus,
            remainingInvites: config.maxInvites - invites.length,
            inviteLink,
            config,
            invitedUsers: invites.map((i) => {
                const invitee = inviteeMap.get(i.inviteeId.toString());
                return {
                    id: i.inviteeId.toString(),
                    username: invitee?.username || invitee?.firstName || `User${i.inviteeId}`,
                    bonus: parseFloat(i.inviteeBonus.toString()) > 0 ? config.inviterReward : 0,
                    invitedAt: i.createdAt,
                };
            }),
        };
    }
    async processInvite(inviteeId, inviterTgId) {
        const config = await this.getConfig();
        const inviter = await this.prisma.user.findUnique({
            where: { tgId: BigInt(inviterTgId) },
        });
        if (!inviter) {
            throw new common_1.BadRequestException('邀请人不存在');
        }
        if (inviter.id === inviteeId) {
            throw new common_1.BadRequestException('不能邀请自己');
        }
        const existingInvite = await this.prisma.invite.findUnique({
            where: { inviteeId },
        });
        if (existingInvite) {
            throw new common_1.BadRequestException('该用户已被邀请过');
        }
        const inviteCount = await this.prisma.invite.count({
            where: { inviterId: inviter.id },
        });
        if (inviteCount >= config.maxInvites) {
            throw new common_1.BadRequestException('邀请人已达到邀请上限');
        }
        const inviterRisk = await this.checkInviterRisk(inviter.id);
        if (!inviterRisk.allowed) {
            if (inviterRisk.shouldRecordEvent) {
                await this.recordRiskEvent(inviter.id, 'invite_rate_limit', inviterRisk.riskLevel, {
                    action: 'invite_blocked',
                    reason: inviterRisk.reason,
                    inviteeId: inviteeId.toString(),
                });
            }
            throw new common_1.BadRequestException(inviterRisk.reason || '邀请失败，请稍后再试');
        }
        const inviteeRisk = await this.checkInviteeRisk(inviteeId);
        let actualInviterReward = config.inviterReward;
        let actualInviteeReward = config.inviteeReward;
        let rewardDelayed = false;
        if (inviteeRisk.shouldDelayReward) {
            actualInviterReward = 0;
            actualInviteeReward = 0;
            rewardDelayed = true;
            console.log(`⏳ 新账号邀请: 被邀请人账号仅 ${inviteeRisk.accountAgeHours} 小时，奖励暂缓发放`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const invite = await tx.invite.create({
                data: {
                    inviterId: inviter.id,
                    inviteeId,
                    bonus: actualInviterReward,
                    inviteeBonus: actualInviteeReward,
                },
            });
            return {
                invite,
                inviterReward: actualInviterReward,
                inviteeReward: actualInviteeReward,
            };
        });
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
    async validateInviteCode(inviteCode) {
        if (!inviteCode.startsWith('ref_')) {
            return { valid: false, message: '无效的邀请码格式' };
        }
        const tgId = inviteCode.replace('ref_', '');
        const inviter = await this.prisma.user.findUnique({
            where: { tgId: BigInt(tgId) },
            select: { id: true, username: true, firstName: true },
        });
        if (!inviter) {
            return { valid: false, message: '邀请人不存在' };
        }
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
    async getLeaderboard(limit = 10) {
        const result = await this.prisma.invite.groupBy({
            by: ['inviterId'],
            _count: { id: true },
            _sum: { bonus: true },
            orderBy: { _count: { id: 'desc' } },
            take: limit,
        });
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
};
exports.InviteService = InviteService;
exports.InviteService = InviteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InviteService);
//# sourceMappingURL=invite.service.js.map