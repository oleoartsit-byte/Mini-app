import { ConfigService } from '@nestjs/config';
interface LikeVerificationResult {
    isValid: boolean;
    confidence: number;
    reason: string;
    needsManualReview: boolean;
    detectedUsername?: string;
    usernameMatch?: boolean;
}
export declare class AiService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    verifyLikeScreenshot(imageUrl: string, boundTwitterUsername: string, targetUrl?: string): Promise<LikeVerificationResult>;
    private buildVerificationPrompt;
    private parseVerificationResponse;
    private fetchImageAsBase64;
    isAvailable(): boolean;
}
export {};
