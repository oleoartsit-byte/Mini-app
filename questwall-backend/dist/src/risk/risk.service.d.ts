import { PrismaService } from '../prisma/prisma.service';
import { BlacklistType } from '@prisma/client';
interface FingerprintDto {
    visitorId: string;
    userAgent?: string;
    platform?: string;
    screenRes?: string;
    timezone?: string;
    language?: string;
    fingerprint?: Record<string, any>;
}
interface RiskContext {
    userId?: bigint;
    ip?: string;
    visitorId?: string;
    action?: string;
}
export declare class RiskService {
    private prisma;
    constructor(prisma: PrismaService);
    submitFingerprint(userId: bigint, fpDto: FingerprintDto, ip?: string): Promise<{
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
    recordIp(userId: bigint, ip: string): Promise<{
        blocked: boolean;
        usersOnIp?: undefined;
    } | {
        blocked: boolean;
        usersOnIp: number;
    }>;
    getRiskScore(userId: bigint): Promise<{
        userId: string;
        score: number;
        level: string;
        factors: string[];
        shouldBlock: boolean;
    }>;
    checkRateLimit(userId: bigint, action: string): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    checkRisk(context: RiskContext): Promise<{
        allowed: boolean;
        reason?: string;
        score?: number;
    }>;
    addToBlacklist(type: BlacklistType, value: string, reason?: string, expiresAt?: Date): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFromBlacklist(type: BlacklistType, value: string): Promise<{
        success: boolean;
        message: string;
    }>;
    isBlocked(type: BlacklistType | string, value: string): Promise<boolean>;
    logRiskEvent(event: {
        userId?: bigint;
        eventType: string;
        severity: string;
        details?: any;
        ip?: string;
        visitorId?: string;
    }): Promise<void>;
    getRiskEvents(options: {
        userId?: bigint;
        eventType?: string;
        severity?: string;
        limit?: number;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        visitorId: string | null;
        ip: string | null;
        eventType: string;
        severity: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getBlacklist(type?: BlacklistType): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.BlacklistType;
        value: string;
        reason: string | null;
        expiresAt: Date | null;
    }[]>;
}
export {};
