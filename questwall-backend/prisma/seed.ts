import { PrismaClient, QuestType, RewardType, QuestStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 创建系统管理员用户
  const adminUser = await prisma.user.upsert({
    where: { tgId: BigInt(1) },
    update: {},
    create: {
      tgId: BigInt(1),
      username: 'system_admin',
      firstName: 'System',
      lastName: 'Admin',
      locale: 'en',
    },
  });
  console.log('✅ Admin user created:', adminUser.id.toString());

  // 创建测试用户
  const testUser = await prisma.user.upsert({
    where: { tgId: BigInt(123456789) },
    update: {},
    create: {
      tgId: BigInt(123456789),
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
      locale: 'zh',
      walletAddr: 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbRELWt',
    },
  });
  console.log('✅ Test user created:', testUser.id.toString());

  // 创建示例任务
  const quests = [
    {
      ownerId: adminUser.id,
      type: QuestType.JOIN_CHANNEL,
      title: '关注官方频道 @questwall',
      description: '关注我们的官方 Telegram 频道，获取最新项目动态和福利活动通知。',
      rewardType: RewardType.STARS,
      rewardAmount: new Decimal('10'),
      limits: { dailyCap: 1000, perUserCap: 1 },
      status: QuestStatus.ACTIVE,
      channelId: '@questwall',
    },
    {
      ownerId: adminUser.id,
      type: QuestType.JOIN_GROUP,
      title: '加入社区群 @questwall_chat',
      description: '加入我们的社区群组，与其他用户交流互动。',
      rewardType: RewardType.STARS,
      rewardAmount: new Decimal('15'),
      limits: { dailyCap: 500, perUserCap: 1 },
      status: QuestStatus.ACTIVE,
      channelId: '@questwall_chat',
    },
    {
      ownerId: adminUser.id,
      type: QuestType.ONCHAIN_TRANSFER,
      title: '首次链上交易',
      description: '完成任意一笔 TON 链上交易，体验 Web3 世界。',
      rewardType: RewardType.TON,
      rewardAmount: new Decimal('0.1'),
      limits: { dailyCap: 100, perUserCap: 1 },
      status: QuestStatus.ACTIVE,
    },
    {
      ownerId: adminUser.id,
      type: QuestType.FOLLOW_TWITTER,
      title: '关注 Twitter @QuestWall',
      description: '在 Twitter 上关注我们，获取全球化的项目资讯。',
      rewardType: RewardType.POINTS,
      rewardAmount: new Decimal('100'),
      limits: { dailyCap: 500, perUserCap: 1 },
      status: QuestStatus.ACTIVE,
      targetUrl: 'https://twitter.com/QuestWall',
    },
    {
      ownerId: adminUser.id,
      type: QuestType.DEEP_LINK,
      title: '下载合作伙伴 App',
      description: '下载并打开我们合作伙伴的应用程序。',
      rewardType: RewardType.USDT,
      rewardAmount: new Decimal('0.5'),
      limits: { dailyCap: 200, perUserCap: 1 },
      status: QuestStatus.ACTIVE,
      targetUrl: 'https://partner.app/download',
    },
  ];

  for (const quest of quests) {
    const created = await prisma.quest.create({ data: quest });
    console.log(`✅ Quest created: ${created.title}`);
  }

  // 创建系统配置
  const configs = [
    {
      key: 'min_withdraw_ton',
      value: { amount: '0.5', unit: 'TON' },
      description: 'TON 最小提现金额',
    },
    {
      key: 'min_withdraw_usdt',
      value: { amount: '5', unit: 'USDT' },
      description: 'USDT 最小提现金额',
    },
    {
      key: 'daily_checkin_rewards',
      value: {
        day1: 10,
        day2: 20,
        day3: 30,
        day4: 40,
        day5: 50,
        day6: 60,
        day7: 100,
      },
      description: '每日签到奖励配置',
    },
    {
      key: 'invite_bonus',
      value: { amount: '1', unit: 'USDT', maxLevel: 1 },
      description: '邀请奖励配置',
    },
    {
      key: 'risk_score_threshold',
      value: { warning: 60, block: 80 },
      description: '风险评分阈值',
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
    console.log(`✅ Config created: ${config.key}`);
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
