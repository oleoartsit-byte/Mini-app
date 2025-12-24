import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { TwitterService } from '../twitter/twitter.service';
import { RiskService } from '../risk/risk.service';
import { AuthService } from '../auth/auth.service';
import { AiService } from '../ai/ai.service';
import { QuestStatus, ActionStatus, QuestType, RewardType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// DTO 类型定义
interface CreateQuestDto {
  type: QuestType;
  title: string;
  description?: string;
  reward: {
    type: RewardType;
    amount: string;
    assetAddr?: string;
  };
  limits?: {
    dailyCap?: number;
    perUserCap?: number;
  };
  targetUrl?: string;
  channelId?: string;
}

interface SubmitDto {
  proof: Record<string, any>;
  proofImage?: string;  // 任务完成截图 URL
}

@Injectable()
export class QuestsService {
  private readonly logger = new Logger(QuestsService.name);

  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
    private twitterService: TwitterService,
    private riskService: RiskService,
    private authService: AuthService,
    private aiService: AiService,
  ) {}

  // 根据语言获取本地化文本
  private getLocalizedText(quest: any, field: 'title' | 'description', lang: string = 'zh'): string | null {
    if (lang === 'en') {
      // 英文优先使用英文字段，fallback 到默认字段
      return quest[`${field}En`] || quest[field];
    }
    // 中文或其他语言使用默认字段
    return quest[field];
  }

  // 获取任务列表
  async findAll(page: number = 1, pageSize: number = 20, userId?: bigint, lang: string = 'zh', countryCode?: string | null) {
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const whereCondition: any = { status: QuestStatus.ACTIVE };

    // 如果有国家代码，过滤任务：只显示 targetCountries 为空（全球）或包含用户国家的任务
    // 注意：Prisma 对数组字段的查询方式
    if (countryCode) {
      whereCondition.OR = [
        { targetCountries: { isEmpty: true } },  // 全球任务（空数组）
        { targetCountries: { has: countryCode } } // 包含用户国家
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
          // 如果有用户ID，获取用户的完成状态
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

    // 格式化返回数据（支持多语言）
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

  // 获取单个任务详情
  async findOne(id: bigint, lang: string = 'zh') {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
      include: {
        owner: {
          select: { username: true }
        }
      }
    });

    if (!quest) {
      throw new NotFoundException(`Quest with ID ${id} not found`);
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

  // 创建任务（广告主）
  async create(ownerId: bigint, dto: CreateQuestDto) {
    const quest = await this.prisma.quest.create({
      data: {
        ownerId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        rewardType: dto.reward.type,
        rewardAmount: new Decimal(dto.reward.amount),
        rewardAsset: dto.reward.assetAddr,
        limits: dto.limits || { dailyCap: 100, perUserCap: 1 },
        targetUrl: dto.targetUrl,
        channelId: dto.channelId,
        status: QuestStatus.DRAFT
      }
    });

    return {
      id: quest.id.toString(),
      message: 'Quest created successfully',
      status: quest.status
    };
  }

  // 领取任务
  async claim(userId: bigint, questId: bigint, ip?: string, visitorId?: string) {
    // 0. 风控检查
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

    // 1. 检查任务是否存在且活跃
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId }
    });

    if (!quest) {
      throw new NotFoundException(`Quest with ID ${questId} not found`);
    }

    if (quest.status !== QuestStatus.ACTIVE) {
      throw new BadRequestException('Quest is not active');
    }

    // 2. 检查用户是否已领取
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

    // 3. 检查每日上限
    const limits = quest.limits as { dailyCap?: number; perUserCap?: number };
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
        throw new BadRequestException('今日任务名额已满');
      }
    }

    // 4. 创建领取记录（带风险分）
    const action = await this.prisma.action.create({
      data: {
        userId,
        questId,
        status: ActionStatus.CLAIMED,
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

  // 判断是否为 Twitter 任务类型
  private isTwitterQuest(questType: QuestType): boolean {
    const twitterQuestTypes: QuestType[] = [
      QuestType.FOLLOW_TWITTER,
      QuestType.RETWEET_TWITTER,
      QuestType.LIKE_TWITTER,
      QuestType.COMMENT_TWITTER
    ];
    return twitterQuestTypes.includes(questType);
  }

  // 提交任务证明（带真实验证）
  async submit(userId: bigint, questId: bigint, dto: SubmitDto) {
    // 1. 检查是否已领取任务
    const action = await this.prisma.action.findUnique({
      where: {
        userId_questId: { userId, questId }
      },
      include: { quest: true }
    });

    if (!action) {
      throw new BadRequestException('请先领取任务');
    }

    // 如果已经发放奖励，直接返回成功
    if (action.status === ActionStatus.REWARDED) {
      return {
        success: true,
        message: '任务已完成，奖励已发放',
        status: action.status,
        verified: true
      };
    }

    // 只有 CLAIMED 或 VERIFIED 状态可以提交验证
    if (action.status !== ActionStatus.CLAIMED && action.status !== ActionStatus.VERIFIED) {
      return {
        success: false,
        message: `任务当前状态: ${action.status}，无法提交`,
        status: action.status
      };
    }

    const quest = action.quest;

    // 获取用户信息（用于 Twitter 验证）
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    // 2. 对于 Twitter 任务，检查该 Twitter 账号是否已完成过此任务
    if (this.isTwitterQuest(quest.type)) {
      if (!user?.twitterId) {
        return {
          success: false,
          message: '请先在个人资料页绑定您的 Twitter 账号',
          status: action.status
        };
      }

      // 检查该 Twitter 账号是否已经完成过这个任务（不管是哪个 TG 账号）
      const existingTwitterAction = await this.prisma.action.findFirst({
        where: {
          questId,
          twitterId: user.twitterId,
          status: ActionStatus.REWARDED
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

    // 3. 根据任务类型进行真实验证
    const verificationResult = await this.verifyQuest(userId, quest);

    // 如果任务需要截图审核（如 LIKE_TWITTER）
    if (verificationResult.requiresProofImage) {
      // 检查是否提交了截图
      if (!dto.proofImage) {
        return {
          success: false,
          message: '请上传任务完成截图',
          status: action.status,
          requiresProofImage: true
        };
      }

      // 使用 AI 验证截图
      if (this.aiService.isAvailable() && user?.twitterUsername) {
        this.logger.log(`AI 验证截图: 用户 @${user.twitterUsername}, 图片 ${dto.proofImage}`);

        const aiResult = await this.aiService.verifyLikeScreenshot(
          dto.proofImage,
          user.twitterUsername,
          quest.targetUrl || undefined
        );

        this.logger.log(`AI 验证结果: ${JSON.stringify(aiResult)}`);

        // AI 验证通过且置信度高，直接发放奖励
        if (aiResult.isValid && aiResult.confidence >= 0.8 && !aiResult.needsManualReview) {
          // 使用任务配置的积分奖励（如果没配置则默认 USDT * 10）
          const pointsToAdd = quest.rewardPoints || Math.floor(Number(quest.rewardAmount) * 10);

          // 直接发放奖励（使用事务）
          const result = await this.prisma.$transaction(async (tx) => {
            const updatedAction = await tx.action.update({
              where: { id: action.id },
              data: {
                proof: { ...dto.proof, aiVerification: JSON.parse(JSON.stringify(aiResult)) },
                proofImage: dto.proofImage,
                status: ActionStatus.REWARDED,
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

            // 增加用户积分
            await tx.user.update({
              where: { id: userId },
              data: { points: { increment: pointsToAdd } }
            });

            await this.processInviterCommission(tx, userId, quest.rewardAmount);

            return { updatedAction, reward, pointsToAdd };
          });

          // 发送通知
          if (user.tgId) {
            const canNotify = await this.authService.canSendNotification(userId, 'reward');
            if (canNotify) {
              this.telegramService.sendQuestCompletedNotification(
                user.tgId,
                quest.title,
                Number(quest.rewardAmount),
                quest.rewardType
              ).catch(err => console.error('发送奖励通知失败:', err));
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

        // AI 验证失败（用户名不匹配等明确拒绝的情况）
        if (!aiResult.isValid && !aiResult.needsManualReview) {
          return {
            success: false,
            message: aiResult.reason || '截图验证失败',
            status: action.status,
            verified: false
          };
        }

        // 需要人工审核的情况：保存 AI 结果供参考
        await this.prisma.action.update({
          where: { id: action.id },
          data: {
            proof: { ...dto.proof, aiVerification: JSON.parse(JSON.stringify(aiResult)) },
            proofImage: dto.proofImage,
            status: ActionStatus.SUBMITTED,
            submittedAt: new Date(),
            twitterId: user.twitterId || undefined,
          }
        });

        return {
          success: true,
          message: aiResult.reason || '截图已提交，等待审核',
          status: ActionStatus.SUBMITTED,
          verified: false,
          pendingReview: true
        };
      }

      // AI 服务不可用，走人工审核
      await this.prisma.action.update({
        where: { id: action.id },
        data: {
          proof: dto.proof,
          proofImage: dto.proofImage,
          status: ActionStatus.SUBMITTED,
          submittedAt: new Date(),
          twitterId: user?.twitterId || undefined,
        }
      });

      return {
        success: true,
        message: '截图已提交，等待审核',
        status: ActionStatus.SUBMITTED,
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

    // 4. 验证通过，直接发放奖励（使用事务）
    // 使用任务配置的积分奖励（如果没配置则默认 USDT * 10）
    const pointsToAdd = quest.rewardPoints || Math.floor(Number(quest.rewardAmount) * 10);

    const result = await this.prisma.$transaction(async (tx) => {
      // 更新任务状态为 REWARDED，同时记录 twitterId（如果是 Twitter 任务）
      const updatedAction = await tx.action.update({
        where: { id: action.id },
        data: {
          proof: dto.proof,
          status: ActionStatus.REWARDED,
          submittedAt: new Date(),
          verifiedAt: new Date(),
          // 如果是 Twitter 任务，记录使用的 Twitter ID
          ...(this.isTwitterQuest(quest.type) && user?.twitterId ? { twitterId: user.twitterId } : {})
        }
      });

      // 创建奖励记录
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

      // 增加用户积分
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: pointsToAdd } }
      });

      // 处理邀请返佣
      await this.processInviterCommission(tx, userId, quest.rewardAmount);

      return { updatedAction, reward, pointsToAdd };
    });

    // 5. 发送奖励发放通知（异步，检查用户偏好）
    // user 已在上面获取，直接使用
    if (user?.tgId) {
      const canNotify = await this.authService.canSendNotification(userId, 'reward');
      if (canNotify) {
        this.telegramService.sendQuestCompletedNotification(
          user.tgId,
          quest.title,
          Number(quest.rewardAmount),
          quest.rewardType
        ).catch(err => {
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

  // 验证任务完成情况
  private async verifyQuest(userId: bigint, quest: any): Promise<{ verified: boolean; message: string; requiresProofImage?: boolean }> {
    // 获取用户的 Telegram ID
    const verifyUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!verifyUser) {
      return { verified: false, message: '用户不存在' };
    }

    const tgUserId = verifyUser.tgId;

    switch (quest.type) {
      case QuestType.JOIN_CHANNEL:
        // 验证是否关注了频道
        if (!quest.channelId) {
          return { verified: false, message: '任务配置错误：缺少频道 ID' };
        }
        const isChannelMember = await this.telegramService.isChannelMember(tgUserId, quest.channelId);
        if (isChannelMember) {
          return { verified: true, message: '已确认关注频道，任务完成！' };
        }
        return { verified: false, message: '请先关注频道后再提交' };

      case QuestType.JOIN_GROUP:
        // 验证是否加入了群组
        if (!quest.channelId) {
          return { verified: false, message: '任务配置错误：缺少群组 ID' };
        }
        const isGroupMember = await this.telegramService.isGroupMember(tgUserId, quest.channelId);
        if (isGroupMember) {
          return { verified: true, message: '已确认加入群组，任务完成！' };
        }
        return { verified: false, message: '请先加入群组后再提交' };

      case QuestType.FOLLOW_TWITTER:
        // 验证是否关注了 Twitter 账号
        if (!quest.targetUrl) {
          // 如果没有配置 targetUrl，直接通过
          return { verified: true, message: 'Twitter 关注任务完成！' };
        }
        // 从 targetUrl 中提取 Twitter 用户名 (如 https://twitter.com/username 或 https://x.com/username)
        const twitterMatch = quest.targetUrl.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
        if (!twitterMatch) {
          return { verified: true, message: 'Twitter 关注任务完成！' };
        }
        const targetTwitterUsername = twitterMatch[1];

        // 如果用户绑定了 Twitter，使用绑定的 ID 进行真实验证
        if (verifyUser.twitterId) {
          const twitterResult = await this.twitterService.verifyFollowTask(
            targetTwitterUsername,
            { twitterId: verifyUser.twitterId }
          );
          if (twitterResult.verified) {
            return { verified: true, message: twitterResult.message };
          }
          // 未关注目标账号
          return {
            verified: false,
            message: `您的 Twitter 账号 @${verifyUser.twitterUsername || '未知'} 尚未关注 @${targetTwitterUsername}，请先关注后再验证`
          };
        }

        // 未绑定 Twitter，返回需要绑定的提示
        return {
          verified: false,
          message: '请先在个人资料页绑定您的 Twitter 账号，以便验证关注状态'
        };

      case QuestType.RETWEET_TWITTER:
        // 验证是否转发了推文
        if (!quest.targetUrl) {
          return { verified: true, message: 'Twitter 转发任务完成！' };
        }
        if (verifyUser.twitterId) {
          const retweetResult = await this.twitterService.verifyRetweetTask(
            quest.targetUrl,
            verifyUser.twitterId
          );
          return retweetResult;
        }
        return {
          verified: false,
          message: '请先在个人资料页绑定您的 Twitter 账号，以便验证转发状态'
        };

      case QuestType.LIKE_TWITTER:
        // 点赞任务：需要用户提交截图，等待人工审核
        // 返回特殊状态，表示需要截图审核
        return {
          verified: false,
          message: '需要提交截图',
          requiresProofImage: true
        };

      case QuestType.COMMENT_TWITTER:
        // 验证是否评论了推文
        if (!quest.targetUrl) {
          return { verified: true, message: 'Twitter 评论任务完成！' };
        }
        if (verifyUser.twitterId) {
          const commentResult = await this.twitterService.verifyCommentTask(
            quest.targetUrl,
            verifyUser.twitterId
          );
          return commentResult;
        }
        return {
          verified: false,
          message: '请先在个人资料页绑定您的 Twitter 账号，以便验证评论状态'
        };

      case QuestType.DEEP_LINK:
      case QuestType.LIKE_POST:
      case QuestType.FORM:
        // 这些任务类型暂时跳过验证，直接通过
        return { verified: true, message: '任务完成！' };

      case QuestType.ONCHAIN_TRANSFER:
        // TODO: 需要接入 TON API 验证链上交易
        return { verified: true, message: '链上交易任务完成！' };

      case QuestType.MINT_NFT:
        // TODO: 需要接入 TON API 验证 NFT 铸造
        return { verified: true, message: 'NFT 铸造任务完成！' };

      default:
        // 默认通过
        return { verified: true, message: '任务完成！' };
    }
  }

  // 验证并发放奖励（内部/管理接口）
  async reward(userId: bigint, questId: bigint) {
    // 1. 获取任务、行为记录和用户信息
    const [quest, action, user] = await Promise.all([
      this.prisma.quest.findUnique({ where: { id: questId } }),
      this.prisma.action.findUnique({
        where: { userId_questId: { userId, questId } }
      }),
      this.prisma.user.findUnique({ where: { id: userId } })
    ]);

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    if (!action) {
      throw new BadRequestException('未找到任务记录');
    }

    if (action.status === ActionStatus.REWARDED) {
      return {
        success: false,
        message: '奖励已发放'
      };
    }

    // 2. 使用事务处理发奖
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新行为状态
      await tx.action.update({
        where: { id: action.id },
        data: {
          status: ActionStatus.REWARDED,
          verifiedAt: new Date()
        }
      });

      // 创建奖励记录
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

    // 3. 发送通知（异步，不影响主流程，检查用户偏好）
    if (user?.tgId) {
      const canNotify = await this.authService.canSendNotification(userId, 'reward');
      if (canNotify) {
        this.telegramService.sendQuestCompletedNotification(
          user.tgId,
          quest.title,
          Number(quest.rewardAmount),
          quest.rewardType
        ).catch(err => {
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

  // 获取用户的任务列表
  async getUserQuests(userId: bigint, status?: ActionStatus) {
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

  // 更新任务状态（管理接口）
  async updateStatus(questId: bigint, status: QuestStatus) {
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

  // 处理邀请返佣
  // 返佣比例：1-500人 10%，500-5000人 15%，5000+人 20%
  private async processInviterCommission(tx: any, userId: bigint, rewardAmount: Decimal) {
    try {
      // 1. 查找该用户是否被邀请
      const invite = await tx.invite.findUnique({
        where: { inviteeId: userId }
      });

      if (!invite) {
        // 用户不是被邀请来的，不需要返佣
        return;
      }

      const inviterId = invite.inviterId;

      // 2. 统计邀请人的邀请数量
      const inviteCount = await tx.invite.count({
        where: { inviterId }
      });

      // 3. 根据邀请数量确定返佣比例
      let commissionRate: number;
      if (inviteCount >= 5000) {
        commissionRate = 0.20; // 20%
      } else if (inviteCount >= 500) {
        commissionRate = 0.15; // 15%
      } else {
        commissionRate = 0.10; // 10%
      }

      // 4. 计算返佣金额
      const commissionAmount = Number(rewardAmount) * commissionRate;

      if (commissionAmount <= 0) {
        return;
      }

      // 5. 更新邀请记录的累计返佣
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          bonus: {
            increment: commissionAmount
          }
        }
      });

      // 6. 创建返佣奖励记录（类型为 USDT）
      await tx.reward.create({
        data: {
          userId: inviterId,
          type: 'USDT',
          amount: commissionAmount,
          status: 'COMPLETED'
        }
      });

      console.log(`💰 返佣: 邀请人 ${inviterId} 获得 ${commissionAmount.toFixed(4)} USDT (${commissionRate * 100}% of ${rewardAmount}), 当前邀请数: ${inviteCount}`);
    } catch (error) {
      // 返佣失败不影响主流程
      console.error('处理返佣失败:', error);
    }
  }
}
