-- 为 quests 表添加多语言字段
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "title_en" TEXT;
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "description_en" TEXT;

-- 可选：将现有数据复制到英文字段作为初始值
-- UPDATE "quests" SET "title_en" = "title", "description_en" = "description" WHERE "title_en" IS NULL;
