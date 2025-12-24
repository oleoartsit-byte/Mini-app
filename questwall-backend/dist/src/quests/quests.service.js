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
var QuestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
const twitter_service_1 = require("../twitter/twitter.service");
const risk_service_1 = require("../risk/risk.service");
const auth_service_1 = require("../auth/auth.service");
const ai_service_1 = require("../ai/ai.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
let QuestsService = QuestsService_1 = class QuestsService {
    constructor(prisma, telegramService, twitterService, riskService, authService, aiService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
        this.twitterService = twitterService;
        this.riskService = riskService;
        this.authService = authService;
        this.aiService = aiService;
        this.logger = new common_1.Logger(QuestsService_1.name);
    }
    getLocalizedText(quest, field, lang = 'zh') {
        if (lang === 'en') {
            return quest[`${field}En`] || quest[field];
        }
        return quest[field];
    }
    async findAll(page = 1, pageSize = 20, userId, lang = 'zh', countryCode) {
        const skip = (page - 1) * pageSize;
        const whereCondition = { status: client_1.QuestStatus.ACTIVE };
        if (countryCode) {
            whereCondition.OR = [
                { targetCountries: { isEmpty: true } },
                { targetCountries: { has: countryCode } }
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.quest.findMany({
                where: whereCondition,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: { username: true }
                    },
                    actions: userId ? {
                        where: { userId },
                        select: { status: true }
                    } : false
                }
            }),
            this.prisma.quest.count({
                where: whereCondition
            })
        ]);
        const formattedItems = items.map(quest => ({
            id: quest.id.toString(),
            type: quest.type,
            title: this.getLocalizedText(quest, 'title', lang),
            description: this.getLocalizedText(quest, 'description', lang),
            reward: {
                type: quest.rewardType,
                amount: quest.rewardAmount.toString(),
                points: quest.rewardPoints || Math.floor(Number(quest.rewardAmount) * 10),
                assetAddr: quest.rewardAsset
            },
            limits: quest.limits,
            status: quest.status,
            targetUrl: quest.targetUrl,
            channelId: quest.channelId,
            userStatus: quest.actions?.[0]?.status || null,
            createdAt: quest.createdAt
        }));
        return {
            items: formattedItems,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }
    async findOne(id, lang = 'zh') {
        const quest = await this.prisma.quest.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { username: true }
                }
            }
        });
        if (!quest) {
            throw new common_1.NotFoundException(`Quest with ID ${id} not found`);
        }
        return {
            id: quest.id.toString(),
            type: quest.type,
            title: this.getLocalizedText(quest, 'title', lang),
            description: this.getLocalizedText(quest, 'description', lang),
            reward: {
                type: quest.rewardType,
                amount: quest.rewardAmount.toString(),
                points: quest.rewardPoints || Math.floor(Number(quest.rewardAmount) * 10),
                assetAddr: quest.rewardAsset
            },
            limits: quest.limits,
            status: quest.status,
            targetUrl: quest.targetUrl,
            channelId: quest.channelId,
            owner: quest.owner?.username,
            createdAt: quest.createdAt
        };
    }
    async create(ownerId, dto) {
        const quest = await this.prisma.quest.create({
            data: {
                ownerId,
                type: dto.type,
                title: dto.title,
                description: dto.description,
                rewardType: dto.reward.type,
                rewardAmount: new library_1.Decimal(dto.reward.amount),
                rewardAsset: dto.reward.assetAddr,
                limits: dto.limits || { dailyCap: 100, perUserCap: 1 },
                targetUrl: dto.targetUrl,
                channelId: dto.channelId,
                status: client_1.QuestStatus.DRAFT
            }
        });
        return {
            id: quest.id.toString(),
            message: 'Quest created successfully',
            status: quest.status
        };
    }
    async claim(userId, questId, ip, visitorId) {
        const riskCheck = await this.riskService.checkRisk({
            userId,
            ip,
            visitorId,
            action: 'quest_claim',
        });
        if (!riskCheck.allowed) {
            return {
                success: false,
                message: riskCheck.reason || '操作被拒绝',
                blocked: true,
                riskScore: riskCheck.score,
            };
        }
        const quest = await this.prisma.quest.findUnique({
            where: { id: questId }
        });
        if (!quest) {
            throw new common_1.NotFoundException(`Quest with ID ${questId} not found`);
        }
        if (quest.status !== client_1.QuestStatus.ACTIVE) {
            throw new common_1.BadRequestException('Quest is not active');
        }
        const existingAction = await this.prisma.action.findUnique({
            where: {
                userId_questId: { userId, questId }
            }
        });
        if (existingAction) {
            return {
                success: false,
                message: '您已领取过此任务',
                actionId: existingAction.id.toString(),
                status: existingAction.status
            };
        }
        const limits = quest.limits;
        if (limits.dailyCap) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayCount = await this.prisma.action.count({
                where: {
                    questId,
                    createdAt: { gte: today }
                }
            });
            if (todayCount >= limits.dailyCap) {
                throw new common_1.BadRequestException('今日任务名额已满');
            }
        }
        const action = await this.prisma.action.create({
            data: {
                userId,
                questId,
                status: client_1.ActionStatus.CLAIMED,
                riskScore: riskCheck.score || 0,
            }
        });
        return {
            success: true,
            message: `任务 ${questId} 已领取`,
            actionId: action.id.toString(),
            riskScore: riskCheck.score,
        };
    }
    isTwitterQuest(questType) {
        const twitterQuestTypes = [
            client_1.QuestType.FOLLOW_TWITTER,
            client_1.QuestType.RETWEET_TWITTER,
            client_1.QuestType.LIKE_TWITTER,
            client_1.QuestType.COMMENT_TWITTER
        ];
        return twitterQuestTypes.includes(questType);
    }
    async submit(userId, questId, dto) {
        const action = await this.prisma.action.findUnique({
            where: {
                userId_questId: { userId, questId }
            },
            include: { quest: true }
        });
        if (!action) {
            throw new common_1.BadRequestException('请先领取任务');
        }
        if (action.status === client_1.ActionStatus.REWARDED) {
            return {
                success: true,
                message: '任务已完成，奖励已发放',
                status: action.status,
                verified: true
            };
        }
        if (action.status !== client_1.ActionStatus.CLAIMED && action.status !== client_1.ActionStatus.VERIFIED) {
            return {
                success: false,
                message: `任务当前状态: ${action.status}，无法提交`,
                status: action.status
            };
        }
        const quest = action.quest;
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (this.isTwitterQuest(quest.type)) {
            if (!user?.twitterId) {
                return {
                    success: false,
                    message: '请先在个人资料页绑定您的 Twitter 账号',
                    status: action.status
                };
            }
            const existingTwitterAction = await this.prisma.action.findFirst({
                where: {
                    questId,
                    twitterId: user.twitterId,
                    status: client_1.ActionStatus.REWARDED
                }
            });
            if (existingTwitterAction) {
                return {
                    success: false,
                    message: `该 Twitter 账号 @${user.twitterUsername || user.twitterId} 已完成过此任务，无法重复领取奖励`,
                    status: action.status
                };
            }
        }
        const verificationResult = await this.verifyQuest(userId, quest);
        if (verificationResult.requiresProofImage) {
            if (!dto.proofImage) {
                return {
                    success: false,
                    message: '请上传任务完成截图',
                    status: action.status,
                    requiresProofImage: true
                };
            }
            if (this.aiService.isAvailable() && user?.twitterUsername) {
                this.logger.log(`AI 验证截图: 用户 @${user.twitterUsername}, 图片 ${dto.proofImage}`);
                const aiResult = await this.aiService.verifyLikeScreenshot(dto.proofImage, user.twitterUsername, quest.targetUrl || undefined);
                this.logger.log(`AI 验证结果: ${JSON.stringify(aiResult)}`);
                if (aiResult.isValid && aiResult.confidence >= 0.8 && !aiResult.needsManualReview) {
                    const pointsToAdd = quest.rewardPoints || Math.floor(Number(quest.rewardAmount) * 10);
                    const result = await this.prisma.$transaction(async (tx) => {
                        const updatedAction = await tx.action.update({
                            where: { id: action.id },
                            data: {
                                proof: { ...dto.proof, aiVerification: JSON.parse(JSON.stringify(aiResult)) },
                                proofImage: dto.proofImage,
                                status: client_1.ActionStatus.REWARDED,
                                submittedAt: new Date(),
                                verifiedAt: new Date(),
                                twitterId: user.twitterId || undefined,
                            }
                        });
                        const reward = await tx.reward.create({
                            data: {
                                userId,
                                questId,
                                actionId: action.id,
                                type: quest.rewardType,
                                amount: quest.rewardAmount,
                                asset: quest.rewardAsset,
                                status: 'COMPLETED'
                            }
                        });
                        await tx.user.update({
                            where: { id: userId },
                            data: { points: { increment: pointsToAdd } }
                        });
                        await this.processInviterCommission(tx, userId, quest.rewardAmount);
                        return { updatedAction, reward, pointsToAdd };
                    });
                    if (user.tgId) {
                        const canNotify = await this.authService.canSendNotification(userId, 'reward');
                        if (canNotify) {
                            this.telegramService.sendQuestCompletedNotification(user.tgId, quest.title, Number(quest.rewardAmount), quest.rewardType).catch(err => console.error('发送奖励通知失败:', err));
                        }
                    }
                    return {
                        success: true,
                        message: `${aiResult.reason} 奖励已发放！`,
                        actionId: result.updatedAction.id.toString(),
                        status: result.updatedAction.status,
                        verified: true,
                        reward: {
                            type: quest.rewardType,
                            amount: quest.rewardAmount.toString(),
                            points: result.pointsToAdd
                        }
                    };
                }
                if (!aiResult.isValid && !aiResult.needsManualReview) {
                    return {
                        success: false,
                        message: aiResult.reason || '截图验证失败',
                        status: action.status,
                        verified: false
                    };
                }
                await this.prisma.action.update({
                    where: { id: action.id },
                    data: {
                        proof: { ...dto.proof, aiVerification: JSON.parse(JSON.stringify(aiResult)) },
                        proofImage: dto.proofImage,
                        status: client_1.ActionStatus.SUBMITTED,
                        submittedAt: new Date(),
                        twitterId: user.twitterId || undefined,
                    }
                });
                return {
                    success: true,
                    message: aiResult.reason || '截图已提交，等待审核',
                    status: client_1.ActionStatus.SUBMITTED,
                    verified: false,
                    pendingReview: true
                };
            }
            await this.prisma.action.update({
                where: { id: action.id },
                data: {
                    proof: dto.proof,
                    proofImage: dto.proofImage,
                    status: client_1.ActionStatus.SUBMITTED,
                    submittedAt: new Date(),
                    twitterId: user?.twitterId || undefined,
                }
            });
            return {
                success: true,
                message: '截图已提交，等待审核',
                status: client_1.ActionStatus.SUBMITTED,
                verified: false,
                pendingReview: true
            };
        }
        if (!verificationResult.verified) {
            return {
                success: false,
                message: verificationResult.message,
                status: action.status
            };
        }
        const pointsToAdd = quest.rewardPoints || Math.floor(Number(quest.rewardAmount) * 10);
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedAction = await tx.action.update({
                where: { id: action.id },
                data: {
                    proof: dto.proof,
                    status: client_1.ActionStatus.REWARDED,
                    submittedAt: new Date(),
                    verifiedAt: new Date(),
                    ...(this.isTwitterQuest(quest.type) && user?.twitterId ? { twitterId: user.twitterId } : {})
                }
            });
            const reward = await tx.reward.create({
                data: {
                    userId,
                    questId,
                    actionId: action.id,
                    type: quest.rewardType,
                    amount: quest.rewardAmount,
                    asset: quest.rewardAsset,
                    status: 'COMPLETED'
                }
            });
            await tx.user.update({
                where: { id: userId },
                data: { points: { increment: pointsToAdd } }
            });
            await this.processInviterCommission(tx, userId, quest.rewardAmount);
            return { updatedAction, reward, pointsToAdd };
        });
        if (user?.tgId) {
            const canNotify = await this.authService.canSendNotification(userId, 'reward');
            if (canNotify) {
                this.telegramService.sendQuestCompletedNotification(user.tgId, quest.title, Number(quest.rewardAmount), quest.rewardType).catch(err => {
                    console.error('发送奖励通知失败:', err);
                });
            }
        }
        return {
            success: true,
            message: `${verificationResult.message} 奖励已发放！`,
            actionId: result.updatedAction.id.toString(),
            status: result.updatedAction.status,
            verified: true,
            reward: {
                type: quest.rewardType,
                amount: quest.rewardAmount.toString(),
                points: result.pointsToAdd
            }
        };
    }
    async verifyQuest(userId, quest) {
        const verifyUser = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!verifyUser) {
            return { verified: false, message: '用户不存在' };
        }
        const tgUserId = verifyUser.tgId;
        switch (quest.type) {
            case client_1.QuestType.JOIN_CHANNEL:
                if (!quest.channelId) {
                    return { verified: false, message: '任务配置错误：缺少频道 ID' };
                }
                const isChannelMember = await this.telegramService.isChannelMember(tgUserId, quest.channelId);
                if (isChannelMember) {
                    return { verified: true, message: '已确认关注频道，任务完成！' };
                }
                return { verified: false, message: '请先关注频道后再提交' };
            case client_1.QuestType.JOIN_GROUP:
                if (!quest.channelId) {
                    return { verified: false, message: '任务配置错误：缺少群组 ID' };
                }
                const isGroupMember = await this.telegramService.isGroupMember(tgUserId, quest.channelId);
                if (isGroupMember) {
                    return { verified: true, message: '已确认加入群组，任务完成！' };
                }
                return { verified: false, message: '请先加入群组后再提交' };
            case client_1.QuestType.FOLLOW_TWITTER:
                if (!quest.targetUrl) {
                    return { verified: true, message: 'Twitter 关注任务完成！' };
                }
                const twitterMatch = quest.targetUrl.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
                if (!twitterMatch) {
                    return { verified: true, message: 'Twitter 关注任务完成！' };
                }
                const targetTwitterUsername = twitterMatch[1];
                if (verifyUser.twitterId) {
                    const twitterResult = await this.twitterService.verifyFollowTask(targetTwitterUsername, { twitterId: verifyUser.twitterId });
                    if (twitterResult.verified) {
                        return { verified: true, message: twitterResult.message };
                    }
                    return {
                        verified: false,
                        message: `您的 Twitter 账号 @${verifyUser.twitterUsername || '未知'} 尚未关注 @${targetTwitterUsername}，请先关注后再验证`
                    };
                }
                return {
                    verified: false,
                    message: '请先在个人资料页绑定您的 Twitter 账号，以便验证关注状态'
                };
            case client_1.QuestType.RETWEET_TWITTER:
                if (!quest.targetUrl) {
                    return { verified: true, message: 'Twitter 转发任务完成！' };
                }
                if (verifyUser.twitterId) {
                    const retweetResult = await this.twitterService.verifyRetweetTask(quest.targetUrl, verifyUser.twitterId);
                    return retweetResult;
                }
                return {
                    verified: false,
                    message: '请先在个人资料页绑定您的 Twitter 账号，以便验证转发状态'
                };
            case client_1.QuestType.LIKE_TWITTER:
                return {
                    verified: false,
                    message: '需要提交截图',
                    requiresProofImage: true
                };
            case client_1.QuestType.COMMENT_TWITTER:
                if (!quest.targetUrl) {
                    return { verified: true, message: 'Twitter 评论任务完成！' };
                }
                if (verifyUser.twitterId) {
                    const commentResult = await this.twitterService.verifyCommentTask(quest.targetUrl, verifyUser.twitterId);
                    return commentResult;
                }
                return {
                    verified: false,
                    message: '请先在个人资料页绑定您的 Twitter 账号，以便验证评论状态'
                };
            case client_1.QuestType.DEEP_LINK:
            case client_1.QuestType.LIKE_POST:
            case client_1.QuestType.FORM:
                return { verified: true, message: '任务完成！' };
            case client_1.QuestType.ONCHAIN_TRANSFER:
                return { verified: true, message: '链上交易任务完成！' };
            case client_1.QuestType.MINT_NFT:
                return { verified: true, message: 'NFT 铸造任务完成！' };
            default:
                return { verified: true, message: '任务完成！' };
        }
    }
    async reward(userId, questId) {
        const [quest, action, user] = await Promise.all([
            this.prisma.quest.findUnique({ where: { id: questId } }),
            this.prisma.action.findUnique({
                where: { userId_questId: { userId, questId } }
            }),
            this.prisma.user.findUnique({ where: { id: userId } })
        ]);
        if (!quest) {
            throw new common_1.NotFoundException('Quest not found');
        }
        if (!action) {
            throw new common_1.BadRequestException('未找到任务记录');
        }
        if (action.status === client_1.ActionStatus.REWARDED) {
            return {
                success: false,
                message: '奖励已发放'
            };
        }
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.action.update({
                where: { id: action.id },
                data: {
                    status: client_1.ActionStatus.REWARDED,
                    verifiedAt: new Date()
                }
            });
            const reward = await tx.reward.create({
                data: {
                    userId,
                    questId,
                    actionId: action.id,
                    type: quest.rewardType,
                    amount: quest.rewardAmount,
                    asset: quest.rewardAsset
                }
            });
            return reward;
        });
        if (user?.tgId) {
            const canNotify = await this.authService.canSendNotification(userId, 'reward');
            if (canNotify) {
                this.telegramService.sendQuestCompletedNotification(user.tgId, quest.title, Number(quest.rewardAmount), quest.rewardType).catch(err => {
                    console.error('发送任务完成通知失败:', err);
                });
            }
        }
        return {
            success: true,
            message: `任务 ${questId} 的奖励已发放`,
            rewardId: result.id.toString(),
            reward: {
                type: result.type,
                amount: result.amount.toString(),
                asset: result.asset
            }
        };
    }
    async getUserQuests(userId, status) {
        const actions = await this.prisma.action.findMany({
            where: {
                userId,
                ...(status && { status })
            },
            include: {
                quest: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return actions.map(action => ({
            actionId: action.id.toString(),
            questId: action.questId.toString(),
            quest: {
                title: action.quest.title,
                type: action.quest.type,
                reward: {
                    type: action.quest.rewardType,
                    amount: action.quest.rewardAmount.toString()
                }
            },
            status: action.status,
            claimedAt: action.claimedAt,
            submittedAt: action.submittedAt,
            verifiedAt: action.verifiedAt
        }));
    }
    async updateStatus(questId, status) {
        const quest = await this.prisma.quest.update({
            where: { id: questId },
            data: { status }
        });
        return {
            id: quest.id.toString(),
            status: quest.status,
            message: `Quest status updated to ${status}`
        };
    }
    async processInviterCommission(tx, userId, rewardAmount) {
        try {
            const invite = await tx.invite.findUnique({
                where: { inviteeId: userId }
            });
            if (!invite) {
                return;
            }
            const inviterId = invite.inviterId;
            const inviteCount = await tx.invite.count({
                where: { inviterId }
            });
            let commissionRate;
            if (inviteCount >= 5000) {
                commissionRate = 0.20;
            }
            else if (inviteCount >= 500) {
                commissionRate = 0.15;
            }
            else {
                commissionRate = 0.10;
            }
            const commissionAmount = Number(rewardAmount) * commissionRate;
            if (commissionAmount <= 0) {
                return;
            }
            await tx.invite.update({
                where: { id: invite.id },
                data: {
                    bonus: {
                        increment: commissionAmount
                    }
                }
            });
            await tx.reward.create({
                data: {
                    userId: inviterId,
                    type: 'USDT',
                    amount: commissionAmount,
                    status: 'COMPLETED'
                }
            });
            console.log(`💰 返佣: 邀请人 ${inviterId} 获得 ${commissionAmount.toFixed(4)} USDT (${commissionRate * 100}% of ${rewardAmount}), 当前邀请数: ${inviteCount}`);
        }
        catch (error) {
            console.error('处理返佣失败:', error);
        }
    }
};
exports.QuestsService = QuestsService;
exports.QuestsService = QuestsService = QuestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService,
        twitter_service_1.TwitterService,
        risk_service_1.RiskService,
        auth_service_1.AuthService,
        ai_service_1.AiService])
], QuestsService);
//# sourceMappingURL=quests.service.js.map