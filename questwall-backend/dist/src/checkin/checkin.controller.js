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
exports.CheckInController = void 0;
const common_1 = require("@nestjs/common");
const checkin_service_1 = require("./checkin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CheckInController = class CheckInController {
    constructor(checkInService) {
        this.checkInService = checkInService;
    }
    async getStatus(req, tz) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        const timezoneOffset = parseInt(tz) || 0;
        return this.checkInService.getStatus(userId, timezoneOffset);
    }
    async checkIn(req, body) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        const timezoneOffset = body?.timezoneOffset || 0;
        return this.checkInService.checkIn(userId, timezoneOffset);
    }
    async makeup(body, req) {
        const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
        const timezoneOffset = body.timezoneOffset || 0;
        return this.checkInService.makeup(userId, body.date, timezoneOffset);
    }
    async getLeaderboard(limit) {
        return this.checkInService.getLeaderboard(parseInt(limit) || 10);
    }
    async getConfig() {
        return this.checkInService.getConfig();
    }
};
exports.CheckInController = CheckInController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('tz')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('makeup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "makeup", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CheckInController.prototype, "getConfig", null);
exports.CheckInController = CheckInController = __decorate([
    (0, common_1.Controller)('checkin'),
    __metadata("design:paramtypes", [checkin_service_1.CheckInService])
], CheckInController);
//# sourceMappingURL=checkin.controller.js.map