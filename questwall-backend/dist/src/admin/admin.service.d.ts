import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { RiskService } from '../risk/risk.service';
import { QuestStatus, PayoutStatus, BlacklistType } from '@prisma/client';
export declare class AdminService {
    private prisma;
    private jwtService;
    private telegramService;
    private riskService;
    constructor(prisma: PrismaService, jwtService: JwtService, telegramService: TelegramService, riskService: RiskService);
    login(username: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            role: string;
        };
    }>;
    createAdmin(username: string, password: string, role?: string): Promise<{
        id: string;
        username: string;
        role: string;
    }>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalQuests: number;
        totalRewards: string;
        todayUsers: number;
        recentQuests: {
            id: string;
            title: string;
            type: import(".prisma/client").$Enums.QuestType;
            status: import(".prisma/client").$Enums.QuestStatus;
            completedCount: number;
        }[];
    }>;
    getQuests(page?: number, pageSize?: number, status?: QuestStatus): Promise<{
        items: {
            id: string;
            type: import(".prisma/client").$Enums.QuestType;
            title: string;
            titleEn: string;
            description: string;
            descriptionEn: string;
            reward: {
                type: import(".prisma/client").$Enums.RewardType;
                amount: string;
                asset: string;
            };
            limits: import("@prisma/client/runtime/library").JsonValue;
            status: import(".prisma/client").$Enums.QuestStatus;
            targetUrl: string;
            channelId: string;
            targetCountries: string[];
            owner: string;
            actionCount: number;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getQuestDetail(id: bigint): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.QuestType;
        title: string;
        titleEn: string;
        description: string;
        descriptionEn: string;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            asset: string;
        };
        limits: import("@prisma/client/runtime/library").JsonValue;
        status: import(".prisma/client").$Enums.QuestStatus;
        targetUrl: string;
        channelId: string;
        targetCountries: string[];
        owner: string;
        actionCount: number;
        rewardCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createQuest(data: any): Promise<{
        id: string;
        message: string;
    }>;
    updateQuest(id: bigint, data: any): Promise<{
        message: string;
    }>;
    updateQuestStatus(id: bigint, status: QuestStatus): Promise<{
        message: string;
    }>;
    deleteQuest(id: bigint): Promise<{
        message: string;
    }>;
    getUsers(page?: number, pageSize?: number, search?: string): Promise<{
        items: {
            id: string;
            tgId: string;
            username: string;
            firstName: string;
            lastName: string;
            walletAddr: string;
            locale: string;
            riskScore: number;
            actionCount: number;
            rewardCount: number;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getUserDetail(id: bigint): Promise<{
        id: string;
        tgId: string;
        username: string;
        firstName: string;
        lastName: string;
        walletAddr: string;
        locale: string;
        riskScore: number;
        riskLevel: string;
        riskFactors: string[];
        completedQuests: number;
        totalRewards: string;
        recentRewards: {
            id: string;
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            createdAt: Date;
        }[];
        riskEvents: {
            id: string;
            eventType: string;
            severity: string;
            details: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    getRewards(page?: number, pageSize?: number): Promise<{
        items: {
            id: string;
            userId: string;
            username: string;
            tgId: string;
            questId: string;
            questTitle: string;
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            status: import(".prisma/client").$Enums.RewardStatus;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getPayouts(page?: number, pageSize?: number, status?: PayoutStatus): Promise<{
        items: {
            id: string;
            beneficiaryId: string;
            username: string;
            tgId: string;
            userWallet: string;
            riskScore: number;
            asset: string;
            amount: string;
            toAddress: string;
            status: import(".prisma/client").$Enums.PayoutStatus;
            txHash: string;
            proofImage: string;
            createdAt: Date;
            processedAt: Date;
        }[];
        total: number;
        pendingCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getPayoutDetail(id: bigint): Promise<{
        id: string;
        beneficiaryId: string;
        user: {
            username: string;
            tgId: string;
            walletAddr: string;
            firstName: string;
            lastName: string;
        };
        riskScore: number;
        riskLevel: string;
        riskFactors: string[];
        riskEvents: {
            id: string;
            eventType: string;
            severity: string;
            details: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
        }[];
        asset: string;
        amount: string;
        toAddress: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        txHash: string;
        proofImage: string;
        totalEarned: string;
        totalWithdrawn: string;
        createdAt: Date;
        processedAt: Date;
    }>;
    approvePayout(id: bigint, txHash?: string): Promise<{
        message: string;
    }>;
    rejectPayout(id: bigint, reason?: string): Promise<{
        message: string;
    }>;
    completePayout(id: bigint, txHash?: string, proofImage?: string): Promise<{
        message: string;
    }>;
    getPayoutStats(): Promise<{
        pending: {
            count: number;
            amount: string;
        };
        processing: {
            count: number;
            amount: string;
        };
        completed: {
            count: number;
            amount: string;
        };
        failed: {
            count: number;
        };
    }>;
    getRiskEvents(page?: number, pageSize?: number, severity?: string, eventType?: string): Promise<{
        items: {
            id: string;
            userId: string;
            username: string;
            tgId: string;
            eventType: string;
            severity: string;
            details: import("@prisma/client/runtime/library").JsonValue;
            ip: string;
            visitorId: string;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getRiskStats(): Promise<{
        today: {
            high: number;
            medium: number;
        };
        weekTotal: number;
        bySeverity: {
            severity: string;
            count: number;
        }[];
        byEventType: {
            eventType: string;
            count: number;
        }[];
    }>;
    getUserRiskHistory(userId: bigint): Promise<{
        user: {
            id: string;
            username: string;
            tgId: string;
            riskScore: number;
            createdAt: Date;
        };
        events: {
            id: string;
            eventType: string;
            severity: string;
            details: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
        }[];
        totalEvents: number;
    }>;
    getBlacklist(type?: BlacklistType): Promise<{
        items: {
            id: string;
            type: import(".prisma/client").$Enums.BlacklistType;
            value: string;
            reason: string;
            expiresAt: Date;
            createdAt: Date;
            isExpired: boolean;
        }[];
        total: number;
    }>;
    addToBlacklist(type: BlacklistType, value: string, reason?: string, expiresAt?: Date): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFromBlacklist(id: bigint): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserCompletedQuests(userId: bigint): Promise<{
        user: {
            id: string;
            username: string;
            tgId: string;
            twitterUsername: string;
        };
        completedQuests: {
            questId: string;
            questType: import(".prisma/client").$Enums.QuestType;
            questTitle: string;
            questTitleEn: string;
            rewardType: import(".prisma/client").$Enums.RewardType;
            rewardAmount: string;
            rewardAsset: string;
            completedAt: Date;
            twitterId: string;
        }[];
        summary: {
            totalCompleted: number;
            totalReward: string;
        };
    }>;
}
