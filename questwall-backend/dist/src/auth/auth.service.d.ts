import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
export declare class AuthService {
    private jwtService;
    private prisma;
    private telegramService;
    constructor(jwtService: JwtService, prisma: PrismaService, telegramService: TelegramService);
    telegramAuth(initData: string): Promise<{
        token: string;
        expiresIn: number;
        user: {
            id: string;
            tg_id: string;
            username: string;
            first_name: string;
            last_name: string;
            avatar_url: string;
            locale: string;
            wallet_addr: string;
        };
    }>;
    devLogin(): Promise<{
        token: string;
        expiresIn: number;
        user: {
            id: string;
            tg_id: string;
            username: string;
            first_name: string;
            last_name: string;
            locale: string;
            wallet_addr: string;
        };
    }>;
    refreshToken(oldToken: string): Promise<{
        token: string;
        expiresIn: number;
    }>;
    getUserById(userId: bigint): Promise<{
        id: bigint;
        tgId: bigint;
        twitterId: string | null;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
        walletAddr: string | null;
        locale: string;
        riskScore: number;
        twitterUsername: string | null;
        twitterBindAt: Date | null;
        notificationPrefs: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserByTgId(tgId: bigint): Promise<{
        id: bigint;
        tgId: bigint;
        twitterId: string | null;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
        walletAddr: string | null;
        locale: string;
        riskScore: number;
        twitterUsername: string | null;
        twitterBindAt: Date | null;
        notificationPrefs: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getNotificationPrefs(userId: bigint): Promise<{
        questComplete: boolean;
        reward: boolean;
        newQuest: boolean;
        checkIn: boolean;
        invite: boolean;
    }>;
    updateNotificationPrefs(userId: bigint, prefs: Partial<{
        questComplete: boolean;
        reward: boolean;
        newQuest: boolean;
        checkIn: boolean;
        invite: boolean;
    }>): Promise<{
        questComplete: boolean;
        reward: boolean;
        newQuest: boolean;
        checkIn: boolean;
        invite: boolean;
    }>;
    canSendNotification(userId: bigint, type: 'questComplete' | 'reward' | 'newQuest' | 'checkIn' | 'invite'): Promise<boolean>;
    private verifyTelegramInitData;
    private parseInitData;
}
