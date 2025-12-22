import { CheckInService } from './checkin.service';
export declare class CheckInController {
    private readonly checkInService;
    constructor(checkInService: CheckInService);
    getStatus(req: any, tz?: string): Promise<{
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
    checkIn(req: any, body?: {
        timezoneOffset?: number;
    }): Promise<{
        success: boolean;
        streak: number;
        reward: any;
        message: string;
    }>;
    makeup(body: {
        date: string;
        timezoneOffset?: number;
    }, req: any): Promise<{
        success: boolean;
        cost: any;
        reward: number;
        message: string;
    }>;
    getLeaderboard(limit?: string): Promise<{
        rank: number;
        userId: string;
        username: string;
        totalCheckIns: number;
        totalPoints: number;
    }[]>;
    getConfig(): Promise<{
        dailyRewards: any[];
        makeupCost: any;
    }>;
}
