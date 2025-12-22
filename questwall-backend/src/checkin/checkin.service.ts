import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 默认签到奖励配置
const DEFAULT_DAILY_REWARDS = [10, 20, 30, 40, 50, 60, 100];
const DEFAULT_MAKEUP_COST = 20;
const MAKEUP_REWARD = 10;

// 获取用户当地日期的开始时间（返回 UTC Date）
// timezoneOffset: 用户时区偏移（分钟），如北京时间 getTimezoneOffset() 返回 -480
function getUserDayStartUTC(timezoneOffset: number): Date {
  const now = new Date();

  // 计算用户当地时间（以 UTC 毫秒表示）
  // 用户当地时间 = UTC 时间 - timezoneOffset
  // 例如：北京时间 = UTC + 8小时 = UTC - (-480分钟)
  const userLocalMs = now.getTime() - timezoneOffset * 60000;

  // 获取用户当地的今天午夜（以 UTC 日期对象操作）
  const userMidnight = new Date(userLocalMs);
  userMidnight.setUTCHours(0, 0, 0, 0);

  // 转回真正的 UTC 时间
  // 北京时间 00:00 = UTC 前一天 16:00
  const todayStartUTC = new Date(userMidnight.getTime() + timezoneOffset * 60000);

  return todayStartUTC;
}

