import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, CurrentUserData } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 开发模式登录（仅限开发环境）
  @HttpCode(HttpStatus.OK)
  @Post('dev-login')
  async devLogin(@Res({ passthrough: true }) response: Response) {
    if (process.env.NODE_ENV === 'production') {
      return { success: false, message: '生产环境禁止使用开发登录' };
    }

    const result = await this.authService.devLogin();
    response.cookie('token', result.token, {
      httpOnly: true,
      maxAge: result.expiresIn * 1000,
    });
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('telegram')
  async telegramAuth(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.telegramAuth(authDto.initData);
    // 设置 JWT cookie
    response.cookie('token', result.token, {
      httpOnly: true,
      maxAge: result.expiresIn * 1000,
    });
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Req() request: Request) {
    const token = request.cookies['token'];
    return this.authService.refreshToken(token);
  }

  // 获取通知偏好设置
  @UseGuards(JwtAuthGuard)
  @Get('notification-prefs')
  async getNotificationPrefs(@CurrentUser() user: CurrentUserData) {
    const prefs = await this.authService.getNotificationPrefs(BigInt(user.id));
    return {
      success: true,
      prefs: prefs || {
        questComplete: true,
        reward: true,
        newQuest: true,
        checkIn: true,
        invite: true,
      }
    };
  }

  // 更新通知偏好设置
  @UseGuards(JwtAuthGuard)
  @Put('notification-prefs')
  async updateNotificationPrefs(
    @CurrentUser() user: CurrentUserData,
    @Body() prefs: Partial<{
      questComplete: boolean;
      reward: boolean;
      newQuest: boolean;
      checkIn: boolean;
      invite: boolean;
    }>
  ) {
    const newPrefs = await this.authService.updateNotificationPrefs(BigInt(user.id), prefs);
    return {
      success: true,
      message: '通知偏好已更新',
      prefs: newPrefs
    };
  }
}