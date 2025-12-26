import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { Request } from 'express';

@Controller('notifications')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * 发送测试消息（需要登录）
   */
  @UseGuards(JwtAuthGuard)
  @Post('test')
  async sendTestMessage(@Req() req: Request) {
    const telegramId = (req as any).user?.telegramId;

    if (!telegramId) {
      return { success: false, message: '未找到 Telegram ID' };
    }

    const result = await this.telegramService.sendMessage(
      telegramId,
      '🔔 *测试通知*\n\n这是一条来自 Quest Wall 的测试消息。\n\n如果您收到此消息，说明通知功能正常工作！',
    );

    return result;
  }

  /**
   * 发送自定义消息给用户（管理员接口）
   */
  @Post('send')
  async sendMessage(
    @Body() body: {
      telegramId: number;
      message: string;
      buttons?: Array<{ text: string; url?: string }[]>;
    },
  ) {
    const { telegramId, message, buttons } = body;

    if (!telegramId || !message) {
      return { success: false, message: '缺少必要参数' };
    }

    if (buttons && buttons.length > 0) {
      return this.telegramService.sendMessageWithButtons(telegramId, message, buttons);
    }

    return this.telegramService.sendMessage(telegramId, message);
  }

  /**
   * 发送任务完成通知
   */
  @Post('quest-completed')
  async sendQuestCompletedNotification(
    @Body() body: {
      telegramId: number;
      questTitle: string;
      usdtAmount: number;
      points: number;
    },
  ) {
    const { telegramId, questTitle, usdtAmount, points } = body;

    const success = await this.telegramService.sendQuestCompletedNotification(
      telegramId,
      questTitle,
      usdtAmount,
      points,
    );

    return { success };
  }

  /**
   * 发送任务审核通知
   */
  @Post('quest-review')
  async sendQuestReviewNotification(
    @Body() body: {
      telegramId: number;
      questTitle: string;
      approved: boolean;
      usdtAmount?: number;
      points?: number;
      reason?: string;
    },
  ) {
    const { telegramId, questTitle, approved, usdtAmount, points, reason } = body;

    let success: boolean;

    if (approved) {
      success = await this.telegramService.sendQuestApprovedNotification(
        telegramId,
        questTitle,
        usdtAmount || 0,
        points || 0,
      );
    } else {
      success = await this.telegramService.sendQuestRejectedNotification(
        telegramId,
        questTitle,
        reason || '未通过审核',
      );
    }

    return { success };
  }

  /**
   * 发送签到通知
   */
  @Post('checkin')
  async sendCheckInNotification(
    @Body() body: {
      telegramId: number;
      streak: number;
      reward: number;
    },
  ) {
    const { telegramId, streak, reward } = body;

    const success = await this.telegramService.sendCheckInNotification(
      telegramId,
      streak,
      reward,
    );

    return { success };
  }

  /**
   * 发送邀请成功通知
   */
  @Post('invite-success')
  async sendInviteSuccessNotification(
    @Body() body: {
      telegramId: number;
      inviteeName: string;
      reward: number;
    },
  ) {
    const { telegramId, inviteeName, reward } = body;

    const success = await this.telegramService.sendInviteSuccessNotification(
      telegramId,
      inviteeName,
      reward,
    );

    return { success };
  }

  /**
   * 发送欢迎通知
   */
  @Post('welcome')
  async sendWelcomeNotification(
    @Body() body: {
      telegramId: number;
      userName: string;
    },
  ) {
    const { telegramId, userName } = body;

    const success = await this.telegramService.sendWelcomeNotification(
      telegramId,
      userName,
    );

    return { success };
  }

  /**
   * 批量发送新任务通知（管理员接口）
   */
  @Post('broadcast-quest')
  async broadcastNewQuest(
    @Body() body: {
      telegramIds: number[];
      questTitle: string;
      rewardAmount: number;
      rewardType: string;
    },
  ) {
    const { telegramIds, questTitle, rewardAmount, rewardType } = body;

    const result = await this.telegramService.sendNewQuestNotification(
      telegramIds,
      questTitle,
      rewardAmount,
      rewardType,
    );

    return result;
  }

  /**
   * 检查通知服务状态
   */
  @Get('status')
  async getStatus() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    return {
      configured: !!botToken,
      tokenPrefix: botToken ? botToken.substring(0, 10) + '...' : null,
    };
  }

  /**
   * 验证用户是否是频道/群组成员（需要登录）
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify-member')
  async verifyMember(
    @Body() body: { chatId: string },
    @CurrentUser() user: CurrentUserData,
  ) {
    const { chatId } = body;

    if (!chatId) {
      return { success: false, isMember: false, message: '缺少频道/群组 ID' };
    }

    // 获取用户的 Telegram ID
    const tgId = user?.tgId;

    if (!tgId) {
      return { success: false, isMember: false, message: '未找到 Telegram ID' };
    }

    const result = await this.telegramService.checkChatMember(Number(tgId), chatId);

    return {
      success: true,
      isMember: result.isMember,
      status: result.status,
      message: result.isMember ? '已确认加入' : '尚未加入',
      error: result.error,
    };
  }

  /**
   * 获取频道/群组信息
   */
  @Get('chat-info/:chatId')
  async getChatInfo(@Param('chatId') chatId: string) {
    if (!chatId) {
      return { success: false, message: '缺少频道/群组 ID' };
    }

    const chatInfo = await this.telegramService.getChatInfo(chatId);

    if (chatInfo) {
      return {
        success: true,
        chat: {
          id: chatInfo.id,
          type: chatInfo.type,
          title: chatInfo.title,
          username: chatInfo.username,
          description: chatInfo.description,
        },
      };
    }

    return { success: false, message: '获取频道信息失败' };
  }

  // ==================== Webhook 相关 ====================

  /**
   * 设置 Webhook URL
   */
  @Post('webhook/set')
  async setWebhook(@Body() body: { url: string }) {
    const { url } = body;
    if (!url) {
      return { success: false, message: '缺少 webhook URL' };
    }
    return this.telegramService.setWebhook(url);
  }

  /**
   * 删除 Webhook
   */
  @Post('webhook/delete')
  async deleteWebhook() {
    return this.telegramService.deleteWebhook();
  }

  /**
   * 获取 Webhook 信息
   */
  @Get('webhook/info')
  async getWebhookInfo() {
    const info = await this.telegramService.getWebhookInfo();
    return { success: true, info };
  }
}

/**
 * Bot Webhook Controller - 处理 Telegram Bot 更新
 * 独立的 Controller，路由为 /bot/webhook
 */
@Controller('bot')
export class BotWebhookController {
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Telegram Bot Webhook 端点
   * 接收来自 Telegram 的更新（消息、命令等）
   */
  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    console.log('📥 收到 Telegram 更新:', JSON.stringify(update, null, 2));

    try {
      // 处理消息
      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || '';
        const user = message.from;
        const userName = user?.first_name || user?.username || '用户';

        // 处理 /start 命令
        if (text.startsWith('/start')) {
          // 提取 start 参数（如 /start ref_123456）
          const parts = text.split(' ');
          const startParam = parts.length > 1 ? parts[1] : undefined;
          // 获取用户语言设置
          const languageCode = user?.language_code;

          console.log(`🚀 处理 /start 命令, chatId: ${chatId}, startParam: ${startParam}, lang: ${languageCode}`);

          await this.telegramService.handleStartCommand(chatId, userName, startParam, languageCode);
        }
      }

      return { ok: true };
    } catch (error) {
      console.error('处理 webhook 更新失败:', error);
      return { ok: true }; // 始终返回 ok，避免 Telegram 重试
    }
  }
}
