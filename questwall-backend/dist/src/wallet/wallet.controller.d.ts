import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    startConnect(req: any): Promise<{
        sessionId: string;
        manifestUrl: string;
        message: string;
    }>;
    prepareTx(prepareTxDto: any, req: any): Promise<{
        txId: string;
        payload: any;
        expiresIn: number;
        message: string;
    }>;
    confirmTx(confirmTxDto: any): Promise<{
        success: boolean;
        txId: string;
        status: string;
        message: string;
    }>;
    getTxStatus(id: string): Promise<{
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
}
