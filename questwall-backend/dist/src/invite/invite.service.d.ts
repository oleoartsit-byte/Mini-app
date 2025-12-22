import { PrismaService } from '../prisma/prisma.service';
export declare class InviteService {
    private prisma;
    constructor(prisma: PrismaService);
    checkInviterRisk(inviterId: bigint): Promise<{
        allowed: boolean;
        riskLevel: 'low' | 'medium' | 'high';
        reason?: string;
        shouldRecordEvent: boolean;
    }>;
    checkInviteeRisk(inviteeId: bigint): Promise<{
        isNewAccount: boolean;
        shouldDelayReward: boolean;
        accountAgeHours: number;
    }>;
    recordRiskEvent(userId: bigint, eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): Promise<void>;
    getConfig(): Promise<{
        inviterReward: any;
        inviteeReward: any;
        maxInvites: any;
    }>;
    getStatus(userId: bigint): Promise<{
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
    processInvite(inviteeId: bigint, inviterTgId: string): Promise<{
        success: boolean;
        inviterReward: any;
        inviteeReward: any;
        rewardDelayed: boolean;
        message: string;
    }>;
    validateInviteCode(inviteCode: string): Promise<{
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
    getLeaderboard(limit?: number): Promise<{
        rank: number;
        userId: string;
        username: string;
        inviteCount: number;
        totalBonus: number;
    }[]>;
}
