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
exports.TutorialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TutorialsService = class TutorialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, pageSize = 20, category, language = 'zh') {
        const skip = (page - 1) * pageSize;
        const where = {
            status: client_1.TutorialStatus.PUBLISHED,
            ...(category && category !== 'all' ? { category } : {}),
        };
        const [items, total] = await Promise.all([
            this.prisma.tutorial.findMany({
                where,
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                skip,
                take: pageSize,
            }),
            this.prisma.tutorial.count({ where }),
        ]);
        const formattedItems = items.map((item) => this.formatTutorial(item, language));
        return {
            items: formattedItems,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async findOne(id, language = 'zh') {
        const tutorial = await this.prisma.tutorial.findFirst({
            where: {
                id,
                status: client_1.TutorialStatus.PUBLISHED,
            },
        });
        if (!tutorial) {
            return null;
        }
        await this.prisma.tutorial.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
        return this.formatTutorial(tutorial, language);
    }
    async getCategories(language = 'zh') {
        const categories = [
            { value: 'telegram', label: language === 'zh' ? 'Telegram 教程' : 'Telegram Guide', icon: '📱' },
            { value: 'twitter', label: language === 'zh' ? 'Twitter 教程' : 'Twitter Guide', icon: '🐦' },
            { value: 'wallet', label: language === 'zh' ? '钱包教程' : 'Wallet Guide', icon: '💰' },
            { value: 'invite', label: language === 'zh' ? '邀请教程' : 'Invite Guide', icon: '👥' },
            { value: 'other', label: language === 'zh' ? '其他教程' : 'Other Guides', icon: '📚' },
        ];
        const counts = await this.prisma.tutorial.groupBy({
            by: ['category'],
            where: { status: client_1.TutorialStatus.PUBLISHED },
            _count: { id: true },
        });
        const countMap = new Map(counts.map((c) => [c.category, c._count.id]));
        return categories.map((cat) => ({
            ...cat,
            count: countMap.get(cat.value) || 0,
        }));
    }
    formatTutorial(tutorial, language) {
        const isEn = language === 'en';
        return {
            id: tutorial.id.toString(),
            type: tutorial.type,
            category: tutorial.category,
            title: (isEn && tutorial.titleEn) ? tutorial.titleEn : tutorial.title,
            description: (isEn && tutorial.descriptionEn) ? tutorial.descriptionEn : tutorial.description,
            content: (isEn && tutorial.contentEn) ? tutorial.contentEn : tutorial.content,
            coverImage: tutorial.coverImage,
            videoUrl: tutorial.videoUrl,
            images: tutorial.images || [],
            icon: tutorial.icon,
            viewCount: tutorial.viewCount,
            createdAt: tutorial.createdAt,
            updatedAt: tutorial.updatedAt,
        };
    }
};
exports.TutorialsService = TutorialsService;
exports.TutorialsService = TutorialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TutorialsService);
//# sourceMappingURL=tutorials.service.js.map