import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Response, Request } from 'express';
import { CurrentUserData } from './current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    devLogin(response: Response): Promise<{
        token: string;
        expiresIn: number;
        user: {
            id: string;
            tg_id: string;
            username: string;
            first_name: string;
            last_name: string;
            locale: string;
            wallet_addr: string;
        };
    } | {
        success: boolean;
        message: string;
    }>;
    telegramAuth(authDto: AuthDto, response: Response): Promise<{
        token: string;
        expiresIn: number;
        user: {
            id: string;
            tg_id: string;
            username: string;
            first_name: string;
            last_name: string;
            avatar_url: string;
            locale: string;
            wallet_addr: string;
        };
    }>;
    refreshToken(request: Request): Promise<{
        token: string;
        expiresIn: number;
    }>;
    getNotificationPrefs(user: CurrentUserData): Promise<{
        success: boolean;
        prefs: {
            questComplete: boolean;
            reward: boolean;
            newQuest: boolean;
            checkIn: boolean;
            invite: boolean;
        };
    }>;
    updateNotificationPrefs(user: CurrentUserData, prefs: Partial<{
        questComplete: boolean;
        reward: boolean;
        newQuest: boolean;
        checkIn: boolean;
        invite: boolean;
    }>): Promise<{
        success: boolean;
        message: string;
        prefs: {
            questComplete: boolean;
            reward: boolean;
            newQuest: boolean;
            checkIn: boolean;
            invite: boolean;
        };
    }>;
}
