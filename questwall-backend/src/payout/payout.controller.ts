import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payout')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  // 获取用户余额
  @Get('balance')
  async getBalance(@Request() req) {
    const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
    return this.payoutService.getBalance(userId);
  }

  // 申请提现 (只支持 USDT)
  @Post('withdraw')
  async requestWithdraw(
    @Body() body: { asset?: 'USDT'; amount: number; toAddress: string },
    @Request() req,
  ) {
    const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
    return this.payoutService.requestWithdraw(
      userId,
      'USDT', // 强制使用 USDT
      body.amount,
      body.toAddress,
    );
  }

  // 获取提现历史
  @Get('history')
  async getHistory(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?,
  ) {
    const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
    return this.payoutService.getHistory(
      userId,
      parseInt(page) || 1,
      parseInt(pageSize) || 10,
    );
  }

  // 获取提现详情
  @Get(':id')
  async getPayoutDetail(@Param('id') id: string, @Request() req) {
    const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
    return this.payoutService.getPayoutDetail(userId, BigInt(id));
  }

  // 取消提现
  @Delete(':id')
  async cancelWithdraw(@Param('id') id: string, @Request() req) {
    const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
    return this.payoutService.cancelWithdraw(userId, BigInt(id));
  }

  // 获取交易历史
  @Get('transactions/all')
  async getTransactionHistory(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Request() req?,
  ) {
    const userId = BigInt(req.user?.userId || req.user?.tg_id || 1);
    return this.payoutService.getTransactionHistory(
      userId,
      parseInt(page) || 1,
      parseInt(pageSize) || 20,
    );
  }
}
