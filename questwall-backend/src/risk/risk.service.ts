import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlacklistType } from '@prisma/client';

// 风控配置
const RISK_CONFIG = {
  // 频率限制
  rateLimit: {
    questClaimPerMinute: 5,      // 每分钟最多领取任务数
    questClaimPerHour: 20,       // 每小时最多领取任务数
    questClaimPerDay: 50,        // 每天最多领取任务数
  },
  // 风险分阈值
  threshold: {
    warning: 50,      // 警告阈值
    block: 80,        // 封禁阈值
  },
  // 风险权重
  weights: {
    multipleDevices: 15,        // 一个用户多个设备
    multipleUsersOnDevice: 25,  // 一个设备多个用户
    vpnProxy: 20,               // 使用 VPN/代理
    highFrequency: 30,          // 高频操作
    suspiciousPattern: 25,      // 可疑行为模式
    newAccount: 10,             // 新账号
  }
};

interface FingerprintDto {
  visitorId: string;
  userAgent?: string;
  platform?: string;
  screenRes?: string;
  timezone?: string;
  language?: string;
  fingerprint?: Record<string, any>;
}

interface RiskContext {
  userId?: bigint;
  ip?: string;
  visitorId?: string;
  action?: string;
}

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  // 提交设备指纹
  async submitFingerprint(userId: bigint, fpDto: FingerprintDto, ip?: string) {
    const { visitorId, userAgent, platform, screenRes, timezone, language, fingerprint } = fpDto;

    // 1. 检查设备是否在黑名单
    const isDeviceBlocked = await this.isBlocked('DEVICE', visitorId);
    if (isDeviceBlocked) {
      await this.logRiskEvent({
        userId,
        eventType: 'blocked_device_access',
        severity: 'high',
        details: { visitorId },
        ip,
        visitorId,
      });
      return { success: false, blocked: true, reason: '设备已被封禁' };
    }

    // 2. 更新或创建设备指纹记录
    await this.prisma.deviceFingerprint.upsert({
      where: { visitorId_userId: { visitorId, userId } },
      update: {
        userAgent,
        platform,
        screenRes,
        timezone,
        language,
        fingerprint: fingerprint || {},
        lastSeenAt: new Date(),
      },
      create: {
        visitorId,
        userId,
        userAgent,
        platform,
        screenRes,
        timezone,
        language,
        fingerprint: fingerprint || {},
      },
    });

    // 3. 检查该设备关联了多少用户（可疑指标）
    const usersOnDevice = await this.prisma.deviceFingerprint.count({
      where: { visitorId },
    });

    if (usersOnDevice > 3) {
      await this.logRiskEvent({
        userId,
        eventType: 'multiple_users_on_device',
        severity: usersOnDevice > 5 ? 'high' : 'medium',
        details: { visitorId, userCount: usersOnDevice },
        ip,
        visitorId,
      });
    }

    // 4. 记录 IP
    if (ip) {
      await this.recordIp(userId, ip);
    }

    return {
      success: true,
      message: '设备指纹已提交',
      riskIndicators: {
        usersOnDevice,
        isNew: usersOnDevice === 1,
      },
    };
  }

  // 记录 IP 访问
  async recordIp(userId: bigint, ip: string) {
    // 检查 IP 是否在黑名单
    const isIpBlocked = await this.isBlocked('IP', ip);
    if (isIpBlocked) {
      await this.logRiskEvent({
        userId,
        eventType: 'blocked_ip_access',
        severity: 'high',
        details: { ip },
        ip,
      });
      return { blocked: true };
    }

    // 更新 IP 记录
    await this.prisma.ipRecord.upsert({
      where: { ip_userId: { ip, userId } },
      update: {
        requestCount: { increment: 1 },
        lastSeenAt: new Date(),
      },
      create: {
        ip,
        userId,
        requestCount: 1,
      },
    });

    // 检查该 IP 关联了多少用户
    const usersOnIp = await this.prisma.ipRecord.count({
      where: { ip },
    });

    if (usersOnIp > 5) {
      await this.logRiskEvent({
        userId,
        eventType: 'multiple_users_on_ip',
        severity: usersOnIp > 10 ? 'high' : 'medium',
        details: { ip, userCount: usersOnIp },
        ip,
      });
    }

    return { blocked: false, usersOnIp };
  }

  // 获取用户风险分
  async getRiskScore(userId: bigint) {
    let score = 0;
    const factors: string[] = [];

    // 1. 检查用户关联的设备数
    const deviceCount = await this.prisma.deviceFingerprint.count({
      where: { userId },
    });
    if (deviceCount > 3) {
      score += RISK_CONFIG.weights.multipleDevices;
      factors.push(`多设备登录(${deviceCount}台)`);
    }

    // 2. 检查是否有设备被多用户使用
    const devices = await this.prisma.deviceFingerprint.findMany({
      where: { userId },
      select: { visitorId: true },
    });

    for (const device of devices) {
      const usersOnDevice = await this.prisma.deviceFingerprint.count({
        where: { visitorId: device.visitorId },
      });
      if (usersOnDevice > 1) {
        score += RISK_CONFIG.weights.multipleUsersOnDevice;
        factors.push(`设备多用户(${usersOnDevice}人)`);
        break; // 只算一次
      }
    }

    // 3. 检查 IP 关联用户数
    const ips = await this.prisma.ipRecord.findMany({
      where: { userId },
      select: { ip: true },
    });

    for (const ipRecord of ips) {
      const usersOnIp = await this.prisma.ipRecord.count({
        where: { ip: ipRecord.ip },
      });
      if (usersOnIp > 5) {
        score += RISK_CONFIG.weights.vpnProxy;
        factors.push(`IP多用户(${usersOnIp}人)`);
        break;
      }
    }

    // 4. 检查高频行为
    const recentActions = await this.prisma.action.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 3600000) }, // 过去1小时
      },
    });
    if (recentActions > RISK_CONFIG.rateLimit.questClaimPerHour) {
      score += RISK_CONFIG.weights.highFrequency;
      factors.push(`高频操作(${recentActions}次/小时)`);
    }

    // 5. 检查账号年龄
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (user) {
      const accountAge = Date.now() - user.createdAt.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (accountAge < oneDayMs) {
        score += RISK_CONFIG.weights.newAccount;
        factors.push('新账号(<24小时)');
      }
    }

    // 6. 检查风险事件历史
    const riskEventCount = await this.prisma.riskEvent.count({
      where: {
        userId,
        severity: { in: ['high', 'critical'] },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600000) }, // 过去7天
      },
    });
    if (riskEventCount > 0) {
      score += riskEventCount * 5;
      factors.push(`风险事件(${riskEventCount}次)`);
    }

    // 更新用户风险分
    await this.prisma.user.update({
      where: { id: userId },
      data: { riskScore: Math.min(score, 100) },
    });

    return {
      userId: userId.toString(),
      score: Math.min(score, 100),
      level: score >= RISK_CONFIG.threshold.block ? 'high'
           : score >= RISK_CONFIG.threshold.warning ? 'medium'
           : 'low',
      factors,
      shouldBlock: score >= RISK_CONFIG.threshold.block,
    };
  }

  // 频率限制检查
  async checkRateLimit(userId: bigint, action: string): Promise<{ allowed: boolean; reason?: string }> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    if (action === 'quest_claim') {
      // 每分钟限制
      const minuteCount = await this.prisma.action.count({
        where: { userId, createdAt: { gte: oneMinuteAgo } },
      });
      if (minuteCount >= RISK_CONFIG.rateLimit.questClaimPerMinute) {
        await this.logRiskEvent({
          userId,
          eventType: 'rate_limit_minute',
          severity: 'medium',
          details: { action, count: minuteCount, limit: RISK_CONFIG.rateLimit.questClaimPerMinute },
        });
        return { allowed: false, reason: '操作太频繁，请稍后再试' };
      }

      // 每小时限制
      const hourCount = await this.prisma.action.count({
        where: { userId, createdAt: { gte: oneHourAgo } },
      });
      if (hourCount >= RISK_CONFIG.rateLimit.questClaimPerHour) {
        await this.logRiskEvent({
          userId,
          eventType: 'rate_limit_hour',
          severity: 'medium',
          details: { action, count: hourCount, limit: RISK_CONFIG.rateLimit.questClaimPerHour },
        });
        return { allowed: false, reason: '今日领取任务数已达上限' };
      }

      // 每天限制
      const dayCount = await this.prisma.action.count({
        where: { userId, createdAt: { gte: oneDayAgo } },
      });
      if (dayCount >= RISK_CONFIG.rateLimit.questClaimPerDay) {
        await this.logRiskEvent({
          userId,
          eventType: 'rate_limit_day',
          severity: 'low',
          details: { action, count: dayCount, limit: RISK_CONFIG.rateLimit.questClaimPerDay },
        });
        return { allowed: false, reason: '今日领取任务数已达上限' };
      }
    }

    return { allowed: true };
  }

  // 综合风控检查
  async checkRisk(context: RiskContext): Promise<{ allowed: boolean; reason?: string; score?: number }> {
    const { userId, ip, visitorId, action } = context;

    // 1. 检查用户黑名单
    if (userId) {
      const isUserBlocked = await this.isBlocked('USER', userId.toString());
      if (isUserBlocked) {
        return { allowed: false, reason: '账号已被封禁' };
      }
    }

    // 2. 检查设备黑名单
    if (visitorId) {
      const isDeviceBlocked = await this.isBlocked('DEVICE', visitorId);
      if (isDeviceBlocked) {
        return { allowed: false, reason: '设备已被封禁' };
      }
    }

    // 3. 检查 IP 黑名单
    if (ip) {
      const isIpBlocked = await this.isBlocked('IP', ip);
      if (isIpBlocked) {
        return { allowed: false, reason: 'IP 已被封禁' };
      }
    }

    // 4. 频率限制
    if (userId && action) {
      const rateResult = await this.checkRateLimit(userId, action);
      if (!rateResult.allowed) {
        return rateResult;
      }
    }

    // 5. 风险分检查
    if (userId) {
      const riskResult = await this.getRiskScore(userId);
      if (riskResult.shouldBlock) {
        await this.logRiskEvent({
          userId,
          eventType: 'high_risk_blocked',
          severity: 'critical',
          details: { score: riskResult.score, factors: riskResult.factors },
          ip,
          visitorId,
        });
        return { allowed: false, reason: '账号风险过高', score: riskResult.score };
      }
      return { allowed: true, score: riskResult.score };
    }

    return { allowed: true };
  }

  // 添加到黑名单
  async addToBlacklist(type: BlacklistType, value: string, reason?: string, expiresAt?: Date) {
    await this.prisma.blacklist.upsert({
      where: { type_value: { type, value } },
      update: { reason, expiresAt },
      create: { type, value, reason, expiresAt },
    });

    await this.logRiskEvent({
      eventType: 'blacklist_add',
      severity: 'high',
      details: { type, value, reason, expiresAt },
    });

    return { success: true, message: `已添加到${type}黑名单` };
  }

  // 从黑名单移除
  async removeFromBlacklist(type: BlacklistType, value: string) {
    await this.prisma.blacklist.deleteMany({
      where: { type, value },
    });

    return { success: true, message: `已从${type}黑名单移除` };
  }

  // 检查是否在黑名单
  async isBlocked(type: BlacklistType | string, value: string): Promise<boolean> {
    const record = await this.prisma.blacklist.findFirst({
      where: {
        type: type as BlacklistType,
        value,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return !!record;
  }

  // 记录风控事件
  async logRiskEvent(event: {
    userId?: bigint;
    eventType: string;
    severity: string;
    details?: any;
    ip?: string;
    visitorId?: string;
  }) {
    await this.prisma.riskEvent.create({
      data: {
        userId: event.userId,
        eventType: event.eventType,
        severity: event.severity,
        details: event.details || {},
        ip: event.ip,
        visitorId: event.visitorId,
      },
    });
  }

  // 获取风控事件列表（管理员用）
  async getRiskEvents(options: {
    userId?: bigint;
    eventType?: string;
    severity?: string;
    limit?: number;
  }) {
    const { userId, eventType, severity, limit = 50 } = options;

    const events = await this.prisma.riskEvent.findMany({
      where: {
        ...(userId && { userId }),
        ...(eventType && { eventType }),
        ...(severity && { severity }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    // 转换 BigInt 为 string
    return events.map(e => ({
      ...e,
      id: e.id.toString(),
      userId: e.userId?.toString() || null,
    }));
  }

  // 获取黑名单列表
  async getBlacklist(type?: BlacklistType) {
    const list = await this.prisma.blacklist.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    // 转换 BigInt 为 string
    return list.map(item => ({
      ...item,
      id: item.id.toString(),
    }));
  }
}
