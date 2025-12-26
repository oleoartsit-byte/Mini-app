import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CheckInService } from './checkin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('checkin')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  // 获取签到状态
  // timezoneOffset: 用户时区偏移（分钟），如北京时间传 -480
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Request() req, @Query('tz') tz?: string) {
    const userId = BigInt(req.user?.id || req.user?.userId || 1);
    const timezoneOffset = parseInt(tz) || 0;
    return this.checkInService.getStatus(userId, timezoneOffset);
  }

  // 每日签到
  // timezoneOffset: 用户时区偏移（分钟），如北京时间传 -480
  @Post()
  @UseGuards(JwtAuthGuard)
  async checkIn(@Request() req, @Body() body?: { timezoneOffset?: number }) {
    const userId = BigInt(req.user?.id || req.user?.userId || 1);
    const timezoneOffset = body?.timezoneOffset || 0;
    return this.checkInService.checkIn(userId, timezoneOffset);
  }

  // 补签
  // timezoneOffset: 用户时区偏移（分钟），如北京时间传 -480
  @Post('makeup')
  @UseGuards(JwtAuthGuard)
  async makeup(@Body() body: { date: string; timezoneOffset?: number }, @Request() req) {
    const userId = BigInt(req.user?.id || req.user?.userId || 1);
    const timezoneOffset = body.timezoneOffset || 0;
    return this.checkInService.makeup(userId, body.date, timezoneOffset);
  }

  // 获取签到排行榜
  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.checkInService.getLeaderboard(parseInt(limit) || 10);
  }

  // 获取签到配置（公开）
  @Get('config')
  async getConfig() {
    return this.checkInService.getConfig();
  }
}