// 获取用户当地日期的结束时间（返回 UTC Date）
function getUserDayEndUTC(timezoneOffset: number): Date {
  const start = getUserDayStartUTC(timezoneOffset);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

// 格式化日期为 YYYY-MM-DD（基于用户时区）
function formatDateWithTimezone(utcDate: Date, timezoneOffset: number): string {
  // 转为用户当地时间
  const userLocalMs = utcDate.getTime() - timezoneOffset * 60000;
  const userLocal = new Date(userLocalMs);
  return `${userLocal.getUTCFullYear()}-${String(userLocal.getUTCMonth() + 1).padStart(2, '0')}-${String(userLocal.getUTCDate()).padStart(2, '0')}`;
}

@Injectable()
export class CheckInService {
  constructor(private prisma: PrismaService) {}

  // 获取签到配置
  async getConfig() {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'checkin_config' },
    });

    if (config?.value) {
      const val = config.value as any;
      return {
        dailyRewards: [
          val.day1 || 10,
          val.day2 || 20,
          val.day3 || 30,
          val.day4 || 40,
          val.day5 || 50,
          val.day6 || 60,
          val.day7 || 100,
        ],
        makeupCost: val.makeupCost || DEFAULT_MAKEUP_COST,
      };
    }

    return {
      dailyRewards: DEFAULT_DAILY_REWARDS,
      makeupCost: DEFAULT_MAKEUP_COST,
    };
  }

  // 获取用户签到状态
  // timezoneOffset: 用户时区偏移（分钟），如北京时间是 -480
  async getStatus(userId: bigint, timezoneOffset = 0) {
    const config = await this.getConfig();

    // 获取用户当地今天的 UTC 时间范围
    const todayStart = getUserDayStartUTC(timezoneOffset);
    const todayEnd = getUserDayEndUTC(timezoneOffset);

    // 获取用户所有签到记录
    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { checkedAt: 'desc' },
    });

    // 检查今天（用户当地时间）是否已签到
    const todayCheckIn = checkIns.find((c) => {
      const checkTime = new Date(c.checkedAt).getTime();
      return checkTime >= todayStart.getTime() && checkTime < todayEnd.getTime();
    });

    // 计算连续签到天数（基于用户时区）
    let streak = 0;
    const sortedCheckIns = [...checkIns].sort(
      (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
    );

    if (sortedCheckIns.length > 0) {
      // 从用户当地的今天开始检查
      let checkDayStart = new Date(todayStart);

      // 如果今天没签到，从昨天开始数
      if (!todayCheckIn) {
        checkDayStart = new Date(checkDayStart.getTime() - 24 * 60 * 60 * 1000);
      }

      for (const checkIn of sortedCheckIns) {
        const checkTime = new Date(checkIn.checkedAt).getTime();
        const checkDayEnd = new Date(checkDayStart.getTime() + 24 * 60 * 60 * 1000);

        if (checkTime >= checkDayStart.getTime() && checkTime < checkDayEnd.getTime()) {
          streak++;
          checkDayStart = new Date(checkDayStart.getTime() - 24 * 60 * 60 * 1000);
        } else if (checkTime < checkDayStart.getTime()) {
          break;
        }
      }
    }

    // 获取最近7天的签到历史（基于用户时区）
    const recentDays = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      // 计算这一天在用户时区的日期字符串
      const dateStr = formatDateWithTimezone(dayStart, timezoneOffset);

      const isChecked = checkIns.some((c) => {
        const checkTime = new Date(c.checkedAt).getTime();
        return checkTime >= dayStart.getTime() && checkTime < dayEnd.getTime();
      });

      recentDays.push({
        date: dateStr,
        isChecked,
        isToday: i === 0,
        canMakeup: !isChecked && i !== 0,
      });
    }

    // 今天的奖励
    const dayIndex = streak % 7;
    const todayReward = config.dailyRewards[dayIndex];

    return {
      todayChecked: !!todayCheckIn,
      streak,
      todayReward,
      recentDays,
      checkInHistory: recentDays.filter(d => d.isChecked).map(d => d.date),
      config,
    };
  }

  // 每日签到
  // timezoneOffset: 用户时区偏移（分钟），如北京时间是 -480
  async checkIn(userId: bigint, timezoneOffset = 0) {
    const config = await this.getConfig();

    // 获取用户当地今天的 UTC 时间范围
    const todayStart = getUserDayStartUTC(timezoneOffset);
    const todayEnd = getUserDayEndUTC(timezoneOffset);

    // 检查今天（用户当地时间）是否已签到
    const existingCheckIn = await this.prisma.checkIn.findFirst({
      where: {
        userId,
        checkedAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    if (existingCheckIn) {
      throw new BadRequestException('今日已签到');
    }

    // 获取当前连续签到天数
    const status = await this.getStatus(userId, timezoneOffset);
    const newStreak = status.streak + 1;
    const dayIndex = (newStreak - 1) % 7;
    const reward = config.dailyRewards[dayIndex];

    // 计算今天的日期序号（从 2024-01-01 算起的天数，作为唯一标识）
    const epochStart = new Date('2024-01-01T00:00:00Z').getTime();
    const dayNumber = Math.floor((todayStart.getTime() - epochStart) / (24 * 60 * 60 * 1000));

    // 使用事务确保数据一致性
    const result = await this.prisma.$transaction(async (tx) => {
      // 创建签到记录（day 存储日期序号，确保每天唯一）
      const checkIn = await tx.checkIn.create({
        data: {
          userId,
          day: dayNumber,
          points: reward,
          checkedAt: new Date(),
        },
      });

      return { checkIn, reward, streak: newStreak };
    });

    return {
      success: true,
      streak: result.streak,
      reward: result.reward,
      message: `签到成功！连续 ${result.streak} 天，获得 ${result.reward} USDT`,
    };
  }

  // 补签
  // timezoneOffset: 用户时区偏移（分钟），如北京时间是 -480
  async makeup(userId: bigint, dateStr: string, timezoneOffset = 0) {
    const config = await this.getConfig();

    // 解析目标日期并转换为用户时区的那一天开始时间（UTC）
    const [year, month, day] = dateStr.split('-').map(Number);
    // 创建用户当地时间的午夜
    const targetLocalMidnight = new Date(year, month - 1, day, 0, 0, 0, 0);
    // 转为 UTC（加上时区偏移）
    const targetDayStart = new Date(targetLocalMidnight.getTime() + timezoneOffset * 60000);
    const targetDayEnd = new Date(targetDayStart.getTime() + 24 * 60 * 60 * 1000);

    // 获取用户当地今天的时间范围
    const todayStart = getUserDayStartUTC(timezoneOffset);

    // 不能补今天
    if (targetDayStart.getTime() === todayStart.getTime()) {
      throw new BadRequestException('今天请使用正常签到');
    }

    // 不能补未来的日期
    if (targetDayStart.getTime() > todayStart.getTime()) {
      throw new BadRequestException('不能补签未来的日期');
    }

    // 不能补超过7天前的
    const sevenDaysAgoStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (targetDayStart.getTime() < sevenDaysAgoStart.getTime()) {
      throw new BadRequestException('只能补签最近7天的记录');
    }

    // 检查该日期是否已签到
    const existingCheckIn = await this.prisma.checkIn.findFirst({
      where: {
        userId,
        checkedAt: {
          gte: targetDayStart,
          lt: targetDayEnd,
        },
      },
    });

    if (existingCheckIn) {
      throw new BadRequestException('该日期已签到');
    }

    // TODO: 检查用户 Stars 余额是否足够（需要接入用户余额系统）
    // const userBalance = await this.getUserStarsBalance(userId);
    // if (userBalance < config.makeupCost) {
    //   throw new BadRequestException(`Stars 不足，需要 ${config.makeupCost} Stars`);
    // }

    // 创建补签记录（存储为目标日期中午，避免时区边界问题）
    const targetMidDay = new Date(targetDayStart.getTime() + 12 * 60 * 60 * 1000);

    // 计算目标日期的日期序号（从 2024-01-01 算起的天数）
    const epochStart = new Date('2024-01-01T00:00:00Z').getTime();
    const dayNumber = Math.floor((targetDayStart.getTime() - epochStart) / (24 * 60 * 60 * 1000));

    const result = await this.prisma.$transaction(async (tx) => {
      const checkIn = await tx.checkIn.create({
        data: {
          userId,
          day: dayNumber, // 使用日期序号确保唯一
          points: MAKEUP_REWARD,
          checkedAt: targetMidDay,
        },
      });

      // TODO: 扣除用户 Stars
      // await tx.userBalance.update(...)

      return { checkIn, cost: config.makeupCost, reward: MAKEUP_REWARD };
    });

    return {
      success: true,
      cost: result.cost,
      reward: result.reward,
      message: `补签成功！消耗 ${result.cost} USDT，获得 ${result.reward} USDT`,
    };
  }

  // 获取签到排行榜
  async getLeaderboard(limit = 10) {
    const result = await this.prisma.checkIn.groupBy({
      by: ['userId'],
      _count: { id: true },
      _sum: { points: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // 获取用户信息
    const userIds = result.map((r) => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, firstName: true },
    });

    const userMap = new Map(users.map((u) => [u.id.toString(), u]));

    return result.map((r, index) => {
      const user = userMap.get(r.userId.toString());
      return {
        rank: index + 1,
        userId: r.userId.toString(),
        username: user?.username || user?.firstName || `User${r.userId}`,
        totalCheckIns: r._count.id,
        totalPoints: r._sum.points || 0,
      };
    });
  }
}
