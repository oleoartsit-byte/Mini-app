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
exports.RiskController = void 0;
const common_1 = require("@nestjs/common");
const risk_service_1 = require("./risk.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RiskController = class RiskController {
    constructor(riskService) {
        this.riskService = riskService;
    }
    async submitFingerprint(fpDto, req) {
        const userId = BigInt(req.user?.sub || '0');
        const ip = req.ip || req.headers['x-forwarded-for'];
        return this.riskService.submitFingerprint(userId, fpDto, ip);
    }
    async getRiskScore(req) {
        const userId = BigInt(req.user?.sub || '0');
        return this.riskService.getRiskScore(userId);
    }
    async checkRisk(body, req) {
        const userId = BigInt(req.user?.sub || '0');
        const ip = req.ip || req.headers['x-forwarded-for'];
        const visitorId = req.headers['x-visitor-id'];
        return this.riskService.checkRisk({
            userId,
            ip,
            visitorId,
            action: body.action,
        });
    }
    async getRiskEvents(userId, eventType, severity, limit) {
        return this.riskService.getRiskEvents({
            userId: userId ? BigInt(userId) : undefined,
            eventType,
            severity,
            limit: limit ? parseInt(limit) : 50,
        });
    }
    async getBlacklist(type) {
        return this.riskService.getBlacklist(type);
    }
    async addToBlacklist(body) {
        return this.riskService.addToBlacklist(body.type, body.value, body.reason, body.expiresAt ? new Date(body.expiresAt) : undefined);
    }
    async removeFromBlacklist(body) {
        return this.riskService.removeFromBlacklist(body.type, body.value);
    }
};
exports.RiskController = RiskController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('fp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "submitFingerprint", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('score'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getRiskScore", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "checkRisk", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('eventType')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getRiskEvents", null);
__decorate([
    (0, common_1.Get)('blacklist'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getBlacklist", null);
__decorate([
    (0, common_1.Post)('blacklist/add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "addToBlacklist", null);
__decorate([
    (0, common_1.Post)('blacklist/remove'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "removeFromBlacklist", null);
exports.RiskController = RiskController = __decorate([
    (0, common_1.Controller)('risk'),
    __metadata("design:paramtypes", [risk_service_1.RiskService])
], RiskController);
//# sourceMappingURL=risk.controller.js.map