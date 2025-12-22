"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_DAILY_REWARDS = [10, 20, 30, 40, 50, 60, 100];
const DEFAULT_MAKEUP_COST = 20;
const MAKEUP_REWARD = 10;
function getUserDayStartUTC(timezoneOffset) {
    const now = new Date();
    const userLocalMs = now.getTime() - timezoneOffset * 60000;
    const userMidnight = new Date(userLocalMs);
    userMidnight.setUTCHours(0, 0, 0, 0);
    const todayStartUTC = new Date(userMidnight.getTime() + timezoneOffset * 60000);
    return todayStartUTC;
}
function getUserDayEndUTC(timezoneOffset) {
    const start = getUserDayStartUTC(timezoneOffset);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}
function formatDateWithTimezone(utcDate, timezoneOffset) {
    const userLocalMs = utcDate.getTime() - timezoneOffset * 60000;
    const userLocal = new Date(userLocalMs);
    return `${userLocal.getUTCFullYear()}-${String(userLocal.getUTCMonth() + 1).padStart(2, '0')}-${String(userLocal.getUTCDate()).padStart(2, '0')}`;
}
let CheckInService = class CheckInService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfig() {
        const config = await this.prisma.systemConfig.findUnique({
            where: { key: 'checkin_config' },
        });
        if (config?.value) {
            const val = config.value;
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
    async getStatus(userId, timezoneOffset = 0) {
        const config = await this.getConfig();
        const todayStart = getUserDayStartUTC(timezoneOffset);
        const todayEnd = getUserDayEndUTC(timezoneOffset);
        const checkIns = await this.prisma.checkIn.findMany({
            where: { userId },
            orderBy: { checkedAt: 'desc' },
        });
        const todayCheckIn = checkIns.find((c) => {
            const checkTime = new Date(c.checkedAt).getTime();
            return checkTime >= todayStart.getTime() && checkTime < todayEnd.getTime();
        });
        let streak = 0;
        const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
        if (sortedCheckIns.length > 0) {
            let checkDayStart = new Date(todayStart);
            if (!todayCheckIn) {
                checkDayStart = new Date(checkDayStart.getTime() - 24 * 60 * 60 * 1000);
            }
            for (const checkIn of sortedCheckIns) {
                const checkTime = new Date(checkIn.checkedAt).getTime();
                const checkDayEnd = new Date(checkDayStart.getTime() + 24 * 60 * 60 * 1000);
                if (checkTime >= checkDayStart.getTime() && checkTime < checkDayEnd.getTime()) {
                    streak++;
                    checkDayStart = new Date(checkDayStart.getTime() - 24 * 60 * 60 * 1000);
                }
                else if (checkTime < checkDayStart.getTime()) {
                    break;
                }
            }
        }
        const recentDays = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
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
    async checkIn(userId, timezoneOffset = 0) {
        const config = await this.getConfig();
        const todayStart = getUserDayStartUTC(timezoneOffset);
        const todayEnd = getUserDayEndUTC(timezoneOffset);
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
            throw new common_1.BadRequestException('今日已签到');
        }
        const status = await this.getStatus(userId, timezoneOffset);
        const newStreak = status.streak + 1;
        const dayIndex = (newStreak - 1) % 7;
        const reward = config.dailyRewards[dayIndex];
        const epochStart = new Date('2024-01-01T00:00:00Z').getTime();
        const dayNumber = Math.floor((todayStart.getTime() - epochStart) / (24 * 60 * 60 * 1000));
        const result = await this.prisma.$transaction(async (tx) => {
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
    async makeup(userId, dateStr, timezoneOffset = 0) {
        const config = await this.getConfig();
        const [year, month, day] = dateStr.split('-').map(Number);
        const targetLocalMidnight = new Date(year, month - 1, day, 0, 0, 0, 0);
        const targetDayStart = new Date(targetLocalMidnight.getTime() + timezoneOffset * 60000);
        const targetDayEnd = new Date(targetDayStart.getTime() + 24 * 60 * 60 * 1000);
        const todayStart = getUserDayStartUTC(timezoneOffset);
        if (targetDayStart.getTime() === todayStart.getTime()) {
            throw new common_1.BadRequestException('今天请使用正常签到');
        }
        if (targetDayStart.getTime() > todayStart.getTime()) {
            throw new common_1.BadRequestException('不能补签未来的日期');
        }
        const sevenDaysAgoStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (targetDayStart.getTime() < sevenDaysAgoStart.getTime()) {
            throw new common_1.BadRequestException('只能补签最近7天的记录');
        }
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
            throw new common_1.BadRequestException('该日期已签到');
        }
        const targetMidDay = new Date(targetDayStart.getTime() + 12 * 60 * 60 * 1000);
        const epochStart = new Date('2024-01-01T00:00:00Z').getTime();
        const dayNumber = Math.floor((targetDayStart.getTime() - epochStart) / (24 * 60 * 60 * 1000));
        const result = await this.prisma.$transaction(async (tx) => {
            const checkIn = await tx.checkIn.create({
                data: {
                    userId,
                    day: dayNumber,
                    points: MAKEUP_REWARD,
                    checkedAt: targetMidDay,
                },
            });
            return { checkIn, cost: config.makeupCost, reward: MAKEUP_REWARD };
        });
        return {
            success: true,
            cost: result.cost,
            reward: result.reward,
            message: `补签成功！消耗 ${result.cost} USDT，获得 ${result.reward} USDT`,
        };
    }
    async getLeaderboard(limit = 10) {
        const result = await this.prisma.checkIn.groupBy({
            by: ['userId'],
            _count: { id: true },
            _sum: { points: true },
            orderBy: { _count: { id: 'desc' } },
            take: limit,
        });
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
};
exports.CheckInService = CheckInService;
exports.CheckInService = CheckInService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckInService);
//# sourceMappingURL=checkin.service.js.map