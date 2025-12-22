import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  async telegramAuth(initData: string) {
    // 验证 Telegram initData（开发模式跳过验证）
    const isDev = process.env.NODE_ENV === 'development';
    const isValid = isDev || this.verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN);

    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram initData');
    }

    // 解析用户信息
    const tgUser = this.parseInitData(initData);
    
    if (!tgUser.id) {
      throw new UnauthorizedException('Invalid user data');
    }

    // 查找或创建用户（真正的数据库操作）
    let user = await this.prisma.user.findUnique({
      where: { tgId: BigInt(tgUser.id) }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          tgId: BigInt(tgUser.id),
          username: tgUser.username || null,
          firstName: tgUser.first_name || null,
          lastName: tgUser.last_name || null,
          avatarUrl: tgUser.photo_url || null,
          locale: tgUser.language_code || 'en',
        }
      });
      console.log(`✅ New user created: ${user.tgId}`);

      // 发送欢迎通知（异步，不影响主流程）
      const userName = tgUser.first_name || tgUser.username || 'Quest Hunter';
      this.telegramService.sendWelcomeNotification(user.tgId, userName).catch(err => {
        console.error('发送欢迎通知失败:', err);
      });
    } else {
      // 更新用户信息（包括头像）
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          username: tgUser.username || user.username,
          firstName: tgUser.first_name || user.firstName,
          lastName: tgUser.last_name || user.lastName,
          avatarUrl: tgUser.photo_url || user.avatarUrl,
          locale: tgUser.language_code || user.locale,
        }
      });
    }

    // 生成 JWT token
    const payload = { 
      sub: user.id.toString(),
      tg_id: user.tgId.toString(),
      username: user.username,
    };
    
    const token = this.jwtService.sign(payload);
    
    return {
      token,
      expiresIn: 900, // 15 minutes
      user: {
        id: user.id.toString(),
        tg_id: user.tgId.toString(),
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.avatarUrl,
        locale: user.locale,
        wallet_addr: user.walletAddr,
      }
    };
  }

  // 开发模式登录（创建或获取测试用户）
  async devLogin() {
    // 测试用户的 Telegram ID
    const devTgId = BigInt(123456789);

    // 查找或创建测试用户
    let user = await this.prisma.user.findUnique({
      where: { tgId: devTgId }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          tgId: devTgId,
          username: 'dev_user',
          firstName: 'Dev',
          lastName: 'User',
          locale: 'zh',
        }
      });
      console.log('✅ Dev user created:', user.id.toString());
    }

    // 生成 JWT token
    const payload = {
      sub: user.id.toString(),
      tg_id: user.tgId.toString(),
      username: user.username,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      expiresIn: 86400, // 24 hours for dev
      user: {
        id: user.id.toString(),
        tg_id: user.tgId.toString(),
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        locale: user.locale,
        wallet_addr: user.walletAddr,
      }
    };
  }

  async refreshToken(oldToken: string) {
    try {
      const payload = this.jwtService.verify(oldToken);
      
      // 验证用户是否存在
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(payload.sub) }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = { 
        sub: user.id.toString(),
        tg_id: user.tgId.toString(),
        username: user.username,
      };
      
      const newToken = this.jwtService.sign(newPayload);
      
      return {
        token: newToken,
        expiresIn: 900
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserById(userId: bigint) {
    return this.prisma.user.findUnique({
      where: { id: userId }
    });
  }

  async getUserByTgId(tgId: bigint) {
    return this.prisma.user.findUnique({
      where: { tgId }
    });
  }

  // 获取用户通知偏好
  async getNotificationPrefs(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    if (!user) {
      return null;
    }

    return user.notificationPrefs as {
      questComplete: boolean;
      reward: boolean;
      newQuest: boolean;
      checkIn: boolean;
      invite: boolean;
    };
  }

  // 更新用户通知偏好
  async updateNotificationPrefs(
    userId: bigint,
    prefs: Partial<{
      questComplete: boolean;
      reward: boolean;
      newQuest: boolean;
      checkIn: boolean;
      invite: boolean;
    }>
  ) {
    const currentPrefs = await this.getNotificationPrefs(userId) || {
      questComplete: true,
      reward: true,
      newQuest: true,
      checkIn: true,
      invite: true,
    };

    const newPrefs = { ...currentPrefs, ...prefs };

    await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: newPrefs }
    });

    return newPrefs;
  }

  // 检查用户是否允许某种通知
  async canSendNotification(userId: bigint, type: 'questComplete' | 'reward' | 'newQuest' | 'checkIn' | 'invite'): Promise<boolean> {
    const prefs = await this.getNotificationPrefs(userId);
    if (!prefs) return true; // 默认允许
    return prefs[type] !== false;
  }

  private verifyTelegramInitData(initData: string, botToken: string): boolean {
    try {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      
      if (!hash) return false;
      
      params.delete('hash');
      
      // 按键名排序参数
      const sortedParams = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
      const dataCheckString = sortedParams.map(([key, value]) => `${key}=${value}`).join('\n');
      
      // 生成密钥
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken || '').digest();
      
      // 计算哈希值
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
      
      return calculatedHash === hash;
    } catch (error) {
      console.error('Error verifying Telegram initData:', error);
      return false;
    }
  }

  private parseInitData(initData: string): any {
    try {
      const params = new URLSearchParams(initData);
      const userJson = params.get('user');
      
      if (userJson) {
        return JSON.parse(decodeURIComponent(userJson));
      }
      
      return {};
    } catch (error) {
      console.error('Error parsing initData:', error);
      return {};
    }
  }
}
