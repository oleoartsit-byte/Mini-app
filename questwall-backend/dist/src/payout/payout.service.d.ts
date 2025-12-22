import { PrismaService } from '../prisma/prisma.service';
export declare class PayoutService {
    private prisma;
    constructor(prisma: PrismaService);
    getBalance(userId: bigint): Promise<{
        balances: {
            stars: number;
            ton: number;
            usdt: number;
            points: number;
        };
        minWithdrawAmount: number;
    }>;
    requestWithdraw(userId: bigint, asset: 'STARS' | 'TON' | 'USDT', amount: number, toAddress: string): Promise<{
        success: boolean;
        payoutId: string;
        asset: string;
        requestedAmount: number;
        actualAmount: number;
        status: string;
        message: string;
    }>;
    getHistory(userId: bigint, page?: number, pageSize?: number): Promise<{
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
    getPayoutDetail(userId: bigint, payoutId: bigint): Promise<{
        id: string;
        asset: string;
        amount: number;
        toAddress: string;
        status: import(".prisma/client").$Enums.PayoutStatus;
        txHash: string;
        createdAt: Date;
        processedAt: Date;
    }>;
    cancelWithdraw(userId: bigint, payoutId: bigint): Promise<{
        success: boolean;
        message: string;
    }>;
    getTransactionHistory(userId: bigint, page?: number, pageSize?: number): Promise<{
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
    private isValidAddress;
}
