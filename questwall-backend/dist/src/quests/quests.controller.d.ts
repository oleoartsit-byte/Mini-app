import { QuestsService } from './quests.service';
import { CurrentUserData } from '../auth/current-user.decorator';
import { Request } from 'express';
import { GeoipService } from '../geoip/geoip.service';
export declare class QuestsController {
    private readonly questsService;
    private readonly geoipService;
    constructor(questsService: QuestsService, geoipService: GeoipService);
    findAll(page?: string, pageSize?: string, lang?: string, user?: CurrentUserData, req?: Request): Promise<{
        items: {
            id: string;
            type: import(".prisma/client").$Enums.QuestType;
            title: string;
            description: string;
            reward: {
                type: import(".prisma/client").$Enums.RewardType;
                amount: string;
                points: number;
                assetAddr: string;
            };
            limits: import("@prisma/client/runtime/library").JsonValue;
            status: import(".prisma/client").$Enums.QuestStatus;
            targetUrl: string;
            channelId: string;
            stepDetails: import("@prisma/client/runtime/library").JsonValue;
            userStatus: import(".prisma/client").$Enums.ActionStatus;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getMyQuests(user: CurrentUserData): Promise<{
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
    findOne(id: string, lang?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.QuestType;
        title: string;
        description: string;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            points: number;
            assetAddr: string;
        };
        limits: import("@prisma/client/runtime/library").JsonValue;
        status: import(".prisma/client").$Enums.QuestStatus;
        targetUrl: string;
        channelId: string;
        stepDetails: import("@prisma/client/runtime/library").JsonValue;
        owner: string;
        createdAt: Date;
    }>;
    create(createQuestDto: any, user: CurrentUserData): Promise<{
        id: string;
        message: string;
        status: import(".prisma/client").$Enums.QuestStatus;
    }>;
    claim(id: string, user: CurrentUserData, req: Request): Promise<{
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
    submit(id: string, submitDto: any, user: CurrentUserData): Promise<{
        success: boolean;
        message: string;
        status: "REWARDED";
        verified: boolean;
        requiresProofImage?: undefined;
        actionId?: undefined;
        reward?: undefined;
        pendingReview?: undefined;
    } | {
        success: boolean;
        message: string;
        status: "SUBMITTED" | "REJECTED";
        verified?: undefined;
        requiresProofImage?: undefined;
        actionId?: undefined;
        reward?: undefined;
        pendingReview?: undefined;
    } | {
        success: boolean;
        message: string;
        status: "CLAIMED" | "VERIFIED";
        verified?: undefined;
        requiresProofImage?: undefined;
        actionId?: undefined;
        reward?: undefined;
        pendingReview?: undefined;
    } | {
        success: boolean;
        message: string;
        status: "CLAIMED" | "VERIFIED";
        requiresProofImage: boolean;
        verified?: undefined;
        actionId?: undefined;
        reward?: undefined;
        pendingReview?: undefined;
    } | {
        success: boolean;
        message: string;
        actionId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        verified: boolean;
        reward: {
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            points: number;
        };
        requiresProofImage?: undefined;
        pendingReview?: undefined;
    } | {
        success: boolean;
        message: string;
        status: "CLAIMED" | "VERIFIED";
        verified: boolean;
        requiresProofImage?: undefined;
        actionId?: undefined;
        reward?: undefined;
        pendingReview?: undefined;
    } | {
        success: boolean;
        message: string;
        status: "SUBMITTED";
        verified: boolean;
        pendingReview: boolean;
        requiresProofImage?: undefined;
        actionId?: undefined;
        reward?: undefined;
    }>;
    reward(id: string, user: CurrentUserData): Promise<{
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
}
