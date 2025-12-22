import { PrismaService } from '../prisma/prisma.service';
interface PrepareTxDto {
    kind: 'jetton_transfer' | 'ton_transfer' | 'nft_mint';
    to: string;
    amount: string;
    comment?: string;
    jettonAddress?: string;
}
export declare class WalletService {
    private prisma;
    constructor(prisma: PrismaService);
    startConnect(userId: bigint): Promise<{
        sessionId: string;
        manifestUrl: string;
        message: string;
    }>;
    confirmConnect(userId: bigint, walletAddress: string): Promise<{
        success: boolean;
        walletAddress: string;
        message: string;
    }>;
    getWalletInfo(userId: bigint): Promise<{
        connected: boolean;
        message: string;
        address?: undefined;
    } | {
        connected: boolean;
        address: string;
        message?: undefined;
    }>;
    prepareTx(userId: bigint, dto: PrepareTxDto): Promise<{
        txId: string;
        payload: any;
        expiresIn: number;
        message: string;
    }>;
    confirmTx(txId: string, signature: string, boc?: string): Promise<{
        success: boolean;
        txId: string;
        status: string;
        message: string;
    }>;
    getTxStatus(txId: string): Promise<{
        txId: string;
        status: string;
        message: string;
        type?: undefined;
        from?: undefined;
        to?: undefined;
        amount?: undefined;
        createdAt?: undefined;
        submittedAt?: undefined;
        txHash?: undefined;
    } | {
        txId: string;
        status: any;
        type: any;
        from: any;
        to: any;
        amount: any;
        createdAt: any;
        submittedAt: any;
        txHash: any;
        message?: undefined;
    }>;
    disconnect(userId: bigint): Promise<{
        success: boolean;
        message: string;
    }>;
    private isValidTonAddress;
    private toNano;
    private fromNano;
}
export {};
