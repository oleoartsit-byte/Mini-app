import { InviteService } from './invite.service';
export declare class InviteController {
    private readonly inviteService;
    constructor(inviteService: InviteService);
    getStatus(req: any): Promise<{
        inviteCount: number;
        totalBonus: any;
        inviteBonus: any;
        commissionBonus: number;
        remainingInvites: number;
        inviteLink: string;
        config: {
            inviterReward: any;
            inviteeReward: any;
            maxInvites: any;
        };
        invitedUsers: {
            id: string;
            username: string;
            bonus: any;
            invitedAt: Date;
        }[];
    }>;
    processInvite(body: {
        inviteCode: string;
    }, req: any): Promise<{
        success: boolean;
        inviterReward: any;
        inviteeReward: any;
        rewardDelayed: boolean;
        message: string;
    }>;
    validateInviteCode(code: string): Promise<{
        valid: boolean;
        message: string;
        inviter?: undefined;
        rewards?: undefined;
    } | {
        valid: boolean;
        inviter: {
            id: string;
            username: string;
        };
        rewards: {
            inviterReward: any;
            inviteeReward: any;
        };
        message?: undefined;
    }>;
    getLeaderboard(limit?: string): Promise<{
        rank: number;
        userId: string;
        username: string;
        inviteCount: number;
        totalBonus: number;
    }[]>;
    getConfig(): Promise<{
        inviterReward: any;
        inviteeReward: any;
        maxInvites: any;
    }>;
}
