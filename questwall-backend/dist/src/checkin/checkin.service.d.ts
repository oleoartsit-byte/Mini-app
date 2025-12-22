import { PrismaService } from '../prisma/prisma.service';
export declare class CheckInService {
    private prisma;
    constructor(prisma: PrismaService);
    getConfig(): Promise<{
        dailyRewards: any[];
        makeupCost: any;
    }>;
    getStatus(userId: bigint, timezoneOffset?: number): Promise<{
        todayChecked: boolean;
        streak: number;
        todayReward: any;
        recentDays: any[];
        checkInHistory: any[];
        config: {
            dailyRewards: any[];
            makeupCost: any;
        };
    }>;
    checkIn(userId: bigint, timezoneOffset?: number): Promise<{
        success: boolean;
        streak: number;
        reward: any;
        message: string;
    }>;
    makeup(userId: bigint, dateStr: string, timezoneOffset?: number): Promise<{
        success: boolean;
        cost: any;
        reward: number;
        message: string;
    }>;
    getLeaderboard(limit?: number): Promise<{
        rank: number;
        userId: string;
        username: string;
        totalCheckIns: number;
        totalPoints: number;
    }[]>;
}
