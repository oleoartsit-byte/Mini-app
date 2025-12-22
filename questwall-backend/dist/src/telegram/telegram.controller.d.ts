import { TelegramService } from './telegram.service';
import { CurrentUserData } from '../auth/current-user.decorator';
import { Request } from 'express';
export declare class TelegramController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    sendTestMessage(req: Request): Promise<{
        success: boolean;
        messageId?: number;
        error?: string;
    } | {
        success: boolean;
        message: string;
    }>;
    sendMessage(body: {
        telegramId: number;
        message: string;
        buttons?: Array<{
            text: string;
            url?: string;
        }[]>;
    }): Promise<{
        success: boolean;
        messageId?: number;
        error?: string;
    } | {
        success: boolean;
        message: string;
    }>;
    sendQuestCompletedNotification(body: {
        telegramId: number;
        questTitle: string;
        rewardAmount: number;
        rewardType: string;
    }): Promise<{
        success: boolean;
    }>;
    sendQuestReviewNotification(body: {
        telegramId: number;
        questTitle: string;
        approved: boolean;
        rewardAmount?: number;
        rewardType?: string;
        reason?: string;
    }): Promise<{
        success: boolean;
    }>;
    sendCheckInNotification(body: {
        telegramId: number;
        streak: number;
        reward: number;
    }): Promise<{
        success: boolean;
    }>;
    sendInviteSuccessNotification(body: {
        telegramId: number;
        inviteeName: string;
        reward: number;
    }): Promise<{
        success: boolean;
    }>;
    sendWelcomeNotification(body: {
        telegramId: number;
        userName: string;
    }): Promise<{
        success: boolean;
    }>;
    broadcastNewQuest(body: {
        telegramIds: number[];
        questTitle: string;
        rewardAmount: number;
        rewardType: string;
    }): Promise<{
        sent: number;
        failed: number;
    }>;
    getStatus(): Promise<{
        configured: boolean;
        tokenPrefix: string;
    }>;
    verifyMember(body: {
        chatId: string;
    }, user: CurrentUserData): Promise<{
        success: boolean;
        isMember: boolean;
        message: string;
        status?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        isMember: boolean;
        status: string;
        message: string;
        error: string;
    }>;
    getChatInfo(chatId: string): Promise<{
        success: boolean;
        message: string;
        chat?: undefined;
    } | {
        success: boolean;
        chat: {
            id: any;
            type: any;
            title: any;
            username: any;
            description: any;
        };
        message?: undefined;
    }>;
}
