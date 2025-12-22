import { Injectable } from '@nestjs/common';

// 消息模板
const MESSAGE_TEMPLATES = {
  QUEST_COMPLETED: (questTitle: string, reward: string) =>
    `🎉 *任务完成！*\n\n` +
    `✅ 任务：${questTitle}\n` +
    `💰 奖励：${reward}\n\n` +
    `继续完成更多任务赚取奖励吧！`,

  QUEST_APPROVED: (questTitle: string, reward: string) =>
    `✨ *任务审核通过！*\n\n` +
    `📋 任务：${questTitle}\n` +
    `💰 奖励已发放：${reward}\n\n` +
    `感谢您的参与！`,

  QUEST_REJECTED: (questTitle: string, reason: string) =>
    `❌ *任务审核未通过*\n\n` +
    `📋 任务：${questTitle}\n` +
    `📝 原因：${reason}\n\n` +
    `请确认完成要求后重新提交。`,

  DAILY_CHECKIN: (streak: number, reward: number) =>
    `📅 *签到成功！*\n\n` +
    `🔥 连续签到：${streak} 天\n` +
    `⭐ 获得奖励：+${reward} Stars\n\n` +
    `明天继续签到可获得更多奖励！`,

  INVITE_SUCCESS: (inviteeName: string, reward: number) =>
    `👥 *邀请成功！*\n\n` +
    `🎊 您邀请的好友 ${inviteeName} 已注册\n` +
    `⭐ 获得奖励：+${reward} Stars\n\n` +
    `继续邀请好友赚取更多奖励！`,

  NEW_QUEST_AVAILABLE: (questTitle: string, reward: string) =>
    `🆕 *新任务上线！*\n\n` +
    `📋 任务：${questTitle}\n` +
    `💰 奖励：${reward}\n\n` +
    `快来完成任务领取奖励吧！`,

  REWARD_RECEIVED: (amount: string, type: string) =>
    `💰 *奖励到账！*\n\n` +
    `📥 收到：${amount} ${type}\n\n` +
    `查看您的钱包了解更多详情。`,

  // 提现相关通知
  PAYOUT_APPROVED: (amount: string, asset: string) =>
    `✅ *提现审核通过！*\n\n` +
    `💰 金额：${amount} ${asset}\n` +
    `📤 状态：处理中\n\n` +
    `我们将尽快完成转账，请耐心等待。`,

  PAYOUT_COMPLETED: (amount: string, asset: string, txHash?: string) =>
    `🎉 *提现成功！*\n\n` +
    `💰 金额：${amount} ${asset}\n` +
    `✅ 状态：已完成\n` +
    (txHash ? `📝 交易ID：\`${txHash}\`\n\n` : '\n') +
    `资金已转入您的钱包，请查收。`,

  PAYOUT_REJECTED: (amount: string, asset: string, reason?: string) =>
    `❌ *提现被拒绝*\n\n` +
    `💰 金额：${amount} ${asset}\n` +
    `📝 原因：${reason || '未说明'}\n\n` +
    `金额已返还到您的余额，如有疑问请联系客服。`,

  WELCOME: (userName: string) =>
    `🎉 *欢迎加入 Quest Wall！*\n\n` +
    `你好，${userName}！\n\n` +
    `🎯 完成任务赚取奖励\n` +
    `📅 每日签到领取 Stars\n` +
    `👥 邀请好友获得奖励\n\n` +
    `开始你的任务之旅吧！`,
};

