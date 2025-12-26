import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  // 获取邀请状态
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Request() req) {
    const userId = BigInt(req.user?.id || req.user?.userId || 1);
    return this.inviteService.getStatus(userId);
  }

  // 处理邀请（被邀请人调用）
  @Post('process')
  @UseGuards(JwtAuthGuard)
  async processInvite(
    @Body() body: { inviteCode: string },
    @Request() req,
  ) {
    const inviteeId = BigInt(req.user?.id || req.user?.userId || 1);
    // 从邀请码中提取邀请人 tgId
    const inviterTgId = body.inviteCode.replace('ref_', '');
    return this.inviteService.processInvite(inviteeId, inviterTgId);
  }

  // 验证邀请码
  @Get('validate/:code')
  async validateInviteCode(@Param('code') code: string) {
    return this.inviteService.validateInviteCode(code);
  }

  // 获取邀请排行榜
  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.inviteService.getLeaderboard(parseInt(limit) || 10);
  }

  // 获取邀请配置（公开）
  @Get('config')
  async getConfig() {
    return this.inviteService.getConfig();
  }
}
