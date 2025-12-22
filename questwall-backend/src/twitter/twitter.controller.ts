import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { TwitterService } from './twitter.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

// 存储验证码（生产环境应使用 Redis）
const verificationCodes = new Map<string, { code: string; expiresAt: Date }>();

@ApiTags('twitter')
@Controller('twitter')
@UseGuards(JwtAuthGuard)
export class TwitterController {
  constructor(
    private readonly twitterService: TwitterService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取 Twitter 绑定状态' })
  async getBindingStatus(@CurrentUser() user: CurrentUserData) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: BigInt(user.id) },
      select: {
        twitterId: true,
        twitterUsername: true,
        twitterBindAt: true,
      },
    });

    if (!dbUser) {
      return { bound: false };
    }

    return {
      bound: !!dbUser.twitterId,
      twitterId: dbUser.twitterId,
      twitterUsername: dbUser.twitterUsername,
      bindAt: dbUser.twitterBindAt,
    };
  }

  @Get('verification-code')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取 Twitter 绑定验证码' })
  async getVerificationCode(@CurrentUser() user: CurrentUserData) {
    const userId = user.id;

    // 检查是否已有未过期的验证码
    const existing = verificationCodes.get(userId);
    if (existing && existing.expiresAt > new Date()) {
      return {
        success: true,
        code: existing.code,
        expiresAt: existing.expiresAt,
      };
    }

    // 生成新的验证码（8位随机字符）
    const code = `QW_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效期

    verificationCodes.set(userId, { code, expiresAt });

    return {
      success: true,
      code,
      expiresAt,
    };
  }

  @Post('verify-and-bind')
  @ApiBearerAuth()
  @ApiOperation({ summary: '验证 Twitter 推文并绑定（引用转发方式）' })
  async verifyAndBind(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: { username: string },
  ) {
    const { username } = dto;
    const userId = user.id;

    if (!username) {
      return {
        success: false,
        message: '请提供 Twitter 用户名',
      };
    }

    // 获取验证码
    const verification = verificationCodes.get(userId);
    if (!verification) {
      return {
        success: false,
        message: '请先获取验证码',
      };
    }

    if (verification.expiresAt < new Date()) {
      verificationCodes.delete(userId);
      return {
        success: false,
        message: '验证码已过期，请重新获取',
      };
    }

    // 清理用户名
    const cleanUsername = username.startsWith('@')
      ? username.substring(1)
      : username;

    // 调用 Twitter API 获取用户信息
    const twitterUser = await this.twitterService.getUserByUsername(cleanUsername);

    if (!twitterUser) {
      return {
        success: false,
        message: `Twitter 账号 @${cleanUsername} 不存在或无法访问`,
      };
    }

    // 验证用户最近推文是否包含验证码
    const verifyResult = await this.twitterService.verifyQuoteTweetWithCode(
      twitterUser.id,
      verification.code,
    );

    if (!verifyResult.verified) {
      return {
        success: false,
        message: verifyResult.message,
      };
    }

    // 检查该 Twitter 账号是否已被其他用户绑定（当前绑定）
    const existingBinding = await this.prisma.user.findFirst({
      where: {
        twitterId: twitterUser.id,
        NOT: { id: BigInt(userId) },
      },
    });

    if (existingBinding) {
      return {
        success: false,
        message: '该 Twitter 账号已被其他用户绑定',
      };
    }

    // 获取当前用户的 tgId
    const currentUser = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { tgId: true },
    });

    if (!currentUser) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    // 检查 Twitter 绑定历史记录（是否曾被其他 TG 账号绑定过）
    const bindHistory = await this.prisma.twitterBindHistory.findUnique({
      where: { twitterId: twitterUser.id },
    });

    if (bindHistory && bindHistory.ownerTgId !== currentUser.tgId) {
      // 该 Twitter 曾被其他 TG 账号绑定过，拒绝绑定
      return {
        success: false,
        message: '该 Twitter 账号已被其他用户绑定过，无法绑定到您的账号',
        code: 'TWITTER_ALREADY_OWNED',
      };
    }

    // 验证通过，绑定账号（使用事务）
    await this.prisma.$transaction(async (tx) => {
      // 更新用户的 Twitter 绑定信息
      await tx.user.update({
        where: { id: BigInt(userId) },
        data: {
          twitterId: twitterUser.id,
          twitterUsername: twitterUser.screen_name,
          twitterBindAt: new Date(),
        },
      });

      // 更新或创建绑定历史记录
      if (bindHistory) {
        // 已有记录（同一 TG 用户重新绑定），更新绑定次数和时间
        await tx.twitterBindHistory.update({
          where: { twitterId: twitterUser.id },
          data: {
            twitterUsername: twitterUser.screen_name,
            bindCount: { increment: 1 },
            lastBindAt: new Date(),
          },
        });
      } else {
        // 首次绑定，创建记录
        await tx.twitterBindHistory.create({
          data: {
            twitterId: twitterUser.id,
            twitterUsername: twitterUser.screen_name,
            ownerTgId: currentUser.tgId,
          },
        });
      }
    });

    // 清除验证码
    verificationCodes.delete(userId);

    console.log(`✅ 用户 ${userId} 通过推文验证绑定 Twitter: @${twitterUser.screen_name} (ID: ${twitterUser.id})`);

    return {
      success: true,
      message: `成功绑定 Twitter 账号 @${twitterUser.screen_name}`,
      twitter: {
        id: twitterUser.id,
        username: twitterUser.screen_name,
        name: twitterUser.name,
        followersCount: twitterUser.followers_count,
      },
    };
  }

  @Post('bind')
  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定 Twitter 账号' })
  async bindTwitter(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: { username: string },
  ) {
    const { username } = dto;

    if (!username) {
      return {
        success: false,
        message: '请提供 Twitter 用户名',
      };
    }

    // 清理用户名
    const cleanUsername = username.startsWith('@')
      ? username.substring(1)
      : username;

    // 调用 Twitter API 获取用户信息
    const twitterUser = await this.twitterService.getUserByUsername(cleanUsername);

    if (!twitterUser) {
      return {
        success: false,
        message: `Twitter 账号 @${cleanUsername} 不存在或无法访问`,
      };
    }

    // 检查该 Twitter 账号是否已被其他用户绑定
    const existingBinding = await this.prisma.user.findFirst({
      where: {
        twitterId: twitterUser.id,
        NOT: { id: BigInt(user.id) },
      },
    });

    if (existingBinding) {
      return {
        success: false,
        message: '该 Twitter 账号已被其他用户绑定',
      };
    }

    // 更新用户的 Twitter 绑定信息
    await this.prisma.user.update({
      where: { id: BigInt(user.id) },
      data: {
        twitterId: twitterUser.id,
        twitterUsername: twitterUser.screen_name,
        twitterBindAt: new Date(),
      },
    });

    console.log(`✅ 用户 ${user.id} 绑定 Twitter: @${twitterUser.screen_name} (ID: ${twitterUser.id})`);

    return {
      success: true,
      message: `成功绑定 Twitter 账号 @${twitterUser.screen_name}`,
      twitter: {
        id: twitterUser.id,
        username: twitterUser.screen_name,
        name: twitterUser.name,
        followersCount: twitterUser.followers_count,
      },
    };
  }

  @Delete('unbind')
  @ApiBearerAuth()
  @ApiOperation({ summary: '解绑 Twitter 账号' })
  async unbindTwitter(@CurrentUser() user: CurrentUserData) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: BigInt(user.id) },
      select: { twitterUsername: true },
    });

    if (!dbUser?.twitterUsername) {
      return {
        success: false,
        message: '您还未绑定 Twitter 账号',
      };
    }

    await this.prisma.user.update({
      where: { id: BigInt(user.id) },
      data: {
        twitterId: null,
        twitterUsername: null,
        twitterBindAt: null,
      },
    });

    console.log(`✅ 用户 ${user.id} 解绑 Twitter: @${dbUser.twitterUsername}`);

    return {
      success: true,
      message: 'Twitter 账号已解绑',
    };
  }

  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({ summary: '搜索 Twitter 用户' })
  async searchUser(@Query('username') username: string) {
    if (!username) {
      return { success: false, message: '请提供用户名' };
    }

    const cleanUsername = username.startsWith('@')
      ? username.substring(1)
      : username;

    const twitterUser = await this.twitterService.getUserByUsername(cleanUsername);

    if (!twitterUser) {
      return {
        success: false,
        message: `未找到 Twitter 用户 @${cleanUsername}`,
      };
    }

    return {
      success: true,
      user: {
        id: twitterUser.id,
        username: twitterUser.screen_name,
        name: twitterUser.name,
        followersCount: twitterUser.followers_count,
        followingCount: twitterUser.following_count,
      },
    };
  }
}
