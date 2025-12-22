import { CurrentUserData } from '../auth/current-user.decorator';
import { TwitterService } from './twitter.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TwitterController {
    private readonly twitterService;
    private readonly prisma;
    constructor(twitterService: TwitterService, prisma: PrismaService);
    getBindingStatus(user: CurrentUserData): Promise<{
        bound: boolean;
        twitterId?: undefined;
        twitterUsername?: undefined;
        bindAt?: undefined;
    } | {
        bound: boolean;
        twitterId: string;
        twitterUsername: string;
        bindAt: Date;
    }>;
    getVerificationCode(user: CurrentUserData): Promise<{
        success: boolean;
        code: string;
        expiresAt: Date;
    }>;
    verifyAndBind(user: CurrentUserData, dto: {
        username: string;
    }): Promise<{
        success: boolean;
        message: string;
        code?: undefined;
        twitter?: undefined;
    } | {
        success: boolean;
        message: string;
        code: string;
        twitter?: undefined;
    } | {
        success: boolean;
        message: string;
        twitter: {
            id: string;
            username: string;
            name: string;
            followersCount: number;
        };
        code?: undefined;
    }>;
    bindTwitter(user: CurrentUserData, dto: {
        username: string;
    }): Promise<{
        success: boolean;
        message: string;
        twitter?: undefined;
    } | {
        success: boolean;
        message: string;
        twitter: {
            id: string;
            username: string;
            name: string;
            followersCount: number;
        };
    }>;
    unbindTwitter(user: CurrentUserData): Promise<{
        success: boolean;
        message: string;
    }>;
    searchUser(username: string): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: {
            id: string;
            username: string;
            name: string;
            followersCount: number;
            followingCount: number;
        };
        message?: undefined;
    }>;
}
