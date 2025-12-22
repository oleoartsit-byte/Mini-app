import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  getMyRewards(@Request() req) {
    const userId = BigInt(req.user?.id || 1);
    return this.rewardsService.getMyRewards(userId);
  }

  @Post('withdraw')
  withdraw(@Body() withdrawDto: any, @Request() req) {
    const userId = BigInt(req.user?.id || 1);
    return this.rewardsService.withdraw(userId, withdrawDto);
  }

  @Get('payouts/:id')
  getPayoutStatus(@Param('id') id: string) {
    return this.rewardsService.getPayoutStatus(BigInt(id));
  }

  // 排行榜（公开接口）
  @Get('leaderboard')
  @Public()
  getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit) || 10;
    return this.rewardsService.getLeaderboard(limitNum);
  }

  // 获取当前用户排名
  @Get('my-rank')
  getMyRank(@Request() req) {
    const userId = BigInt(req.user?.id || 1);
    return this.rewardsService.getUserRank(userId);
  }
}
