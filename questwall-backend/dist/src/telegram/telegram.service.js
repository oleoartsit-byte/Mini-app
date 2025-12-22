"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const MESSAGE_TEMPLATES = {
    QUEST_COMPLETED: (questTitle, reward) => `🎉 *任务完成！*\n\n` +
        `✅ 任务：${questTitle}\n` +
        `💰 奖励：${reward}\n\n` +
        `继续完成更多任务赚取奖励吧！`,
    QUEST_APPROVED: (questTitle, reward) => `✨ *任务审核通过！*\n\n` +
        `📋 任务：${questTitle}\n` +
        `💰 奖励已发放：${reward}\n\n` +
        `感谢您的参与！`,
    QUEST_REJECTED: (questTitle, reason) => `❌ *任务审核未通过*\n\n` +
        `📋 任务：${questTitle}\n` +
        `📝 原因：${reason}\n\n` +
        `请确认完成要求后重新提交。`,
    DAILY_CHECKIN: (streak, reward) => `📅 *签到成功！*\n\n` +
        `🔥 连续签到：${streak} 天\n` +
        `⭐ 获得奖励：+${reward} Stars\n\n` +
        `明天继续签到可获得更多奖励！`,
    INVITE_SUCCESS: (inviteeName, reward) => `👥 *邀请成功！*\n\n` +
        `🎊 您邀请的好友 ${inviteeName} 已注册\n` +
        `⭐ 获得奖励：+${reward} Stars\n\n` +
        `继续邀请好友赚取更多奖励！`,
    NEW_QUEST_AVAILABLE: (questTitle, reward) => `🆕 *新任务上线！*\n\n` +
        `📋 任务：${questTitle}\n` +
        `💰 奖励：${reward}\n\n` +
        `快来完成任务领取奖励吧！`,
    REWARD_RECEIVED: (amount, type) => `💰 *奖励到账！*\n\n` +
        `📥 收到：${amount} ${type}\n\n` +
        `查看您的钱包了解更多详情。`,
    PAYOUT_APPROVED: (amount, asset) => `✅ *提现审核通过！*\n\n` +
        `💰 金额：${amount} ${asset}\n` +
        `📤 状态：处理中\n\n` +
        `我们将尽快完成转账，请耐心等待。`,
    PAYOUT_COMPLETED: (amount, asset, txHash) => `🎉 *提现成功！*\n\n` +
        `💰 金额：${amount} ${asset}\n` +
        `✅ 状态：已完成\n` +
        (txHash ? `📝 交易ID：\`${txHash}\`\n\n` : '\n') +
        `资金已转入您的钱包，请查收。`,
    PAYOUT_REJECTED: (amount, asset, reason) => `❌ *提现被拒绝*\n\n` +
        `💰 金额：${amount} ${asset}\n` +
        `📝 原因：${reason || '未说明'}\n\n` +
        `金额已返还到您的余额，如有疑问请联系客服。`,
    WELCOME: (userName) => `🎉 *欢迎加入 Quest Wall！*\n\n` +
        `你好，${userName}！\n\n` +
        `🎯 完成任务赚取奖励\n` +
        `📅 每日签到领取 Stars\n` +
        `👥 邀请好友获得奖励\n\n` +
        `开始你的任务之旅吧！`,
};
let TelegramService = class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.apiBase = 'https://api.telegram.org/bot';
    }
    async checkChatMember(userId, chatId) {
        try {
            const url = `${this.apiBase}${this.botToken}/getChatMember`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    user_id: Number(userId),
                }),
            });
            const data = await response.json();
            if (data.ok) {
                const status = data.result.status;
                const memberStatuses = ['member', 'administrator', 'creator', 'restricted'];
                const isMember = memberStatuses.includes(status);
                console.log(`✅ 用户 ${userId} 在 ${chatId} 的状态: ${status}, 是成员: ${isMember}`);
                return { isMember, status };
            }
            else {
                console.log(`❌ 检查成员失败: ${data.description}`);
                return {
                    isMember: false,
                    status: 'error',
                    error: data.description
                };
            }
        }
        catch (error) {
            console.error('Telegram API 调用失败:', error);
            return {
                isMember: false,
                status: 'error',
                error: error.message
            };
        }
    }
    async isChannelMember(userId, channelId) {
        const result = await this.checkChatMember(userId, channelId);
        return result.isMember;
    }
    async isGroupMember(userId, groupId) {
        const result = await this.checkChatMember(userId, groupId);
        return result.isMember;
    }
    async getChatInfo(chatId) {
        try {
            const url = `${this.apiBase}${this.botToken}/getChat`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId }),
            });
            const data = await response.json();
            if (data.ok) {
                return data.result;
            }
            return null;
        }
        catch (error) {
            console.error('获取频道信息失败:', error);
            return null;
        }
    }
    async sendMessage(chatId, text, options) {
        try {
            if (!this.botToken) {
                console.error('❌ TELEGRAM_BOT_TOKEN 未配置');
                return { success: false, error: 'Bot token not configured' };
            }
            const url = `${this.apiBase}${this.botToken}/sendMessage`;
            const body = {
                chat_id: Number(chatId),
                text,
                parse_mode: options?.parseMode || 'Markdown',
            };
            if (options?.disableNotification) {
                body.disable_notification = true;
            }
            if (options?.replyMarkup) {
                body.reply_markup = options.replyMarkup;
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.ok) {
                console.log(`✅ 消息已发送给用户 ${chatId}`);
                return { success: true, messageId: data.result.message_id };
            }
            else {
                console.error(`❌ 发送消息失败: ${data.description}`);
                return { success: false, error: data.description };
            }
        }
        catch (error) {
            console.error('发送消息异常:', error);
            return { success: false, error: error.message };
        }
    }
    async sendMessageWithButtons(chatId, text, buttons) {
        return this.sendMessage(chatId, text, {
            replyMarkup: {
                inline_keyboard: buttons,
            },
        });
    }
    async sendWelcomeNotification(telegramId, userName) {
        const message = MESSAGE_TEMPLATES.WELCOME(userName);
        const result = await this.sendMessageWithButtons(telegramId, message, [
            [{ text: '🎯 开始做任务', url: 'https://t.me/questwall_test_bot/app' }],
        ]);
        return result.success;
    }
    async sendQuestCompletedNotification(telegramId, questTitle, rewardAmount, rewardType) {
        const reward = `+${rewardAmount} ${rewardType.toUpperCase()}`;
        const message = MESSAGE_TEMPLATES.QUEST_COMPLETED(questTitle, reward);
        const result = await this.sendMessageWithButtons(telegramId, message, [
            [{ text: '📋 查看更多任务', url: 'https://t.me/questwall_test_bot/app' }],
        ]);
        return result.success;
    }
    async sendQuestApprovedNotification(telegramId, questTitle, rewardAmount, rewardType) {
        const reward = `+${rewardAmount} ${rewardType.toUpperCase()}`;
        const message = MESSAGE_TEMPLATES.QUEST_APPROVED(questTitle, reward);
        const result = await this.sendMessage(telegramId, message);
        return result.success;
    }
    async sendQuestRejectedNotification(telegramId, questTitle, reason) {
        const message = MESSAGE_TEMPLATES.QUEST_REJECTED(questTitle, reason);
        const result = await this.sendMessageWithButtons(telegramId, message, [
            [{ text: '🔄 重新提交', url: 'https://t.me/questwall_test_bot/app' }],
        ]);
        return result.success;
    }
    async sendCheckInNotification(telegramId, streak, reward) {
        const message = MESSAGE_TEMPLATES.DAILY_CHECKIN(streak, reward);
        const result = await this.sendMessage(telegramId, message);
        return result.success;
    }
    async sendInviteSuccessNotification(telegramId, inviteeName, reward) {
        const message = MESSAGE_TEMPLATES.INVITE_SUCCESS(inviteeName, reward);
        const result = await this.sendMessage(telegramId, message);
        return result.success;
    }
    async sendNewQuestNotification(telegramIds, questTitle, rewardAmount, rewardType) {
        const reward = `+${rewardAmount} ${rewardType.toUpperCase()}`;
        const message = MESSAGE_TEMPLATES.NEW_QUEST_AVAILABLE(questTitle, reward);
        let sent = 0;
        let failed = 0;
        for (const telegramId of telegramIds) {
            const result = await this.sendMessageWithButtons(telegramId, message, [
                [{ text: '🎯 立即参与', url: 'https://t.me/questwall_test_bot/app' }],
            ]);
            if (result.success) {
                sent++;
            }
            else {
                failed++;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        console.log(`📤 新任务通知发送完成: 成功 ${sent}, 失败 ${failed}`);
        return { sent, failed };
    }
    async sendRewardReceivedNotification(telegramId, amount, type) {
        const message = MESSAGE_TEMPLATES.REWARD_RECEIVED(amount, type);
        const result = await this.sendMessageWithButtons(telegramId, message, [
            [{ text: '💰 查看钱包', url: 'https://t.me/questwall_test_bot/app' }],
        ]);
        return result.success;
    }
    async sendPayoutApprovedNotification(telegramId, amount, asset) {
        const message = MESSAGE_TEMPLATES.PAYOUT_APPROVED(amount, asset);
        const result = await this.sendMessageWithButtons(telegramId, message, [
            [{ text: '💰 查看钱包', url: 'https://t.me/questwall_test_bot/app' }],
        ]);
        return result.success;
    }
    async sendPayoutCompletedNotification(telegramId, amount, asset, txHash) {
        const message = MESSAGE_TEMPLATES.PAYOUT_COMPLETED(amount, asset, txHash);
        const result = await this.sendMessageWithButtons(telegramId, message, [
            [{ text: '💰 查看钱包', url: 'https://t.me/questwall_test_bot/app' }],
        ]);
        return result.success;
    }
    async sendPayoutRejectedNotification(telegramId, amount, asset, reason) {
        const message = MESSAGE_TEMPLATES.PAYOUT_REJECTED(amount, asset, reason);
        const result = await this.sendMessageWithButtons(telegramId, message, [
            [{ text: '💰 查看余额', url: 'https://t.me/questwall_test_bot/app' }],
        ]);
        return result.success;
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)()
], TelegramService);
//# sourceMappingURL=telegram.service.js.map