@Injectable()
export class TelegramService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly apiBase = 'https://api.telegram.org/bot';

  /**
   * 检查用户是否是频道/群组的成员
   * @param userId 用户的 Telegram ID
   * @param chatId 频道/群组 ID（如 @questwall 或 -1001234567890）
   */
  async checkChatMember(userId: number | bigint, chatId: string): Promise<{
    isMember: boolean;
    status: string;
    error?: string;
  }> {
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
        // member, administrator, creator, restricted(但在群里) 都算是成员
        const memberStatuses = ['member', 'administrator', 'creator', 'restricted'];
        const isMember = memberStatuses.includes(status);

        console.log(`✅ 用户 ${userId} 在 ${chatId} 的状态: ${status}, 是成员: ${isMember}`);

        return { isMember, status };
      } else {
        console.log(`❌ 检查成员失败: ${data.description}`);
        return {
          isMember: false,
          status: 'error',
          error: data.description
        };
      }
    } catch (error) {
      console.error('Telegram API 调用失败:', error);
      return {
        isMember: false,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * 检查用户是否关注了频道
   */
  async isChannelMember(userId: number | bigint, channelId: string): Promise<boolean> {
    const result = await this.checkChatMember(userId, channelId);
    return result.isMember;
  }

  /**
   * 检查用户是否加入了群组
   */
  async isGroupMember(userId: number | bigint, groupId: string): Promise<boolean> {
    const result = await this.checkChatMember(userId, groupId);
    return result.isMember;
  }

  /**
   * 获取频道/群组信息
   */
  async getChatInfo(chatId: string): Promise<any> {
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
    } catch (error) {
      console.error('获取频道信息失败:', error);
      return null;
    }
  }

  // ==================== 消息发送功能 ====================

  /**
   * 发送文本消息给用户
   */
  async sendMessage(
    chatId: number | bigint | string,
    text: string,
    options?: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
      replyMarkup?: any;
    }
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      if (!this.botToken) {
        console.error('❌ TELEGRAM_BOT_TOKEN 未配置');
        return { success: false, error: 'Bot token not configured' };
      }

      const url = `${this.apiBase}${this.botToken}/sendMessage`;

      const body: any = {
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
      } else {
        console.error(`❌ 发送消息失败: ${data.description}`);
        return { success: false, error: data.description };
      }
    } catch (error) {
      console.error('发送消息异常:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送带按钮的消息
   */
  async sendMessageWithButtons(
    chatId: number | bigint | string,
    text: string,
    buttons: Array<{ text: string; url?: string; callback_data?: string }[]>
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    return this.sendMessage(chatId, text, {
      replyMarkup: {
        inline_keyboard: buttons,
      },
    });
  }

  // ==================== 通知快捷方法 ====================

  /**
   * 发送欢迎消息
   */
  async sendWelcomeNotification(telegramId: number | bigint, userName: string): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.WELCOME(userName);
    const result = await this.sendMessageWithButtons(telegramId, message, [
      [{ text: '🎯 开始做任务', url: 'https://t.me/questwall_test_bot/app' }],
    ]);
    return result.success;
  }

  /**
   * 发送任务完成通知
   */
  async sendQuestCompletedNotification(
    telegramId: number | bigint,
    questTitle: string,
    rewardAmount: number,
    rewardType: string
  ): Promise<boolean> {
    const reward = `+${rewardAmount} ${rewardType.toUpperCase()}`;
    const message = MESSAGE_TEMPLATES.QUEST_COMPLETED(questTitle, reward);
    const result = await this.sendMessageWithButtons(telegramId, message, [
      [{ text: '📋 查看更多任务', url: 'https://t.me/questwall_test_bot/app' }],
    ]);
    return result.success;
  }

  /**
   * 发送任务审核通过通知
   */
  async sendQuestApprovedNotification(
    telegramId: number | bigint,
    questTitle: string,
    rewardAmount: number,
    rewardType: string
  ): Promise<boolean> {
    const reward = `+${rewardAmount} ${rewardType.toUpperCase()}`;
    const message = MESSAGE_TEMPLATES.QUEST_APPROVED(questTitle, reward);
    const result = await this.sendMessage(telegramId, message);
    return result.success;
  }

  /**
   * 发送任务审核拒绝通知
   */
  async sendQuestRejectedNotification(
    telegramId: number | bigint,
    questTitle: string,
    reason: string
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.QUEST_REJECTED(questTitle, reason);
    const result = await this.sendMessageWithButtons(telegramId, message, [
      [{ text: '🔄 重新提交', url: 'https://t.me/questwall_test_bot/app' }],
    ]);
    return result.success;
  }

  /**
   * 发送签到成功通知
   */
  async sendCheckInNotification(
    telegramId: number | bigint,
    streak: number,
    reward: number
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.DAILY_CHECKIN(streak, reward);
    const result = await this.sendMessage(telegramId, message);
    return result.success;
  }

  /**
   * 发送邀请成功通知
   */
  async sendInviteSuccessNotification(
    telegramId: number | bigint,
    inviteeName: string,
    reward: number
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.INVITE_SUCCESS(inviteeName, reward);
    const result = await this.sendMessage(telegramId, message);
    return result.success;
  }

  /**
   * 发送新任务通知（批量）
   */
  async sendNewQuestNotification(
    telegramIds: (number | bigint)[],
    questTitle: string,
    rewardAmount: number,
    rewardType: string
  ): Promise<{ sent: number; failed: number }> {
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
      } else {
        failed++;
      }

      // 避免触发 Telegram API 频率限制
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`📤 新任务通知发送完成: 成功 ${sent}, 失败 ${failed}`);
    return { sent, failed };
  }

  /**
   * 发送奖励到账通知
   */
  async sendRewardReceivedNotification(
    telegramId: number | bigint,
    amount: string,
    type: string
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.REWARD_RECEIVED(amount, type);
    const result = await this.sendMessageWithButtons(telegramId, message, [
      [{ text: '💰 查看钱包', url: 'https://t.me/questwall_test_bot/app' }],
    ]);
    return result.success;
  }

  // ==================== 提现通知 ====================

  /**
   * 发送提现审核通过通知（处理中）
   */
  async sendPayoutApprovedNotification(
    telegramId: number | bigint,
    amount: string,
    asset: string
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.PAYOUT_APPROVED(amount, asset);
    const result = await this.sendMessageWithButtons(telegramId, message, [
      [{ text: '💰 查看钱包', url: 'https://t.me/questwall_test_bot/app' }],
    ]);
    return result.success;
  }

  /**
   * 发送提现完成通知
   */
  async sendPayoutCompletedNotification(
    telegramId: number | bigint,
    amount: string,
    asset: string,
    txHash?: string
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.PAYOUT_COMPLETED(amount, asset, txHash);
    const result = await this.sendMessageWithButtons(telegramId, message, [
      [{ text: '💰 查看钱包', url: 'https://t.me/questwall_test_bot/app' }],
    ]);
    return result.success;
  }

  /**
   * 发送提现被拒绝通知
   */
  async sendPayoutRejectedNotification(
    telegramId: number | bigint,
    amount: string,
    asset: string,
    reason?: string
  ): Promise<boolean> {
    const message = MESSAGE_TEMPLATES.PAYOUT_REJECTED(amount, asset, reason);
    const result = await this.sendMessageWithButtons(telegramId, message, [
      [{ text: '💰 查看余额', url: 'https://t.me/questwall_test_bot/app' }],
    ]);
    return result.success;
  }
}
