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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(jwtService, prisma, telegramService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.telegramService = telegramService;
    }
    async telegramAuth(initData) {
        const isDev = process.env.NODE_ENV === 'development';
        const isValid = isDev || this.verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Telegram initData');
        }
        const tgUser = this.parseInitData(initData);
        if (!tgUser.id) {
            throw new common_1.UnauthorizedException('Invalid user data');
        }
        let user = await this.prisma.user.findUnique({
            where: { tgId: BigInt(tgUser.id) }
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    tgId: BigInt(tgUser.id),
                    username: tgUser.username || null,
                    firstName: tgUser.first_name || null,
                    lastName: tgUser.last_name || null,
                    avatarUrl: tgUser.photo_url || null,
                    locale: tgUser.language_code || 'en',
                }
            });
            console.log(`✅ New user created: ${user.tgId}`);
            const userName = tgUser.first_name || tgUser.username || 'Quest Hunter';
            this.telegramService.sendWelcomeNotification(user.tgId, userName).catch(err => {
                console.error('发送欢迎通知失败:', err);
            });
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    username: tgUser.username || user.username,
                    firstName: tgUser.first_name || user.firstName,
                    lastName: tgUser.last_name || user.lastName,
                    avatarUrl: tgUser.photo_url || user.avatarUrl,
                    locale: tgUser.language_code || user.locale,
                }
            });
        }
        const payload = {
            sub: user.id.toString(),
            tg_id: user.tgId.toString(),
            username: user.username,
        };
        const token = this.jwtService.sign(payload);
        return {
            token,
            expiresIn: 900,
            user: {
                id: user.id.toString(),
                tg_id: user.tgId.toString(),
                username: user.username,
                first_name: user.firstName,
                last_name: user.lastName,
                avatar_url: user.avatarUrl,
                locale: user.locale,
                wallet_addr: user.walletAddr,
            }
        };
    }
    async devLogin() {
        const devTgId = BigInt(123456789);
        let user = await this.prisma.user.findUnique({
            where: { tgId: devTgId }
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    tgId: devTgId,
                    username: 'dev_user',
                    firstName: 'Dev',
                    lastName: 'User',
                    locale: 'zh',
                }
            });
            console.log('✅ Dev user created:', user.id.toString());
        }
        const payload = {
            sub: user.id.toString(),
            tg_id: user.tgId.toString(),
            username: user.username,
        };
        const token = this.jwtService.sign(payload);
        return {
            token,
            expiresIn: 86400,
            user: {
                id: user.id.toString(),
                tg_id: user.tgId.toString(),
                username: user.username,
                first_name: user.firstName,
                last_name: user.lastName,
                locale: user.locale,
                wallet_addr: user.walletAddr,
            }
        };
    }
    async refreshToken(oldToken) {
        try {
            const payload = this.jwtService.verify(oldToken);
            const user = await this.prisma.user.findUnique({
                where: { id: BigInt(payload.sub) }
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const newPayload = {
                sub: user.id.toString(),
                tg_id: user.tgId.toString(),
                username: user.username,
            };
            const newToken = this.jwtService.sign(newPayload);
            return {
                token: newToken,
                expiresIn: 900
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async getUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId }
        });
    }
    async getUserByTgId(tgId) {
        return this.prisma.user.findUnique({
            where: { tgId }
        });
    }
    async getNotificationPrefs(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { notificationPrefs: true }
        });
        if (!user) {
            return null;
        }
        return user.notificationPrefs;
    }
    async updateNotificationPrefs(userId, prefs) {
        const currentPrefs = await this.getNotificationPrefs(userId) || {
            questComplete: true,
            reward: true,
            newQuest: true,
            checkIn: true,
            invite: true,
        };
        const newPrefs = { ...currentPrefs, ...prefs };
        await this.prisma.user.update({
            where: { id: userId },
            data: { notificationPrefs: newPrefs }
        });
        return newPrefs;
    }
    async canSendNotification(userId, type) {
        const prefs = await this.getNotificationPrefs(userId);
        if (!prefs)
            return true;
        return prefs[type] !== false;
    }
    verifyTelegramInitData(initData, botToken) {
        try {
            const params = new URLSearchParams(initData);
            const hash = params.get('hash');
            if (!hash)
                return false;
            params.delete('hash');
            const sortedParams = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
            const dataCheckString = sortedParams.map(([key, value]) => `${key}=${value}`).join('\n');
            const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken || '').digest();
            const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
            return calculatedHash === hash;
        }
        catch (error) {
            console.error('Error verifying Telegram initData:', error);
            return false;
        }
    }
    parseInitData(initData) {
        try {
            const params = new URLSearchParams(initData);
            const userJson = params.get('user');
            if (userJson) {
                return JSON.parse(decodeURIComponent(userJson));
            }
            return {};
        }
        catch (error) {
            console.error('Error parsing initData:', error);
            return {};
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], AuthService);
//# sourceMappingURL=auth.service.js.map