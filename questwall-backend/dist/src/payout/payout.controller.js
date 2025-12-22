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
exports.PayoutController = void 0;
const common_1 = require("@nestjs/common");
const payout_service_1 = require("./payout.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PayoutController = class PayoutController {
    constructor(payoutService) {
        this.payoutService = payoutService;
    }
    async getBalance(req) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        return this.payoutService.getBalance(userId);
    }
    async requestWithdraw(body, req) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        return this.payoutService.requestWithdraw(userId, 'USDT', body.amount, body.toAddress);
    }
    async getHistory(page, pageSize, req) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        return this.payoutService.getHistory(userId, parseInt(page) || 1, parseInt(pageSize) || 10);
    }
    async getPayoutDetail(id, req) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        return this.payoutService.getPayoutDetail(userId, BigInt(id));
    }
    async cancelWithdraw(id, req) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        return this.payoutService.cancelWithdraw(userId, BigInt(id));
    }
    async getTransactionHistory(page, pageSize, req) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        return this.payoutService.getTransactionHistory(userId, parseInt(page) || 1, parseInt(pageSize) || 20);
    }
};
exports.PayoutController = PayoutController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "requestWithdraw", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getPayoutDetail", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "cancelWithdraw", null);
__decorate([
    (0, common_1.Get)('transactions/all'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PayoutController.prototype, "getTransactionHistory", null);
exports.PayoutController = PayoutController = __decorate([
    (0, common_1.Controller)('payout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payout_service_1.PayoutService])
], PayoutController);
//# sourceMappingURL=payout.controller.js.map