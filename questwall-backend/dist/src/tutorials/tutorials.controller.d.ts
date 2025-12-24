import { TutorialsService } from './tutorials.service';
export declare class TutorialsController {
    private readonly tutorialsService;
    constructor(tutorialsService: TutorialsService);
    findAll(page?: string, pageSize?: string, category?: string, lang?: string): Promise<{
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
    getCategories(lang?: string): Promise<{
        count: number;
        value: string;
        label: string;
        icon: string;
    }[]>;
    findOne(id: string, lang?: string): Promise<{
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
}
