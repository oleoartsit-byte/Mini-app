"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let TelegramController = class TelegramController {
    constructor(telegramService) {
        this.telegramService = telegramService;
    }
    async sendTestMessage(req) {
        const telegramId = req.user?.telegramId;
        if (!telegramId) {
            return { success: false, message: '未找到 Telegram ID' };
        }
        const result = await this.telegramService.sendMessage(telegramId, '🔔 *测试通知*\n\n这是一条来自 Quest Wall 的测试消息。\n\n如果您收到此消息，说明通知功能正常工作！');
        return result;
    }
    async sendMessage(body) {
        const { telegramId, message, buttons } = body;
        if (!telegramId || !message) {
            return { success: false, message: '缺少必要参数' };
        }
        if (buttons && buttons.length > 0) {
            return this.telegramService.sendMessageWithButtons(telegramId, message, buttons);
        }
        return this.telegramService.sendMessage(telegramId, message);
    }
    async sendQuestCompletedNotification(body) {
        const { telegramId, questTitle, rewardAmount, rewardType } = body;
        const success = await this.telegramService.sendQuestCompletedNotification(telegramId, questTitle, rewardAmount, rewardType);
        return { success };
    }
    async sendQuestReviewNotification(body) {
        const { telegramId, questTitle, approved, rewardAmount, rewardType, reason } = body;
        let success;
        if (approved) {
            success = await this.telegramService.sendQuestApprovedNotification(telegramId, questTitle, rewardAmount || 0, rewardType || 'STARS');
        }
        else {
            success = await this.telegramService.sendQuestRejectedNotification(telegramId, questTitle, reason || '未通过审核');
        }
        return { success };
    }
    async sendCheckInNotification(body) {
        const { telegramId, streak, reward } = body;
        const success = await this.telegramService.sendCheckInNotification(telegramId, streak, reward);
        return { success };
    }
    async sendInviteSuccessNotification(body) {
        const { telegramId, inviteeName, reward } = body;
        const success = await this.telegramService.sendInviteSuccessNotification(telegramId, inviteeName, reward);
        return { success };
    }
    async sendWelcomeNotification(body) {
        const { telegramId, userName } = body;
        const success = await this.telegramService.sendWelcomeNotification(telegramId, userName);
        return { success };
    }
    async broadcastNewQuest(body) {
        const { telegramIds, questTitle, rewardAmount, rewardType } = body;
        const result = await this.telegramService.sendNewQuestNotification(telegramIds, questTitle, rewardAmount, rewardType);
        return result;
    }
    async getStatus() {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        return {
            configured: !!botToken,
            tokenPrefix: botToken ? botToken.substring(0, 10) + '...' : null,
        };
    }
    async verifyMember(body, user) {
        const { chatId } = body;
        if (!chatId) {
            return { success: false, isMember: false, message: '缺少频道/群组 ID' };
        }
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
    async getChatInfo(chatId) {
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
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendTestMessage", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('quest-completed'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendQuestCompletedNotification", null);
__decorate([
    (0, common_1.Post)('quest-review'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendQuestReviewNotification", null);
__decorate([
    (0, common_1.Post)('checkin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendCheckInNotification", null);
__decorate([
    (0, common_1.Post)('invite-success'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendInviteSuccessNotification", null);
__decorate([
    (0, common_1.Post)('welcome'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendWelcomeNotification", null);
__decorate([
    (0, common_1.Post)('broadcast-quest'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "broadcastNewQuest", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "getStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('verify-member'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "verifyMember", null);
__decorate([
    (0, common_1.Get)('chat-info/:chatId'),
    __param(0, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "getChatInfo", null);
exports.TelegramController = TelegramController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map