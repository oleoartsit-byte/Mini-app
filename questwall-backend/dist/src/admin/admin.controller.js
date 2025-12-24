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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_1 = require("@nestjs/jwt");
class AdminAuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    validate(token) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'admin') {
                throw new common_1.UnauthorizedException('无效的管理员令牌');
            }
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('未授权访问');
        }
    }
}
let AdminController = class AdminController {
    constructor(adminService, jwtService) {
        this.adminService = adminService;
        this.jwtService = jwtService;
        this.authGuard = new AdminAuthGuard(jwtService);
    }
    validateAdmin(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('未提供认证令牌');
        }
        const token = authHeader.replace('Bearer ', '');
        return this.authGuard.validate(token);
    }
    async login(body) {
        return this.adminService.login(body.username, body.password);
    }
    async initAdmin(body) {
        return this.adminService.createAdmin(body.username, body.password, 'super_admin');
    }
    async getCurrentAdmin(authHeader) {
        const admin = this.validateAdmin(authHeader);
        return {
            id: admin.sub,
            username: admin.username,
            role: admin.role,
        };
    }
    async getDashboardStats(authHeader) {
        this.validateAdmin(authHeader);
        return this.adminService.getDashboardStats();
    }
    async getQuests(authHeader, page, pageSize, status) {
        this.validateAdmin(authHeader);
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 10;
        const questStatus = status ? status : undefined;
        return this.adminService.getQuests(pageNum, pageSizeNum, questStatus);
    }
    async getQuestDetail(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.getQuestDetail(BigInt(id));
    }
    async createQuest(authHeader, body) {
        this.validateAdmin(authHeader);
        return this.adminService.createQuest(body);
    }
    async updateQuest(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.updateQuest(BigInt(id), body);
    }
    async updateQuestStatus(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.updateQuestStatus(BigInt(id), body.status);
    }
    async deleteQuest(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.deleteQuest(BigInt(id));
    }
    async getUsers(authHeader, page, pageSize, search) {
        this.validateAdmin(authHeader);
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 10;
        return this.adminService.getUsers(pageNum, pageSizeNum, search);
    }
    async getUserDetail(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.getUserDetail(BigInt(id));
    }
    async getUserCompletedQuests(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.getUserCompletedQuests(BigInt(id));
    }
    async getRewards(authHeader, page, pageSize) {
        this.validateAdmin(authHeader);
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 10;
        return this.adminService.getRewards(pageNum, pageSizeNum);
    }
    async getPayouts(authHeader, page, pageSize, status) {
        this.validateAdmin(authHeader);
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 10;
        const payoutStatus = status ? status : undefined;
        return this.adminService.getPayouts(pageNum, pageSizeNum, payoutStatus);
    }
    async getPayoutStats(authHeader) {
        this.validateAdmin(authHeader);
        return this.adminService.getPayoutStats();
    }
    async getPayoutDetail(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.getPayoutDetail(BigInt(id));
    }
    async approvePayout(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.approvePayout(BigInt(id), body.txHash);
    }
    async rejectPayout(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.rejectPayout(BigInt(id), body.reason);
    }
    async completePayout(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.completePayout(BigInt(id), body.txHash, body.proofImage);
    }
    async getRiskEvents(authHeader, page, pageSize, severity, eventType) {
        this.validateAdmin(authHeader);
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 20;
        return this.adminService.getRiskEvents(pageNum, pageSizeNum, severity, eventType);
    }
    async getRiskStats(authHeader) {
        this.validateAdmin(authHeader);
        return this.adminService.getRiskStats();
    }
    async getUserRiskHistory(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.getUserRiskHistory(BigInt(id));
    }
    async getBlacklist(authHeader, type) {
        this.validateAdmin(authHeader);
        const blacklistType = type ? type : undefined;
        return this.adminService.getBlacklist(blacklistType);
    }
    async addToBlacklist(authHeader, body) {
        this.validateAdmin(authHeader);
        const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
        return this.adminService.addToBlacklist(body.type, body.value, body.reason, expiresAt);
    }
    async removeFromBlacklist(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.removeFromBlacklist(BigInt(id));
    }
    async getPendingReviews(authHeader, page, pageSize, status) {
        this.validateAdmin(authHeader);
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 10;
        const actionStatus = status ? status : undefined;
        return this.adminService.getPendingReviews(pageNum, pageSizeNum, actionStatus);
    }
    async getReviewStats(authHeader) {
        this.validateAdmin(authHeader);
        return this.adminService.getReviewStats();
    }
    async getReviewDetail(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.getReviewDetail(BigInt(id));
    }
    async approveReview(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.approveReview(BigInt(id));
    }
    async rejectReview(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.rejectReview(BigInt(id), body.reason);
    }
    async getTutorials(authHeader, page, pageSize, status) {
        this.validateAdmin(authHeader);
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 10;
        const tutorialStatus = status ? status : undefined;
        return this.adminService.getTutorials(pageNum, pageSizeNum, tutorialStatus);
    }
    async getTutorialDetail(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.getTutorialDetail(BigInt(id));
    }
    async createTutorial(authHeader, body) {
        this.validateAdmin(authHeader);
        return this.adminService.createTutorial(body);
    }
    async updateTutorial(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.updateTutorial(BigInt(id), body);
    }
    async updateTutorialStatus(authHeader, id, body) {
        this.validateAdmin(authHeader);
        return this.adminService.updateTutorialStatus(BigInt(id), body.status);
    }
    async deleteTutorial(authHeader, id) {
        this.validateAdmin(authHeader);
        return this.adminService.deleteTutorial(BigInt(id));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, swagger_1.ApiOperation)({ summary: '管理员登录' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/init'),
    (0, swagger_1.ApiOperation)({ summary: '初始化管理员账号（仅首次使用）' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "initAdmin", null);
__decorate([
    (0, common_1.Get)('auth/me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取当前管理员信息' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCurrentAdmin", null);
__decorate([
    (0, common_1.Get)('stats/dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取仪表盘统计数据' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('quests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取任务列表（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getQuests", null);
__decorate([
    (0, common_1.Get)('quests/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取任务详情（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getQuestDetail", null);
__decorate([
    (0, common_1.Post)('quests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '创建任务（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createQuest", null);
__decorate([
    (0, common_1.Put)('quests/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '更新任务（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateQuest", null);
__decorate([
    (0, common_1.Patch)('quests/:id/status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '更新任务状态（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateQuestStatus", null);
__decorate([
    (0, common_1.Delete)('quests/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '删除任务（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteQuest", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户列表（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户详情（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Get)('users/:id/completed-quests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户已完成的任务列表（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserCompletedQuests", null);
__decorate([
    (0, common_1.Get)('rewards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取奖励记录（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRewards", null);
__decorate([
    (0, common_1.Get)('payouts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取提现列表（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPayouts", null);
__decorate([
    (0, common_1.Get)('payouts/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取提现统计（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPayoutStats", null);
__decorate([
    (0, common_1.Get)('payouts/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取提现详情（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPayoutDetail", null);
__decorate([
    (0, common_1.Post)('payouts/:id/approve'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '审核通过提现（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approvePayout", null);
__decorate([
    (0, common_1.Post)('payouts/:id/reject'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '拒绝提现（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectPayout", null);
__decorate([
    (0, common_1.Post)('payouts/:id/complete'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '完成提现（填写交易哈希或上传截图）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "completePayout", null);
__decorate([
    (0, common_1.Get)('risk/events'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取风控事件列表' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'severity', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'eventType', required: false, type: String }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('severity')),
    __param(4, (0, common_1.Query)('eventType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRiskEvents", null);
__decorate([
    (0, common_1.Get)('risk/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取风控统计' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRiskStats", null);
__decorate([
    (0, common_1.Get)('risk/user/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户风控历史' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserRiskHistory", null);
__decorate([
    (0, common_1.Get)('blacklist'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取黑名单列表' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBlacklist", null);
__decorate([
    (0, common_1.Post)('blacklist'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '添加到黑名单' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addToBlacklist", null);
__decorate([
    (0, common_1.Delete)('blacklist/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '从黑名单移除' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeFromBlacklist", null);
__decorate([
    (0, common_1.Get)('reviews'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取待审核截图列表' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, description: 'SUBMITTED | VERIFIED | REJECTED' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingReviews", null);
__decorate([
    (0, common_1.Get)('reviews/stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取审核统计' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReviewStats", null);
__decorate([
    (0, common_1.Get)('reviews/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取审核详情' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReviewDetail", null);
__decorate([
    (0, common_1.Post)('reviews/:id/approve'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '审核通过（发放奖励）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveReview", null);
__decorate([
    (0, common_1.Post)('reviews/:id/reject'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '审核拒绝' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectReview", null);
__decorate([
    (0, common_1.Get)('tutorials'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取教程列表（管理员）' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTutorials", null);
__decorate([
    (0, common_1.Get)('tutorials/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取教程详情（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTutorialDetail", null);
__decorate([
    (0, common_1.Post)('tutorials'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '创建教程（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createTutorial", null);
__decorate([
    (0, common_1.Put)('tutorials/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '更新教程（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateTutorial", null);
__decorate([
    (0, common_1.Patch)('tutorials/:id/status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '更新教程状态（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateTutorialStatus", null);
__decorate([
    (0, common_1.Delete)('tutorials/:id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '删除教程（管理员）' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteTutorial", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        jwt_1.JwtService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map