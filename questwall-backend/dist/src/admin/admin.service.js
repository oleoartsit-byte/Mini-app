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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
const risk_service_1 = require("../risk/risk.service");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
let AdminService = class AdminService {
    constructor(prisma, jwtService, telegramService, riskService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.telegramService = telegramService;
        this.riskService = riskService;
    }
    async login(username, password) {
        const admin = await this.prisma.admin.findUnique({
            where: { username },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
        });
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
    async createAdmin(username, password, role = 'admin') {
        const existing = await this.prisma.admin.findUnique({
            where: { username },
        });
        if (existing) {
            throw new common_1.BadRequestException('用户名已存在');
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
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalUsers, totalQuests, totalRewardsResult, todayUsers, recentQuests,] = await Promise.all([
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
    async getQuests(page = 1, pageSize = 10, status) {
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
    async getQuestDetail(id) {
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
            throw new common_1.BadRequestException('任务不存在');
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
    async createQuest(data) {
        let owner = await this.prisma.user.findFirst();
        if (!owner) {
            owner = await this.prisma.user.create({
                data: {
                    tgId: BigInt(0),
                    username: 'system',
                },
            });
        }
        const rewardAmount = new library_1.Decimal(data.reward.amount);
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
                status: client_1.QuestStatus.DRAFT,
            },
        });
        return {
            id: quest.id.toString(),
            message: '任务创建成功',
        };
    }
    async updateQuest(id, data) {
        const quest = await this.prisma.quest.findUnique({ where: { id } });
        if (!quest) {
            throw new common_1.BadRequestException('任务不存在');
        }
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.titleEn !== undefined)
            updateData.titleEn = data.titleEn;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.descriptionEn !== undefined)
            updateData.descriptionEn = data.descriptionEn;
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.targetUrl !== undefined)
            updateData.targetUrl = data.targetUrl;
        if (data.channelId !== undefined)
            updateData.channelId = data.channelId;
        if (data.limits !== undefined)
            updateData.limits = data.limits;
        if (data.targetCountries !== undefined)
            updateData.targetCountries = data.targetCountries;
        if (data.stepDetails !== undefined)
            updateData.stepDetails = data.stepDetails;
        if (data.reward?.type !== undefined)
            updateData.rewardType = data.reward.type;
        if (data.reward?.amount !== undefined)
            updateData.rewardAmount = new library_1.Decimal(data.reward.amount);
        if (data.reward?.points !== undefined)
            updateData.rewardPoints = data.reward.points;
        if (data.reward?.asset !== undefined)
            updateData.rewardAsset = data.reward.asset;
        await this.prisma.quest.update({
            where: { id },
            data: updateData,
        });
        return { message: '任务更新成功' };
    }
    async updateQuestStatus(id, status) {
        const quest = await this.prisma.quest.findUnique({ where: { id } });
        if (!quest) {
            throw new common_1.BadRequestException('任务不存在');
        }
        await this.prisma.quest.update({
            where: { id },
            data: { status },
        });
        return { message: `任务状态已更新为 ${status}` };
    }
    async deleteQuest(id) {
        const quest = await this.prisma.quest.findUnique({ where: { id } });
        if (!quest) {
            throw new common_1.BadRequestException('任务不存在');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.reward.deleteMany({
                where: { questId: id },
            });
            await tx.action.deleteMany({
                where: { questId: id },
            });
            await tx.quest.delete({
                where: { id },
            });
        });
        return { message: '任务已删除' };
    }
    async getUsers(page = 1, pageSize = 10, search) {
        const skip = (page - 1) * pageSize;
        const where = search
            ? {
                OR: [
                    { username: { contains: search, mode: 'insensitive' } },
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
    async getUserDetail(id) {
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
            throw new common_1.BadRequestException('用户不存在');
        }
        const totalRewards = await this.prisma.reward.aggregate({
            where: { userId: id },
            _sum: { amount: true },
        });
        const riskEvents = await this.prisma.riskEvent.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
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
    async getRewards(page = 1, pageSize = 10) {
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
    async getPayouts(page = 1, pageSize = 10, status) {
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
    async getPayoutDetail(id) {
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
            throw new common_1.BadRequestException('提现记录不存在');
        }
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
        const riskDetails = await this.riskService.getRiskScore(payout.beneficiaryId);
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
    async approvePayout(id, txHash) {
        const payout = await this.prisma.payout.findUnique({
            where: { id },
            include: {
                beneficiary: { select: { tgId: true } },
            },
        });
        if (!payout) {
            throw new common_1.BadRequestException('提现记录不存在');
        }
        if (payout.status !== 'PENDING') {
            throw new common_1.BadRequestException('只能审核待处理的提现申请');
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
        if (payout.beneficiary?.tgId) {
            const amount = payout.amount.toString();
            if (txHash) {
                this.telegramService.sendPayoutCompletedNotification(payout.beneficiary.tgId, amount, payout.asset, txHash).catch(err => console.error('发送提现完成通知失败:', err));
            }
            else {
                this.telegramService.sendPayoutApprovedNotification(payout.beneficiary.tgId, amount, payout.asset).catch(err => console.error('发送提现审核通知失败:', err));
            }
        }
        return { message: txHash ? '提现已完成' : '提现已审核通过，等待转账' };
    }
    async rejectPayout(id, reason) {
        const payout = await this.prisma.payout.findUnique({
            where: { id },
            include: {
                beneficiary: { select: { tgId: true } },
            },
        });
        if (!payout) {
            throw new common_1.BadRequestException('提现记录不存在');
        }
        if (payout.status !== 'PENDING') {
            throw new common_1.BadRequestException('只能拒绝待处理的提现申请');
        }
        await this.prisma.payout.update({
            where: { id },
            data: {
                status: 'FAILED',
                processedAt: new Date(),
            },
        });
        console.log(`❌ 提现被拒绝: ID=${id}, 金额=${payout.amount} ${payout.asset}, 原因=${reason || '未说明'}`);
        if (payout.beneficiary?.tgId) {
            this.telegramService.sendPayoutRejectedNotification(payout.beneficiary.tgId, payout.amount.toString(), payout.asset, reason).catch(err => console.error('发送提现拒绝通知失败:', err));
        }
        return { message: '提现已拒绝，金额将返还用户余额' };
    }
    async completePayout(id, txHash, proofImage) {
        if (!txHash && !proofImage) {
            throw new common_1.BadRequestException('请提供交易哈希或上传转账截图');
        }
        const payout = await this.prisma.payout.findUnique({
            where: { id },
            include: {
                beneficiary: { select: { tgId: true } },
            },
        });
        if (!payout) {
            throw new common_1.BadRequestException('提现记录不存在');
        }
        if (payout.status !== 'PROCESSING' && payout.status !== 'PENDING') {
            throw new common_1.BadRequestException('只能完成处理中或待处理的提现');
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
        if (payout.beneficiary?.tgId) {
            this.telegramService.sendPayoutCompletedNotification(payout.beneficiary.tgId, payout.amount.toString(), payout.asset, txHash).catch(err => console.error('发送提现完成通知失败:', err));
        }
        return { message: '提现已完成' };
    }
    async getPayoutStats() {
        const [pendingCount, pendingAmount, processingCount, processingAmount, completedCount, completedAmount, failedCount,] = await Promise.all([
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
    async getRiskEvents(page = 1, pageSize = 20, severity, eventType) {
        const skip = (page - 1) * pageSize;
        const where = {};
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
        const userIds = items.map(e => e.userId).filter(Boolean);
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
    async getRiskStats() {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [todayHighRisk, todayMediumRisk, weekTotal, bySeverity, byEventType,] = await Promise.all([
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
    async getUserRiskHistory(userId) {
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
    async getBlacklist(type) {
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
    async addToBlacklist(type, value, reason, expiresAt) {
        const existing = await this.prisma.blacklist.findFirst({
            where: { type, value },
        });
        if (existing) {
            await this.prisma.blacklist.update({
                where: { id: existing.id },
                data: { reason, expiresAt },
            });
            return { success: true, message: '黑名单记录已更新' };
        }
        await this.prisma.blacklist.create({
            data: { type, value, reason, expiresAt },
        });
        await this.prisma.riskEvent.create({
            data: {
                eventType: 'blacklist_add',
                severity: 'high',
                details: { type, value, reason },
            },
        });
        return { success: true, message: `已添加到${type === 'USER' ? '用户' : type === 'DEVICE' ? '设备' : 'IP'}黑名单` };
    }
    async removeFromBlacklist(id) {
        const record = await this.prisma.blacklist.findUnique({
            where: { id },
        });
        if (!record) {
            throw new common_1.BadRequestException('黑名单记录不存在');
        }
        await this.prisma.blacklist.delete({
            where: { id },
        });
        await this.prisma.riskEvent.create({
            data: {
                eventType: 'blacklist_remove',
                severity: 'medium',
                details: { type: record.type, value: record.value },
            },
        });
        return { success: true, message: '已从黑名单移除' };
    }
    async getPendingReviews(page = 1, pageSize = 10, status) {
        const skip = (page - 1) * pageSize;
        const where = {
            status: status || client_1.ActionStatus.SUBMITTED,
            proofImage: { not: null },
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
                where: { status: client_1.ActionStatus.SUBMITTED, proofImage: { not: null } },
            }),
        ]);
        return {
            items: items.map((action) => ({
                id: action.id.toString(),
                status: action.status,
                proofImage: action.proofImage,
                proof: action.proof,
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
    async getReviewStats() {
        const [pendingCount, approvedToday, rejectedToday] = await Promise.all([
            this.prisma.action.count({
                where: { status: client_1.ActionStatus.SUBMITTED, proofImage: { not: null } },
            }),
            this.prisma.action.count({
                where: {
                    status: client_1.ActionStatus.REWARDED,
                    proofImage: { not: null },
                    verifiedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                },
            }),
            this.prisma.action.count({
                where: {
                    status: client_1.ActionStatus.REJECTED,
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
    async getReviewDetail(actionId) {
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
            throw new common_1.BadRequestException('记录不存在');
        }
        const userStats = await this.prisma.action.groupBy({
            by: ['status'],
            where: { userId: action.userId },
            _count: { id: true },
        });
        return {
            id: action.id.toString(),
            status: action.status,
            proofImage: action.proofImage,
            proof: action.proof,
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
                }, {}),
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
    async approveReview(actionId) {
        const action = await this.prisma.action.findUnique({
            where: { id: actionId },
            include: {
                quest: true,
                user: { select: { tgId: true } },
            },
        });
        if (!action) {
            throw new common_1.BadRequestException('记录不存在');
        }
        if (action.status !== client_1.ActionStatus.SUBMITTED) {
            throw new common_1.BadRequestException('只能审核待审核状态的记录');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedAction = await tx.action.update({
                where: { id: actionId },
                data: {
                    status: client_1.ActionStatus.REWARDED,
                    verifiedAt: new Date(),
                },
            });
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
        if (action.user?.tgId) {
            this.telegramService.sendQuestCompletedNotification(action.user.tgId, action.quest.title, Number(action.quest.rewardAmount), action.quest.rewardType).catch(err => console.error('发送奖励通知失败:', err));
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
    async rejectReview(actionId, reason) {
        const action = await this.prisma.action.findUnique({
            where: { id: actionId },
            include: {
                quest: { select: { title: true } },
                user: { select: { tgId: true } },
            },
        });
        if (!action) {
            throw new common_1.BadRequestException('记录不存在');
        }
        if (action.status !== client_1.ActionStatus.SUBMITTED) {
            throw new common_1.BadRequestException('只能审核待审核状态的记录');
        }
        await this.prisma.action.update({
            where: { id: actionId },
            data: {
                status: client_1.ActionStatus.REJECTED,
                verifiedAt: new Date(),
                proof: {
                    ...(action.proof || {}),
                    rejectReason: reason,
                    rejectedAt: new Date().toISOString(),
                },
            },
        });
        console.log(`❌ 审核拒绝: actionId=${actionId}, 原因=${reason || '未说明'}`);
        if (action.user?.tgId) {
            this.telegramService.sendMessage(action.user.tgId, `❌ 您提交的任务「${action.quest.title}」审核未通过${reason ? `\n原因：${reason}` : ''}\n\n请重新完成任务并提交正确的截图。`).catch(err => console.error('发送拒绝通知失败:', err));
        }
        return {
            success: true,
            message: '已拒绝该审核',
        };
    }
    async getUserCompletedQuests(userId) {
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
            throw new common_1.BadRequestException('用户不存在');
        }
        const completedActions = await this.prisma.action.findMany({
            where: {
                userId,
                status: client_1.ActionStatus.REWARDED,
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
    async getTutorials(page = 1, pageSize = 10, status) {
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
    async getTutorialDetail(id) {
        const tutorial = await this.prisma.tutorial.findUnique({
            where: { id },
        });
        if (!tutorial) {
            throw new common_1.BadRequestException('教程不存在');
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
    async createTutorial(data) {
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
    async updateTutorial(id, data) {
        const tutorial = await this.prisma.tutorial.findUnique({ where: { id } });
        if (!tutorial) {
            throw new common_1.BadRequestException('教程不存在');
        }
        const updateData = {};
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.titleEn !== undefined)
            updateData.titleEn = data.titleEn;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.descriptionEn !== undefined)
            updateData.descriptionEn = data.descriptionEn;
        if (data.content !== undefined)
            updateData.content = data.content;
        if (data.contentEn !== undefined)
            updateData.contentEn = data.contentEn;
        if (data.coverImage !== undefined)
            updateData.coverImage = data.coverImage;
        if (data.videoUrl !== undefined)
            updateData.videoUrl = data.videoUrl;
        if (data.images !== undefined)
            updateData.images = data.images;
        if (data.icon !== undefined)
            updateData.icon = data.icon;
        if (data.sortOrder !== undefined)
            updateData.sortOrder = data.sortOrder;
        await this.prisma.tutorial.update({
            where: { id },
            data: updateData,
        });
        return { message: '教程更新成功' };
    }
    async updateTutorialStatus(id, status) {
        const tutorial = await this.prisma.tutorial.findUnique({ where: { id } });
        if (!tutorial) {
            throw new common_1.BadRequestException('教程不存在');
        }
        await this.prisma.tutorial.update({
            where: { id },
            data: { status },
        });
        return { message: `教程状态已更新为 ${status}` };
    }
    async deleteTutorial(id) {
        const tutorial = await this.prisma.tutorial.findUnique({ where: { id } });
        if (!tutorial) {
            throw new common_1.BadRequestException('教程不存在');
        }
        await this.prisma.tutorial.delete({
            where: { id },
        });
        return { message: '教程已删除' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        telegram_service_1.TelegramService,
        risk_service_1.RiskService])
], AdminService);
//# sourceMappingURL=admin.service.js.map