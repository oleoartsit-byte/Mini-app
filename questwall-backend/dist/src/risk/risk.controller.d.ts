import { RiskService } from './risk.service';
import { Request } from 'express';
export declare class RiskController {
    private readonly riskService;
    constructor(riskService: RiskService);
    submitFingerprint(fpDto: any, req: Request): Promise<{
        success: boolean;
        blocked: boolean;
        reason: string;
        message?: undefined;
        riskIndicators?: undefined;
    } | {
        success: boolean;
        message: string;
        riskIndicators: {
            usersOnDevice: number;
            isNew: boolean;
        };
        blocked?: undefined;
        reason?: undefined;
    }>;
    getRiskScore(req: Request): Promise<{
        userId: string;
        score: number;
        level: string;
        factors: string[];
        shouldBlock: boolean;
    }>;
    checkRisk(body: {
        action?: string;
    }, req: Request): Promise<{
        allowed: boolean;
        reason?: string;
        score?: number;
    }>;
    getRiskEvents(userId?: string, eventType?: string, severity?: string, limit?: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        visitorId: string | null;
        ip: string | null;
        eventType: string;
        severity: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getBlacklist(type?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.BlacklistType;
        createdAt: Date;
        value: string;
        reason: string | null;
        expiresAt: Date | null;
    }[]>;
    addToBlacklist(body: {
        type: 'USER' | 'DEVICE' | 'IP';
        value: string;
        reason?: string;
        expiresAt?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFromBlacklist(body: {
        type: 'USER' | 'DEVICE' | 'IP';
        value: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
