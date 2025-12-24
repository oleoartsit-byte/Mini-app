import { PrismaService } from '../prisma/prisma.service';
export declare class TutorialsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, pageSize?: number, category?: string, language?: string): Promise<{
        items: {
            id: any;
            type: any;
            category: any;
            title: any;
            description: any;
            content: any;
            coverImage: any;
            videoUrl: any;
            images: any;
            icon: any;
            viewCount: any;
            createdAt: any;
            updatedAt: any;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: bigint, language?: string): Promise<{
        id: any;
        type: any;
        category: any;
        title: any;
        description: any;
        content: any;
        coverImage: any;
        videoUrl: any;
        images: any;
        icon: any;
        viewCount: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getCategories(language?: string): Promise<{
        count: number;
        value: string;
        label: string;
        icon: string;
    }[]>;
    private formatTutorial;
}
