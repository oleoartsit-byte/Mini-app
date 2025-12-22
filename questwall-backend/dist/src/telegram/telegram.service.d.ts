export declare class TelegramService {
    private readonly botToken;
    private readonly apiBase;
    checkChatMember(userId: number | bigint, chatId: string): Promise<{
        isMember: boolean;
        status: string;
        error?: string;
    }>;
    isChannelMember(userId: number | bigint, channelId: string): Promise<boolean>;
    isGroupMember(userId: number | bigint, groupId: string): Promise<boolean>;
    getChatInfo(chatId: string): Promise<any>;
    sendMessage(chatId: number | bigint | string, text: string, options?: {
        parseMode?: 'Markdown' | 'HTML';
        disableNotification?: boolean;
        replyMarkup?: any;
    }): Promise<{
        success: boolean;
        messageId?: number;
        error?: string;
    }>;
    sendMessageWithButtons(chatId: number | bigint | string, text: string, buttons: Array<{
        text: string;
        url?: string;
        callback_data?: string;
    }[]>): Promise<{
        success: boolean;
        messageId?: number;
        error?: string;
    }>;
    sendWelcomeNotification(telegramId: number | bigint, userName: string): Promise<boolean>;
    sendQuestCompletedNotification(telegramId: number | bigint, questTitle: string, rewardAmount: number, rewardType: string): Promise<boolean>;
    sendQuestApprovedNotification(telegramId: number | bigint, questTitle: string, rewardAmount: number, rewardType: string): Promise<boolean>;
    sendQuestRejectedNotification(telegramId: number | bigint, questTitle: string, reason: string): Promise<boolean>;
    sendCheckInNotification(telegramId: number | bigint, streak: number, reward: number): Promise<boolean>;
    sendInviteSuccessNotification(telegramId: number | bigint, inviteeName: string, reward: number): Promise<boolean>;
    sendNewQuestNotification(telegramIds: (number | bigint)[], questTitle: string, rewardAmount: number, rewardType: string): Promise<{
        sent: number;
        failed: number;
    }>;
    sendRewardReceivedNotification(telegramId: number | bigint, amount: string, type: string): Promise<boolean>;
    sendPayoutApprovedNotification(telegramId: number | bigint, amount: string, asset: string): Promise<boolean>;
    sendPayoutCompletedNotification(telegramId: number | bigint, amount: string, asset: string, txHash?: string): Promise<boolean>;
    sendPayoutRejectedNotification(telegramId: number | bigint, amount: string, asset: string, reason?: string): Promise<boolean>;
}
