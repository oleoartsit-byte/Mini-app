"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
const pendingTxs = new Map();
let WalletService = class WalletService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startConnect(userId) {
        const sessionId = (0, uuid_1.v4)();
        const manifestUrl = process.env.TONCONNECT_MANIFEST_URL ||
            'https://your-domain.com/tonconnect-manifest.json';
        return {
            sessionId,
            manifestUrl,
            message: 'Please connect your wallet using TonConnect'
        };
    }
    async confirmConnect(userId, walletAddress) {
        if (!this.isValidTonAddress(walletAddress)) {
            throw new common_1.BadRequestException('Invalid TON wallet address');
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { walletAddr: walletAddress }
        });
        return {
            success: true,
            walletAddress: user.walletAddr,
            message: 'Wallet connected successfully'
        };
    }
    async getWalletInfo(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { walletAddr: true }
        });
        if (!user?.walletAddr) {
            return {
                connected: false,
                message: 'No wallet connected'
            };
        }
        return {
            connected: true,
            address: user.walletAddr,
        };
    }
    async prepareTx(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { walletAddr: true }
        });
        if (!user?.walletAddr) {
            throw new common_1.BadRequestException('Please connect your wallet first');
        }
        if (!this.isValidTonAddress(dto.to)) {
            throw new common_1.BadRequestException('Invalid destination address');
        }
        const txId = (0, uuid_1.v4)();
        let payload = {
            txId,
            from: user.walletAddr,
            to: dto.to,
            amount: dto.amount,
            comment: dto.comment || ''
        };
        switch (dto.kind) {
            case 'ton_transfer':
                payload = {
                    ...payload,
                    type: 'ton_transfer',
                    value: this.toNano(dto.amount)
                };
                break;
            case 'jetton_transfer':
                if (!dto.jettonAddress) {
                    throw new common_1.BadRequestException('Jetton address is required');
                }
                payload = {
                    ...payload,
                    type: 'jetton_transfer',
                    jettonAddress: dto.jettonAddress,
                    forwardAmount: '1',
                };
                break;
            case 'nft_mint':
                payload = {
                    ...payload,
                    type: 'nft_mint',
                };
                break;
        }
        pendingTxs.set(txId, {
            ...payload,
            userId: userId.toString(),
            status: 'pending',
            createdAt: new Date()
        });
        return {
            txId,
            payload,
            expiresIn: 300,
            message: 'Please sign the transaction in your wallet'
        };
    }
    async confirmTx(txId, signature, boc) {
        const tx = pendingTxs.get(txId);
        if (!tx) {
            throw new common_1.BadRequestException('Transaction not found or expired');
        }
        if (!signature) {
            throw new common_1.BadRequestException('Signature is required');
        }
        tx.status = 'submitted';
        tx.signature = signature;
        tx.boc = boc;
        tx.submittedAt = new Date();
        pendingTxs.set(txId, tx);
        return {
            success: true,
            txId,
            status: 'submitted',
            message: 'Transaction submitted, waiting for confirmation'
        };
    }
    async getTxStatus(txId) {
        const tx = pendingTxs.get(txId);
        if (!tx) {
            return {
                txId,
                status: 'not_found',
                message: 'Transaction not found'
            };
        }
        return {
            txId,
            status: tx.status,
            type: tx.type,
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            createdAt: tx.createdAt,
            submittedAt: tx.submittedAt,
            txHash: tx.txHash
        };
    }
    async disconnect(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { walletAddr: null }
        });
        return {
            success: true,
            message: 'Wallet disconnected'
        };
    }
    isValidTonAddress(address) {
        if (!address)
            return false;
        if ((address.startsWith('EQ') || address.startsWith('UQ')) && address.length === 48) {
            return true;
        }
        if (address.includes(':') && address.length === 66) {
            return true;
        }
        return false;
    }
    toNano(amount) {
        const value = parseFloat(amount);
        return Math.floor(value * 1e9).toString();
    }
    fromNano(nanoAmount) {
        const value = parseInt(nanoAmount);
        return (value / 1e9).toFixed(9);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map