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
exports.TutorialsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tutorials_service_1 = require("./tutorials.service");
const public_decorator_1 = require("../auth/public.decorator");
let TutorialsController = class TutorialsController {
    constructor(tutorialsService) {
        this.tutorialsService = tutorialsService;
    }
    async findAll(page, pageSize, category, lang) {
        const pageNum = parseInt(page) || 1;
        const pageSizeNum = parseInt(pageSize) || 20;
        const language = lang || 'zh';
        return this.tutorialsService.findAll(pageNum, pageSizeNum, category, language);
    }
    async getCategories(lang) {
        return this.tutorialsService.getCategories(lang || 'zh');
    }
    async findOne(id, lang) {
        const tutorial = await this.tutorialsService.findOne(BigInt(id), lang || 'zh');
        if (!tutorial) {
            throw new common_1.NotFoundException('教程不存在');
        }
        return tutorial;
    }
};
exports.TutorialsController = TutorialsController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '获取教程列表' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'lang', required: false, type: String, description: '语言: zh | en' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TutorialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '获取教程分类列表' }),
    (0, swagger_1.ApiQuery)({ name: 'lang', required: false, type: String, description: '语言: zh | en' }),
    __param(0, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TutorialsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: '获取教程详情' }),
    (0, swagger_1.ApiQuery)({ name: 'lang', required: false, type: String, description: '语言: zh | en' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('lang')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TutorialsController.prototype, "findOne", null);
exports.TutorialsController = TutorialsController = __decorate([
    (0, swagger_1.ApiTags)('tutorials'),
    (0, common_1.Controller)('tutorials'),
    __metadata("design:paramtypes", [tutorials_service_1.TutorialsService])
], TutorialsController);
//# sourceMappingURL=tutorials.controller.js.map