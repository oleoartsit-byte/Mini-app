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
exports.RiskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const RISK_CONFIG = {
    rateLimit: {
        questClaimPerMinute: 5,
        questClaimPerHour: 20,
        questClaimPerDay: 50,
    },
    threshold: {
        warning: 50,
        block: 80,
    },
    weights: {
        multipleDevices: 15,
        multipleUsersOnDevice: 25,
        vpnProxy: 20,
        highFrequency: 30,
        suspiciousPattern: 25,
        newAccount: 10,
    }
};
let RiskService = class RiskService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitFingerprint(userId, fpDto, ip) {
        const { visitorId, userAgent, platform, screenRes, timezone, language, fingerprint } = fpDto;
        const isDeviceBlocked = await this.isBlocked('DEVICE', visitorId);
        if (isDeviceBlocked) {
            await this.logRiskEvent({
                userId,
                eventType: 'blocked_device_access',
                severity: 'high',
                details: { visitorId },
                ip,
                visitorId,
            });
            return { success: false, blocked: true, reason: '设备已被封禁' };
        }
        await this.prisma.deviceFingerprint.upsert({
            where: { visitorId_userId: { visitorId, userId } },
            update: {
                userAgent,
                platform,
                screenRes,
                timezone,
                language,
                fingerprint: fingerprint || {},
                lastSeenAt: new Date(),
            },
            create: {
                visitorId,
                userId,
                userAgent,
                platform,
                screenRes,
                timezone,
                language,
                fingerprint: fingerprint || {},
            },
        });
        const usersOnDevice = await this.prisma.deviceFingerprint.count({
            where: { visitorId },
        });
        if (usersOnDevice > 3) {
            await this.logRiskEvent({
                userId,
                eventType: 'multiple_users_on_device',
                severity: usersOnDevice > 5 ? 'high' : 'medium',
                details: { visitorId, userCount: usersOnDevice },
                ip,
                visitorId,
            });
        }
        if (ip) {
            await this.recordIp(userId, ip);
        }
        return {
            success: true,
            message: '设备指纹已提交',
            riskIndicators: {
                usersOnDevice,
                isNew: usersOnDevice === 1,
            },
        };
    }
    async recordIp(userId, ip) {
        const isIpBlocked = await this.isBlocked('IP', ip);
        if (isIpBlocked) {
            await this.logRiskEvent({
                userId,
                eventType: 'blocked_ip_access',
                severity: 'high',
                details: { ip },
                ip,
            });
            return { blocked: true };
        }
        await this.prisma.ipRecord.upsert({
            where: { ip_userId: { ip, userId } },
            update: {
                requestCount: { increment: 1 },
                lastSeenAt: new Date(),
            },
            create: {
                ip,
                userId,
                requestCount: 1,
            },
        });
        const usersOnIp = await this.prisma.ipRecord.count({
            where: { ip },
        });
        if (usersOnIp > 5) {
            await this.logRiskEvent({
                userId,
                eventType: 'multiple_users_on_ip',
                severity: usersOnIp > 10 ? 'high' : 'medium',
                details: { ip, userCount: usersOnIp },
                ip,
            });
        }
        return { blocked: false, usersOnIp };
    }
    async getRiskScore(userId) {
        let score = 0;
        const factors = [];
        const deviceCount = await this.prisma.deviceFingerprint.count({
            where: { userId },
        });
        if (deviceCount > 3) {
            score += RISK_CONFIG.weights.multipleDevices;
            factors.push(`多设备登录(${deviceCount}台)`);
        }
        const devices = await this.prisma.deviceFingerprint.findMany({
            where: { userId },
            select: { visitorId: true },
        });
        for (const device of devices) {
            const usersOnDevice = await this.prisma.deviceFingerprint.count({
                where: { visitorId: device.visitorId },
            });
            if (usersOnDevice > 1) {
                score += RISK_CONFIG.weights.multipleUsersOnDevice;
                factors.push(`设备多用户(${usersOnDevice}人)`);
                break;
            }
        }
        const ips = await this.prisma.ipRecord.findMany({
            where: { userId },
            select: { ip: true },
        });
        for (const ipRecord of ips) {
            const usersOnIp = await this.prisma.ipRecord.count({
                where: { ip: ipRecord.ip },
            });
            if (usersOnIp > 5) {
                score += RISK_CONFIG.weights.vpnProxy;
                factors.push(`IP多用户(${usersOnIp}人)`);
                break;
            }
        }
        const recentActions = await this.prisma.action.count({
            where: {
                userId,
                createdAt: { gte: new Date(Date.now() - 3600000) },
            },
        });
        if (recentActions > RISK_CONFIG.rateLimit.questClaimPerHour) {
            score += RISK_CONFIG.weights.highFrequency;
            factors.push(`高频操作(${recentActions}次/小时)`);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { createdAt: true },
        });
        if (user) {
            const accountAge = Date.now() - user.createdAt.getTime();
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (accountAge < oneDayMs) {
                score += RISK_CONFIG.weights.newAccount;
                factors.push('新账号(<24小时)');
            }
        }
        const riskEventCount = await this.prisma.riskEvent.count({
            where: {
                userId,
                severity: { in: ['high', 'critical'] },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600000) },
            },
        });
        if (riskEventCount > 0) {
            score += riskEventCount * 5;
            factors.push(`风险事件(${riskEventCount}次)`);
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { riskScore: Math.min(score, 100) },
        });
        return {
            userId: userId.toString(),
            score: Math.min(score, 100),
            level: score >= RISK_CONFIG.threshold.block ? 'high'
                : score >= RISK_CONFIG.threshold.warning ? 'medium'
                    : 'low',
            factors,
            shouldBlock: score >= RISK_CONFIG.threshold.block,
        };
    }
    async checkRateLimit(userId, action) {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const oneDayAgo = new Date(now.getTime() - 86400000);
        if (action === 'quest_claim') {
            const minuteCount = await this.prisma.action.count({
                where: { userId, createdAt: { gte: oneMinuteAgo } },
            });
            if (minuteCount >= RISK_CONFIG.rateLimit.questClaimPerMinute) {
                await this.logRiskEvent({
                    userId,
                    eventType: 'rate_limit_minute',
                    severity: 'medium',
                    details: { action, count: minuteCount, limit: RISK_CONFIG.rateLimit.questClaimPerMinute },
                });
                return { allowed: false, reason: '操作太频繁，请稍后再试' };
            }
            const hourCount = await this.prisma.action.count({
                where: { userId, createdAt: { gte: oneHourAgo } },
            });
            if (hourCount >= RISK_CONFIG.rateLimit.questClaimPerHour) {
                await this.logRiskEvent({
                    userId,
                    eventType: 'rate_limit_hour',
                    severity: 'medium',
                    details: { action, count: hourCount, limit: RISK_CONFIG.rateLimit.questClaimPerHour },
                });
                return { allowed: false, reason: '今日领取任务数已达上限' };
            }
            const dayCount = await this.prisma.action.count({
                where: { userId, createdAt: { gte: oneDayAgo } },
            });
            if (dayCount >= RISK_CONFIG.rateLimit.questClaimPerDay) {
                await this.logRiskEvent({
                    userId,
                    eventType: 'rate_limit_day',
                    severity: 'low',
                    details: { action, count: dayCount, limit: RISK_CONFIG.rateLimit.questClaimPerDay },
                });
                return { allowed: false, reason: '今日领取任务数已达上限' };
            }
        }
        return { allowed: true };
    }
    async checkRisk(context) {
        const { userId, ip, visitorId, action } = context;
        if (userId) {
            const isUserBlocked = await this.isBlocked('USER', userId.toString());
            if (isUserBlocked) {
                return { allowed: false, reason: '账号已被封禁' };
            }
        }
        if (visitorId) {
            const isDeviceBlocked = await this.isBlocked('DEVICE', visitorId);
            if (isDeviceBlocked) {
                return { allowed: false, reason: '设备已被封禁' };
            }
        }
        if (ip) {
            const isIpBlocked = await this.isBlocked('IP', ip);
            if (isIpBlocked) {
                return { allowed: false, reason: 'IP 已被封禁' };
            }
        }
        if (userId && action) {
            const rateResult = await this.checkRateLimit(userId, action);
            if (!rateResult.allowed) {
                return rateResult;
            }
        }
        if (userId) {
            const riskResult = await this.getRiskScore(userId);
            if (riskResult.shouldBlock) {
                await this.logRiskEvent({
                    userId,
                    eventType: 'high_risk_blocked',
                    severity: 'critical',
                    details: { score: riskResult.score, factors: riskResult.factors },
                    ip,
                    visitorId,
                });
                return { allowed: false, reason: '账号风险过高', score: riskResult.score };
            }
            return { allowed: true, score: riskResult.score };
        }
        return { allowed: true };
    }
    async addToBlacklist(type, value, reason, expiresAt) {
        await this.prisma.blacklist.upsert({
            where: { type_value: { type, value } },
            update: { reason, expiresAt },
            create: { type, value, reason, expiresAt },
        });
        await this.logRiskEvent({
            eventType: 'blacklist_add',
            severity: 'high',
            details: { type, value, reason, expiresAt },
        });
        return { success: true, message: `已添加到${type}黑名单` };
    }
    async removeFromBlacklist(type, value) {
        await this.prisma.blacklist.deleteMany({
            where: { type, value },
        });
        return { success: true, message: `已从${type}黑名单移除` };
    }
    async isBlocked(type, value) {
        const record = await this.prisma.blacklist.findFirst({
            where: {
                type: type,
                value,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });
        return !!record;
    }
    async logRiskEvent(event) {
        await this.prisma.riskEvent.create({
            data: {
                userId: event.userId,
                eventType: event.eventType,
                severity: event.severity,
                details: event.details || {},
                ip: event.ip,
                visitorId: event.visitorId,
            },
        });
    }
    async getRiskEvents(options) {
        const { userId, eventType, severity, limit = 50 } = options;
        const events = await this.prisma.riskEvent.findMany({
            where: {
                ...(userId && { userId }),
                ...(eventType && { eventType }),
                ...(severity && { severity }),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return events.map(e => ({
            ...e,
            id: e.id.toString(),
            userId: e.userId?.toString() || null,
        }));
    }
    async getBlacklist(type) {
        const list = await this.prisma.blacklist.findMany({
            where: type ? { type } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return list.map(item => ({
            ...item,
            id: item.id.toString(),
        }));
    }
};
exports.RiskService = RiskService;
exports.RiskService = RiskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RiskService);
//# sourceMappingURL=risk.service.js.map