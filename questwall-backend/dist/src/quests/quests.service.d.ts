import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { TwitterService } from '../twitter/twitter.service';
import { RiskService } from '../risk/risk.service';
import { AuthService } from '../auth/auth.service';
import { QuestStatus, ActionStatus, QuestType, RewardType } from '@prisma/client';
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
}
export declare class QuestsService {
    private prisma;
    private telegramService;
    private twitterService;
    private riskService;
    private authService;
    constructor(prisma: PrismaService, telegramService: TelegramService, twitterService: TwitterService, riskService: RiskService, authService: AuthService);
    private getLocalizedText;
    findAll(page?: number, pageSize?: number, userId?: bigint, lang?: string, countryCode?: string | null): Promise<{
        items: {
            id: string;
            type: import(".prisma/client").$Enums.QuestType;
            title: string;
            description: string;
            reward: {
                type: import(".prisma/client").$Enums.RewardType;
                amount: string;
                assetAddr: string;
            };
            limits: import("@prisma/client/runtime/library").JsonValue;
            status: import(".prisma/client").$Enums.QuestStatus;
            targetUrl: string;
            channelId: string;
            userStatus: import(".prisma/client").$Enums.ActionStatus;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: bigint, lang?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.QuestType;
        title: string;
        description: string;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            assetAddr: string;
        };
        limits: import("@prisma/client/runtime/library").JsonValue;
        status: import(".prisma/client").$Enums.QuestStatus;
        targetUrl: string;
        channelId: string;
        owner: string;
        createdAt: Date;
    }>;
    create(ownerId: bigint, dto: CreateQuestDto): Promise<{
        id: string;
        message: string;
        status: import(".prisma/client").$Enums.QuestStatus;
    }>;
    claim(userId: bigint, questId: bigint, ip?: string, visitorId?: string): Promise<{
        success: boolean;
        message: string;
        blocked: boolean;
        riskScore: number;
        actionId?: undefined;
        status?: undefined;
    } | {
        success: boolean;
        message: string;
        actionId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        blocked?: undefined;
        riskScore?: undefined;
    } | {
        success: boolean;
        message: string;
        actionId: string;
        riskScore: number;
        blocked?: undefined;
        status?: undefined;
    }>;
    private isTwitterQuest;
    submit(userId: bigint, questId: bigint, dto: SubmitDto): Promise<{
        success: boolean;
        message: string;
        status: "REWARDED";
        verified: boolean;
        actionId?: undefined;
        reward?: undefined;
    } | {
        success: boolean;
        message: string;
        status: "SUBMITTED" | "REJECTED";
        verified?: undefined;
        actionId?: undefined;
        reward?: undefined;
    } | {
        success: boolean;
        message: string;
        status: "CLAIMED" | "VERIFIED";
        verified?: undefined;
        actionId?: undefined;
        reward?: undefined;
    } | {
        success: boolean;
        message: string;
        actionId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        verified: boolean;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
        };
    }>;
    private verifyQuest;
    reward(userId: bigint, questId: bigint): Promise<{
        success: boolean;
        message: string;
        rewardId?: undefined;
        reward?: undefined;
    } | {
        success: boolean;
        message: string;
        rewardId: string;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            asset: string;
        };
    }>;
    getUserQuests(userId: bigint, status?: ActionStatus): Promise<{
        actionId: string;
        questId: string;
        quest: {
            title: string;
            type: import(".prisma/client").$Enums.QuestType;
            reward: {
                type: import(".prisma/client").$Enums.RewardType;
                amount: string;
            };
        };
        status: import(".prisma/client").$Enums.ActionStatus;
        claimedAt: Date;
        submittedAt: Date;
        verifiedAt: Date;
    }[]>;
    updateStatus(questId: bigint, status: QuestStatus): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.QuestStatus;
        message: string;
    }>;
    private processInviterCommission;
}
export {};
