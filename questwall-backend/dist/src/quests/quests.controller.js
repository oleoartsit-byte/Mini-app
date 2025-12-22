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
exports.QuestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quests_service_1 = require("./quests.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const public_decorator_1 = require("../auth/public.decorator");
const geoip_service_1 = require("../geoip/geoip.service");
let QuestsController = class QuestsController {
    constructor(questsService, geoipService) {
        this.questsService = questsService;
        this.geoipService = geoipService;
    }
    async findAll(page, pageSize, lang, user, req) {
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 20;
        const userId = user ? BigInt(user.id) : undefined;
        const language = lang || 'zh';
        const forwardedFor = req?.headers['x-forwarded-for'];
        const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || req?.ip;
        const countryCode = ip ? this.geoipService.getCountryCode(ip) : null;
        console.log(`📍 用户请求: IP=${ip}, 国家=${countryCode || '未知'}`);
        return this.questsService.findAll(pageNum, pageSizeNum, userId, language, countryCode);
    }
    async getMyQuests(user) {
        return this.questsService.getUserQuests(BigInt(user.id));
    }
    async findOne(id, lang) {
        return this.questsService.findOne(BigInt(id), lang || 'zh');
    }
    async create(createQuestDto, user) {
        return this.questsService.create(BigInt(user.id), createQuestDto);
    }
    async claim(id, user, req) {
        const ip = req.ip || req.headers['x-forwarded-for'];
        const visitorId = req.headers['x-visitor-id'];
        return this.questsService.claim(BigInt(user.id), BigInt(id), ip, visitorId);
    }
    async submit(id, submitDto, user) {
        return this.questsService.submit(BigInt(user.id), BigInt(id), submitDto);
    }
    async reward(id, user) {
        return this.questsService.reward(BigInt(user.id), BigInt(id));
    }
};
exports.QuestsController = QuestsController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '获取任务列表' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lang', required: false, type: String, description: '语言: zh | en' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('lang')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取我的任务列表' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "getMyQuests", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '获取任务详情' }),
    (0, swagger_1.ApiQuery)({ name: 'lang', required: false, type: String, description: '语言: zh | en' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '创建任务（广告主）' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/claim'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '领取任务' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "claim", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '提交任务证明' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/reward'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '发放奖励（管理接口）' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "reward", null);
exports.QuestsController = QuestsController = __decorate([
    (0, swagger_1.ApiTags)('quests'),
    (0, common_1.Controller)('quests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [quests_service_1.QuestsService,
        geoip_service_1.GeoipService])
], QuestsController);
//# sourceMappingURL=quests.controller.js.map