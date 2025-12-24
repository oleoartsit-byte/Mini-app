import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import { QuestStatus, BlacklistType, TutorialStatus } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    private readonly jwtService;
    private authGuard;
    constructor(adminService: AdminService, jwtService: JwtService);
    private validateAdmin;
    login(body: {
        username: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            role: string;
        };
    }>;
    initAdmin(body: {
        username: string;
        password: string;
    }): Promise<{
        id: string;
        username: string;
        role: string;
    }>;
    getCurrentAdmin(authHeader: string): Promise<{
        id: any;
        username: any;
        role: any;
    }>;
    getDashboardStats(authHeader: string): Promise<{
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
    getQuests(authHeader: string, page?: string, pageSize?: string, status?: string): Promise<{
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
                points: number;
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
    getQuestDetail(authHeader: string, id: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.QuestType;
        title: string;
        titleEn: string;
        description: string;
        descriptionEn: string;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            points: number;
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
    createQuest(authHeader: string, body: any): Promise<{
        id: string;
        message: string;
    }>;
    updateQuest(authHeader: string, id: string, body: any): Promise<{
        message: string;
    }>;
    updateQuestStatus(authHeader: string, id: string, body: {
        status: QuestStatus;
    }): Promise<{
        message: string;
    }>;
    deleteQuest(authHeader: string, id: string): Promise<{
        message: string;
    }>;
    getUsers(authHeader: string, page?: string, pageSize?: string, search?: string): Promise<{
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
    getUserDetail(authHeader: string, id: string): Promise<{
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
    getUserCompletedQuests(authHeader: string, id: string): Promise<{
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
    getRewards(authHeader: string, page?: string, pageSize?: string): Promise<{
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
    getPayouts(authHeader: string, page?: string, pageSize?: string, status?: string): Promise<{
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
    getPayoutStats(authHeader: string): Promise<{
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
    getPayoutDetail(authHeader: string, id: string): Promise<{
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
    approvePayout(authHeader: string, id: string, body: {
        txHash?: string;
    }): Promise<{
        message: string;
    }>;
    rejectPayout(authHeader: string, id: string, body: {
        reason?: string;
    }): Promise<{
        message: string;
    }>;
    completePayout(authHeader: string, id: string, body: {
        txHash?: string;
        proofImage?: string;
    }): Promise<{
        message: string;
    }>;
    getRiskEvents(authHeader: string, page?: string, pageSize?: string, severity?: string, eventType?: string): Promise<{
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
    getRiskStats(authHeader: string): Promise<{
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
    getUserRiskHistory(authHeader: string, id: string): Promise<{
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
    getBlacklist(authHeader: string, type?: string): Promise<{
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
    addToBlacklist(authHeader: string, body: {
        type: BlacklistType;
        value: string;
        reason?: string;
        expiresAt?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFromBlacklist(authHeader: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingReviews(authHeader: string, page?: string, pageSize?: string, status?: string): Promise<{
        items: {
            id: string;
            status: import(".prisma/client").$Enums.ActionStatus;
            proofImage: string;
            proof: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            user: {
                id: string;
                username: string;
                tgId: string;
                twitterUsername: string;
                riskScore: number;
            };
            quest: {
                id: string;
                type: import(".prisma/client").$Enums.QuestType;
                title: string;
                targetUrl: string;
                rewardType: import(".prisma/client").$Enums.RewardType;
                rewardAmount: string;
            };
        }[];
        total: number;
        pendingCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getReviewStats(authHeader: string): Promise<{
        pending: number;
        approvedToday: number;
        rejectedToday: number;
    }>;
    getReviewDetail(authHeader: string, id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        proofImage: string;
        proof: import("@prisma/client/runtime/library").JsonValue;
        twitterId: string;
        claimedAt: Date;
        submittedAt: Date;
        verifiedAt: Date;
        user: {
            id: string;
            username: string;
            tgId: string;
            twitterId: string;
            twitterUsername: string;
            riskScore: number;
            createdAt: Date;
            stats: Record<string, number>;
        };
        quest: {
            id: string;
            type: import(".prisma/client").$Enums.QuestType;
            title: string;
            description: string;
            targetUrl: string;
            rewardType: import(".prisma/client").$Enums.RewardType;
            rewardAmount: string;
            rewardAsset: string;
        };
    }>;
    approveReview(authHeader: string, id: string): Promise<{
        success: boolean;
        message: string;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
        };
    }>;
    rejectReview(authHeader: string, id: string, body: {
        reason?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getTutorials(authHeader: string, page?: string, pageSize?: string, status?: string): Promise<{
        items: {
            id: string;
            type: import(".prisma/client").$Enums.TutorialType;
            category: string;
            title: string;
            titleEn: string;
            description: string;
            descriptionEn: string;
            coverImage: string;
            videoUrl: string;
            icon: string;
            sortOrder: number;
            viewCount: number;
            status: import(".prisma/client").$Enums.TutorialStatus;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getTutorialDetail(authHeader: string, id: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.TutorialType;
        category: string;
        title: string;
        titleEn: string;
        description: string;
        descriptionEn: string;
        content: string;
        contentEn: string;
        coverImage: string;
        videoUrl: string;
        images: string[];
        icon: string;
        sortOrder: number;
        viewCount: number;
        status: import(".prisma/client").$Enums.TutorialStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createTutorial(authHeader: string, body: any): Promise<{
        id: string;
        message: string;
    }>;
    updateTutorial(authHeader: string, id: string, body: any): Promise<{
        message: string;
    }>;
    updateTutorialStatus(authHeader: string, id: string, body: {
        status: TutorialStatus;
    }): Promise<{
        message: string;
    }>;
    deleteTutorial(authHeader: string, id: string): Promise<{
        message: string;
    }>;
}
