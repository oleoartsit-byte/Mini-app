import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

interface PrepareTxDto {
  kind: 'jetton_transfer' | 'ton_transfer' | 'nft_mint';
  to: string;
  amount: string;
  comment?: string;
  jettonAddress?: string;
}

// 模拟交易存储（生产环境应使用 Redis）
const pendingTxs = new Map<string, any>();

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // 开始钱包连接
  async startConnect(userId: bigint) {
    // 生成连接会话
    const sessionId = uuidv4();
    
    // TonConnect manifest URL（需要配置）
    const manifestUrl = process.env.TONCONNECT_MANIFEST_URL || 
      'https://your-domain.com/tonconnect-manifest.json';

    return {
      sessionId,
      manifestUrl,
      message: 'Please connect your wallet using TonConnect'
    };
  }

  // 确认钱包连接
  async confirmConnect(userId: bigint, walletAddress: string) {
    // 验证地址格式
    if (!this.isValidTonAddress(walletAddress)) {
      throw new BadRequestException('Invalid TON wallet address');
    }

    // 更新用户钱包地址
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

  // 获取用户钱包信息
  async getWalletInfo(userId: bigint) {
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
      // 可以在这里添加链上余额查询
    };
  }

  // 准备交易
  async prepareTx(userId: bigint, dto: PrepareTxDto) {
    // 验证用户已连接钱包
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddr: true }
    });

    if (!user?.walletAddr) {
      throw new BadRequestException('Please connect your wallet first');
    }

    // 验证目标地址
    if (!this.isValidTonAddress(dto.to)) {
      throw new BadRequestException('Invalid destination address');
    }

    // 生成交易ID
    const txId = uuidv4();

    // 构建交易 payload
    let payload: any = {
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
          // TON 转账：金额单位是 nanoTON
          value: this.toNano(dto.amount)
        };
        break;

      case 'jetton_transfer':
        if (!dto.jettonAddress) {
          throw new BadRequestException('Jetton address is required');
        }
        payload = {
          ...payload,
          type: 'jetton_transfer',
          jettonAddress: dto.jettonAddress,
          // Jetton 转账需要构建特殊的消息体
          forwardAmount: '1', // 0.001 TON for notification
        };
        break;

      case 'nft_mint':
        payload = {
          ...payload,
          type: 'nft_mint',
          // NFT 铸造参数
        };
        break;
    }

    // 保存待确认交易
    pendingTxs.set(txId, {
      ...payload,
      userId: userId.toString(),
      status: 'pending',
      createdAt: new Date()
    });

    return {
      txId,
      payload,
      expiresIn: 300, // 5 minutes
      message: 'Please sign the transaction in your wallet'
    };
  }

  // 确认交易
  async confirmTx(txId: string, signature: string, boc?: string) {
    const tx = pendingTxs.get(txId);
    
    if (!tx) {
      throw new BadRequestException('Transaction not found or expired');
    }

    // 验证签名（生产环境需要真正验证）
    if (!signature) {
      throw new BadRequestException('Signature is required');
    }

    // 更新交易状态
    tx.status = 'submitted';
    tx.signature = signature;
    tx.boc = boc;
    tx.submittedAt = new Date();
    pendingTxs.set(txId, tx);

    // 在生产环境，这里应该提交到链上
    // const result = await this.submitToChain(boc);

    return {
      success: true,
      txId,
      status: 'submitted',
      message: 'Transaction submitted, waiting for confirmation'
    };
  }

  // 获取交易状态
  async getTxStatus(txId: string) {
    const tx = pendingTxs.get(txId);
    
    if (!tx) {
      // 尝试从链上查询
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
      // 如果有链上哈希
      txHash: tx.txHash
    };
  }

  // 断开钱包连接
  async disconnect(userId: bigint) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddr: null }
    });

    return {
      success: true,
      message: 'Wallet disconnected'
    };
  }

  // 验证 TON 地址格式
  private isValidTonAddress(address: string): boolean {
    // TON 地址格式：
    // - Raw: 0:xxxx (66 chars)
    // - User-friendly: EQxxxx or UQxxxx (48 chars)
    if (!address) return false;
    
    // User-friendly 格式
    if ((address.startsWith('EQ') || address.startsWith('UQ')) && address.length === 48) {
      return true;
    }
    
    // Raw 格式
    if (address.includes(':') && address.length === 66) {
      return true;
    }
    
    return false;
  }

  // TON 金额转换为 nanoTON
  private toNano(amount: string): string {
    const value = parseFloat(amount);
    return Math.floor(value * 1e9).toString();
  }

  // nanoTON 转换为 TON
  private fromNano(nanoAmount: string): string {
    const value = parseInt(nanoAmount);
    return (value / 1e9).toFixed(9);
  }
}
