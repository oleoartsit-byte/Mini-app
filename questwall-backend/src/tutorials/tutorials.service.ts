import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TutorialStatus } from '@prisma/client';

@Injectable()
export class TutorialsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取已发布的教程列表（前端用户可见）
   */
  async findAll(
    page: number = 1,
    pageSize: number = 20,
    category?: string,
    language: string = 'zh',
  ) {
    const skip = (page - 1) * pageSize;

    const where = {
      status: TutorialStatus.PUBLISHED,
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

    // 根据语言处理返回数据
    const formattedItems = items.map((item) => this.formatTutorial(item, language));

    return {
      items: formattedItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取教程详情
   */
  async findOne(id: bigint, language: string = 'zh') {
    const tutorial = await this.prisma.tutorial.findFirst({
      where: {
        id,
        status: TutorialStatus.PUBLISHED,
      },
    });

    if (!tutorial) {
      return null;
    }

    // 增加浏览量
    await this.prisma.tutorial.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return this.formatTutorial(tutorial, language);
  }

  /**
   * 获取教程分类列表
   */
  async getCategories(language: string = 'zh') {
    const categories = [
      { value: 'telegram', label: language === 'zh' ? 'Telegram 教程' : 'Telegram Guide', icon: '📱' },
      { value: 'twitter', label: language === 'zh' ? 'Twitter 教程' : 'Twitter Guide', icon: '🐦' },
      { value: 'wallet', label: language === 'zh' ? '钱包教程' : 'Wallet Guide', icon: '💰' },
      { value: 'invite', label: language === 'zh' ? '邀请教程' : 'Invite Guide', icon: '👥' },
      { value: 'other', label: language === 'zh' ? '其他教程' : 'Other Guides', icon: '📚' },
    ];

    // 获取每个分类的教程数量
    const counts = await this.prisma.tutorial.groupBy({
      by: ['category'],
      where: { status: TutorialStatus.PUBLISHED },
      _count: { id: true },
    });

    const countMap = new Map(counts.map((c) => [c.category, c._count.id]));

    return categories.map((cat) => ({
      ...cat,
      count: countMap.get(cat.value) || 0,
    }));
  }

  /**
   * 根据语言格式化教程数据
   */
  private formatTutorial(tutorial: any, language: string) {
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
}
