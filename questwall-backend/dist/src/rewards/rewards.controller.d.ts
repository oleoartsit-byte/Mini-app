import { RewardsService } from './rewards.service';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    getMyRewards(req: any): Promise<{
        items: {
            id: string;
            questId: string;
            questTitle: string;
            questType: import(".prisma/client").$Enums.QuestType;
            type: import(".prisma/client").$Enums.RewardType;
            amount: string;
            asset: string;
            status: import(".prisma/client").$Enums.RewardStatus;
            txHash: string;
            createdAt: Date;
        }[];
        total: number;
        summary: {
            asset: string;
            amount: string;
        }[];
    }>;
    withdraw(withdrawDto: any, req: any): Promise<{
        success: boolean;
        payoutId: string;
        message: string;
        estimatedTime: string;
    }>;
    getPayoutStatus(id: string): Promise<{
        id: string;
        asset: string;
        amount: string;
        toAddress: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        txHash: string;
        createdAt: Date;
        processedAt: Date;
    }>;
    getLeaderboard(limit?: string): Promise<{
        rank: number;
        id: string;
        username: string;
        avatarUrl: string;
        avatar: string;
        points: number;
        quests: number;
    }[]>;
    getMyRank(req: any): Promise<{
        rank: number;
        points: number;
        quests: number;
        username?: undefined;
    } | {
        rank: number;
        points: number;
        quests: number;
        username: string;
    }>;
}
