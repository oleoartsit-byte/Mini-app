import { PayoutService } from './payout.service';
export declare class PayoutController {
    private readonly payoutService;
    constructor(payoutService: PayoutService);
    getBalance(req: any): Promise<{
        balances: {
            stars: number;
            ton: number;
            usdt: number;
            points: number;
        };
        minWithdrawAmount: number;
    }>;
    requestWithdraw(body: {
        asset?: 'USDT';
        amount: number;
        toAddress: string;
    }, req: any): Promise<{
        success: boolean;
        payoutId: string;
        asset: string;
        requestedAmount: number;
        actualAmount: number;
        status: string;
        message: string;
    }>;
    getHistory(page?: string, pageSize?: string, req?: any): Promise<{
        items: {
            id: string;
            asset: string;
            amount: number;
            toAddress: string;
            status: import(".prisma/client").$Enums.PayoutStatus;
            txHash: string;
            createdAt: Date;
            processedAt: Date;
        }[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    }>;
    getPayoutDetail(id: string, req: any): Promise<{
        id: string;
        asset: string;
        amount: number;
        toAddress: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        txHash: string;
        createdAt: Date;
        processedAt: Date;
    }>;
    cancelWithdraw(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getTransactionHistory(page?: string, pageSize?: string, req?: any): Promise<{
        items: ({
            id: string;
            type: "REWARD";
            asset: import(".prisma/client").$Enums.RewardType;
            amount: number;
            direction: "IN";
            description: string;
            createdAt: Date;
        } | {
            id: string;
            type: "CHECKIN";
            asset: string;
            amount: number;
            direction: "IN";
            description: string;
            createdAt: Date;
        } | {
            id: string;
            type: "INVITE";
            asset: string;
            amount: number;
            direction: "IN";
            description: string;
            createdAt: Date;
        } | {
            id: string;
            type: "PAYOUT";
            asset: string;
            amount: number;
            direction: "OUT";
            description: string;
            status: import(".prisma/client").$Enums.PayoutStatus;
            txHash: string;
            createdAt: Date;
        })[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    }>;
}
