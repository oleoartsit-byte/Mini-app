-- 将所有任务奖励改为 USDT
-- 运行方式: psql -d questwall -f update_rewards_to_usdt.sql
-- 或在 Prisma Studio / 数据库客户端中执行

-- 更新 Quest 表中的奖励类型
UPDATE "Quest" SET "rewardType" = 'USDT' WHERE "rewardType" != 'USDT';

-- 更新 Reward 表中的奖励类型（历史记录）
UPDATE "Reward" SET "type" = 'USDT' WHERE "type" != 'USDT';

-- 验证更新结果
SELECT "rewardType", COUNT(*) FROM "Quest" GROUP BY "rewardType";
SELECT "type", COUNT(*) FROM "Reward" GROUP BY "type";
