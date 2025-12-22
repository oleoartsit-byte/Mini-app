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
exports.TwitterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const twitter_service_1 = require("./twitter.service");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
const verificationCodes = new Map();
let TwitterController = class TwitterController {
    constructor(twitterService, prisma) {
        this.twitterService = twitterService;
        this.prisma = prisma;
    }
    async getBindingStatus(user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: BigInt(user.id) },
            select: {
                twitterId: true,
                twitterUsername: true,
                twitterBindAt: true,
            },
        });
        if (!dbUser) {
            return { bound: false };
        }
        return {
            bound: !!dbUser.twitterId,
            twitterId: dbUser.twitterId,
            twitterUsername: dbUser.twitterUsername,
            bindAt: dbUser.twitterBindAt,
        };
    }
    async getVerificationCode(user) {
        const userId = user.id;
        const existing = verificationCodes.get(userId);
        if (existing && existing.expiresAt > new Date()) {
            return {
                success: true,
                code: existing.code,
                expiresAt: existing.expiresAt,
            };
        }
        const code = `QW_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        verificationCodes.set(userId, { code, expiresAt });
        return {
            success: true,
            code,
            expiresAt,
        };
    }
    async verifyAndBind(user, dto) {
        const { username } = dto;
        const userId = user.id;
        if (!username) {
            return {
                success: false,
                message: '请提供 Twitter 用户名',
            };
        }
        const verification = verificationCodes.get(userId);
        if (!verification) {
            return {
                success: false,
                message: '请先获取验证码',
            };
        }
        if (verification.expiresAt < new Date()) {
            verificationCodes.delete(userId);
            return {
                success: false,
                message: '验证码已过期，请重新获取',
            };
        }
        const cleanUsername = username.startsWith('@')
            ? username.substring(1)
            : username;
        const twitterUser = await this.twitterService.getUserByUsername(cleanUsername);
        if (!twitterUser) {
            return {
                success: false,
                message: `Twitter 账号 @${cleanUsername} 不存在或无法访问`,
            };
        }
        const verifyResult = await this.twitterService.verifyQuoteTweetWithCode(twitterUser.id, verification.code);
        if (!verifyResult.verified) {
            return {
                success: false,
                message: verifyResult.message,
            };
        }
        const existingBinding = await this.prisma.user.findFirst({
            where: {
                twitterId: twitterUser.id,
                NOT: { id: BigInt(userId) },
            },
        });
        if (existingBinding) {
            return {
                success: false,
                message: '该 Twitter 账号已被其他用户绑定',
            };
        }
        const currentUser = await this.prisma.user.findUnique({
            where: { id: BigInt(userId) },
            select: { tgId: true },
        });
        if (!currentUser) {
            return {
                success: false,
                message: '用户不存在',
            };
        }
        const bindHistory = await this.prisma.twitterBindHistory.findUnique({
            where: { twitterId: twitterUser.id },
        });
        if (bindHistory && bindHistory.ownerTgId !== currentUser.tgId) {
            return {
                success: false,
                message: '该 Twitter 账号已被其他用户绑定过，无法绑定到您的账号',
                code: 'TWITTER_ALREADY_OWNED',
            };
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: BigInt(userId) },
                data: {
                    twitterId: twitterUser.id,
                    twitterUsername: twitterUser.screen_name,
                    twitterBindAt: new Date(),
                },
            });
            if (bindHistory) {
                await tx.twitterBindHistory.update({
                    where: { twitterId: twitterUser.id },
                    data: {
                        twitterUsername: twitterUser.screen_name,
                        bindCount: { increment: 1 },
                        lastBindAt: new Date(),
                    },
                });
            }
            else {
                await tx.twitterBindHistory.create({
                    data: {
                        twitterId: twitterUser.id,
                        twitterUsername: twitterUser.screen_name,
                        ownerTgId: currentUser.tgId,
                    },
                });
            }
        });
        verificationCodes.delete(userId);
        console.log(`✅ 用户 ${userId} 通过推文验证绑定 Twitter: @${twitterUser.screen_name} (ID: ${twitterUser.id})`);
        return {
            success: true,
            message: `成功绑定 Twitter 账号 @${twitterUser.screen_name}`,
            twitter: {
                id: twitterUser.id,
                username: twitterUser.screen_name,
                name: twitterUser.name,
                followersCount: twitterUser.followers_count,
            },
        };
    }
    async bindTwitter(user, dto) {
        const { username } = dto;
        if (!username) {
            return {
                success: false,
                message: '请提供 Twitter 用户名',
            };
        }
        const cleanUsername = username.startsWith('@')
            ? username.substring(1)
            : username;
        const twitterUser = await this.twitterService.getUserByUsername(cleanUsername);
        if (!twitterUser) {
            return {
                success: false,
                message: `Twitter 账号 @${cleanUsername} 不存在或无法访问`,
            };
        }
        const existingBinding = await this.prisma.user.findFirst({
            where: {
                twitterId: twitterUser.id,
                NOT: { id: BigInt(user.id) },
            },
        });
        if (existingBinding) {
            return {
                success: false,
                message: '该 Twitter 账号已被其他用户绑定',
            };
        }
        await this.prisma.user.update({
            where: { id: BigInt(user.id) },
            data: {
                twitterId: twitterUser.id,
                twitterUsername: twitterUser.screen_name,
                twitterBindAt: new Date(),
            },
        });
        console.log(`✅ 用户 ${user.id} 绑定 Twitter: @${twitterUser.screen_name} (ID: ${twitterUser.id})`);
        return {
            success: true,
            message: `成功绑定 Twitter 账号 @${twitterUser.screen_name}`,
            twitter: {
                id: twitterUser.id,
                username: twitterUser.screen_name,
                name: twitterUser.name,
                followersCount: twitterUser.followers_count,
            },
        };
    }
    async unbindTwitter(user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: BigInt(user.id) },
            select: { twitterUsername: true },
        });
        if (!dbUser?.twitterUsername) {
            return {
                success: false,
                message: '您还未绑定 Twitter 账号',
            };
        }
        await this.prisma.user.update({
            where: { id: BigInt(user.id) },
            data: {
                twitterId: null,
                twitterUsername: null,
                twitterBindAt: null,
            },
        });
        console.log(`✅ 用户 ${user.id} 解绑 Twitter: @${dbUser.twitterUsername}`);
        return {
            success: true,
            message: 'Twitter 账号已解绑',
        };
    }
    async searchUser(username) {
        if (!username) {
            return { success: false, message: '请提供用户名' };
        }
        const cleanUsername = username.startsWith('@')
            ? username.substring(1)
            : username;
        const twitterUser = await this.twitterService.getUserByUsername(cleanUsername);
        if (!twitterUser) {
            return {
                success: false,
                message: `未找到 Twitter 用户 @${cleanUsername}`,
            };
        }
        return {
            success: true,
            user: {
                id: twitterUser.id,
                username: twitterUser.screen_name,
                name: twitterUser.name,
                followersCount: twitterUser.followers_count,
                followingCount: twitterUser.following_count,
            },
        };
    }
};
exports.TwitterController = TwitterController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取 Twitter 绑定状态' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwitterController.prototype, "getBindingStatus", null);
__decorate([
    (0, common_1.Get)('verification-code'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取 Twitter 绑定验证码' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwitterController.prototype, "getVerificationCode", null);
__decorate([
    (0, common_1.Post)('verify-and-bind'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '验证 Twitter 推文并绑定（引用转发方式）' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TwitterController.prototype, "verifyAndBind", null);
__decorate([
    (0, common_1.Post)('bind'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '绑定 Twitter 账号' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TwitterController.prototype, "bindTwitter", null);
__decorate([
    (0, common_1.Delete)('unbind'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '解绑 Twitter 账号' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwitterController.prototype, "unbindTwitter", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '搜索 Twitter 用户' }),
    __param(0, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TwitterController.prototype, "searchUser", null);
exports.TwitterController = TwitterController = __decorate([
    (0, swagger_1.ApiTags)('twitter'),
    (0, common_1.Controller)('twitter'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [twitter_service_1.TwitterService,
        prisma_service_1.PrismaService])
], TwitterController);
//# sourceMappingURL=twitter.controller.js.map