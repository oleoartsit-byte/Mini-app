export interface CurrentUserData {
    id: string;
    tgId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    walletAddr?: string;
    locale: string;
    riskScore: number;
}
export declare const CurrentUser: (...dataOrPipes: (keyof CurrentUserData | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
