import { PrismaService } from '../prisma/prisma.service';
interface WithdrawDto {
    asset: string;
    amount: string;
    toAddress: string;
}
export declare class RewardsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyRewards(userId: bigint): Promise<{
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
    getBalance(userId: bigint): Promise<{
        asset: string;
        amount: string;
        available: boolean;
    }[]>;
    withdraw(userId: bigint, dto: WithdrawDto): Promise<{
        success: boolean;
        payoutId: string;
        message: string;
        estimatedTime: string;
    }>;
    getPayouts(userId: bigint): Promise<{
        id: string;
        asset: string;
        amount: string;
        toAddress: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        txHash: string;
        createdAt: Date;
        processedAt: Date;
    }[]>;
    getPayoutStatus(payoutId: bigint): Promise<{
        id: string;
        asset: string;
        amount: string;
        toAddress: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        txHash: string;
        createdAt: Date;
        processedAt: Date;
    }>;
    processPayout(payoutId: bigint, txHash: string): Promise<{
        success: boolean;
        payoutId: string;
        txHash: string;
    }>;
    private getMinWithdraw;
    getLeaderboard(limit?: number): Promise<{
        rank: number;
        id: string;
        username: string;
        avatarUrl: string;
        avatar: string;
        points: number;
        quests: number;
    }[]>;
    getUserRank(userId: bigint): Promise<{
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
    private getAvatarEmoji;
}
export {};
