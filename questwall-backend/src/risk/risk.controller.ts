import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RiskService } from './risk.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  // 提交设备指纹（需要登录）
  @UseGuards(JwtAuthGuard)
  @Post('fp')
  async submitFingerprint(@Body() fpDto: any, @Req() req: Request) {
    const userId = BigInt((req as any).user?.sub || '0');
    const ip = req.ip || req.headers['x-forwarded-for'] as string;
    return this.riskService.submitFingerprint(userId, fpDto, ip);
  }

  // 获取用户风险分（需要登录）
  @UseGuards(JwtAuthGuard)
  @Get('score')
  async getRiskScore(@Req() req: Request) {
    const userId = BigInt((req as any).user?.sub || '0');
    return this.riskService.getRiskScore(userId);
  }

  // 综合风控检查（需要登录）
  @UseGuards(JwtAuthGuard)
  @Post('check')
  async checkRisk(@Body() body: { action?: string }, @Req() req: Request) {
    const userId = BigInt((req as any).user?.sub || '0');
    const ip = req.ip || req.headers['x-forwarded-for'] as string;
    const visitorId = req.headers['x-visitor-id'] as string;

    return this.riskService.checkRisk({
      userId,
      ip,
      visitorId,
      action: body.action,
    });
  }

  // 获取风控事件列表（管理员接口，暂时开放）
  @Get('events')
  async getRiskEvents(
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
  ) {
    return this.riskService.getRiskEvents({
      userId: userId ? BigInt(userId) : undefined,
      eventType,
      severity,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  // 获取黑名单列表（管理员接口）
  @Get('blacklist')
  async getBlacklist(@Query('type') type?: string) {
    return this.riskService.getBlacklist(type as any);
  }

  // 添加到黑名单（管理员接口）
  @Post('blacklist/add')
  async addToBlacklist(@Body() body: {
    type: 'USER' | 'DEVICE' | 'IP';
    value: string;
    reason?: string;
    expiresAt?: string;
  }) {
    return this.riskService.addToBlacklist(
      body.type as any,
      body.value,
      body.reason,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );
  }

  // 从黑名单移除（管理员接口）
  @Post('blacklist/remove')
  async removeFromBlacklist(@Body() body: {
    type: 'USER' | 'DEVICE' | 'IP';
    value: string;
  }) {
    return this.riskService.removeFromBlacklist(body.type as any, body.value);
  }
}
