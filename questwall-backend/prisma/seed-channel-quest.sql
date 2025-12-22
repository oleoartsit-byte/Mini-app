-- 创建关注频道任务示例
-- 请替换 YOUR_CHANNEL_ID 为你的频道 ID（如 @questwall_channel 或 -1001234567890）

-- 首先检查是否有用户，如果没有先创建一个测试用户
INSERT INTO users (tg_id, username, first_name, locale, created_at, updated_at)
VALUES (123456789, 'admin', 'Admin', 'zh', NOW(), NOW())
ON CONFLICT (tg_id) DO NOTHING;

-- 获取用户 ID
DO $$
DECLARE
    owner_id BIGINT;
BEGIN
    SELECT id INTO owner_id FROM users WHERE tg_id = 123456789;

    -- 创建关注频道任务
    INSERT INTO quests (
        owner_id,
        type,
        title,
        description,
        reward_type,
        reward_amount,
        limits,
        status,
        channel_id,
        target_url,
        created_at,
        updated_at
    ) VALUES (
        owner_id,
        'JOIN_CHANNEL',
        '关注官方频道',
        '关注 Quest Wall 官方频道，获取最新任务和活动信息',
        'STARS',
        10,
        '{"dailyCap": 100, "perUserCap": 1}',
        'ACTIVE',
        '@questwall_test',  -- 替换为你的频道用户名或 ID
        'https://t.me/questwall_test',  -- 替换为你的频道链接
        NOW(),
        NOW()
    );

    -- 创建加入群组任务
    INSERT INTO quests (
        owner_id,
        type,
        title,
        description,
        reward_type,
        reward_amount,
        limits,
        status,
        channel_id,
        target_url,
        created_at,
        updated_at
    ) VALUES (
        owner_id,
        'JOIN_GROUP',
        '加入交流群',
        '加入 Quest Wall 用户交流群，与其他用户交流',
        'STARS',
        15,
        '{"dailyCap": 100, "perUserCap": 1}',
        'ACTIVE',
        '@questwall_group',  -- 替换为你的群组用户名或 ID
        'https://t.me/questwall_group',  -- 替换为你的群组链接
        NOW(),
        NOW()
    );
END $$;

-- 查看创建的任务
SELECT id, type, title, channel_id, target_url, status FROM quests WHERE type IN ('JOIN_CHANNEL', 'JOIN_GROUP');
