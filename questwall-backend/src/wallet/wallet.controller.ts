import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('connect/start')
  startConnect(@Request() req) {
    const userId = BigInt(req.user?.tg_id || 1);
    return this.walletService.startConnect(userId);
  }

  @Post('tx/prepare')
  prepareTx(@Body() prepareTxDto: any, @Request() req) {
    const userId = BigInt(req.user?.tg_id || 1);
    return this.walletService.prepareTx(userId, prepareTxDto);
  }

  @Post('tx/confirm')
  confirmTx(@Body() confirmTxDto: any) {
    return this.walletService.confirmTx(
      confirmTxDto.txId,
      confirmTxDto.signature,
      confirmTxDto.boc
    );
  }

  @Get('tx/:id')
  getTxStatus(@Param('id') id: string) {
    return this.walletService.getTxStatus(id);
  }
}
