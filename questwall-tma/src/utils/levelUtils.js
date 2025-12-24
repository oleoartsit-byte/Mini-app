// 等级经验配置
// 每级所需任务数 = 基础任务数 + (等级-1) * 递增任务数
// 例如：1级升2级需要3任务，2级升3级需要5任务，3级升4级需要7任务...
export const LEVEL_CONFIG = {
  baseExp: 3,      // 1级升2级需要的任务数
  expIncrement: 2, // 每升一级增加的任务数
  maxLevel: 99,    // 最大等级
};

// 计算到达某等级所需的总任务数
export const getTotalExpForLevel = (level) => {
  if (level <= 1) return 0;
  // 等差数列求和: n项和 = n * (首项 + 末项) / 2
  // 第1级到第(level-1)级的经验总和
  const n = level - 1;
  const firstTerm = LEVEL_CONFIG.baseExp;
  const lastTerm = LEVEL_CONFIG.baseExp + (n - 1) * LEVEL_CONFIG.expIncrement;
  return Math.floor(n * (firstTerm + lastTerm) / 2);
};

// 根据完成任务数计算等级和经验百分比
export const calculateLevelInfo = (completedCount) => {
  let level = 1;

  // 找到当前等级
  while (level < LEVEL_CONFIG.maxLevel) {
    const expNeededForNextLevel = getTotalExpForLevel(level + 1);
    if (completedCount < expNeededForNextLevel) {
      break;
    }
    level++;
  }

  // 计算当前等级的经验进度
  const expForCurrentLevel = getTotalExpForLevel(level);
  const expForNextLevel = getTotalExpForLevel(level + 1);
  const expInCurrentLevel = completedCount - expForCurrentLevel;
  const expNeededForNextLevel = expForNextLevel - expForCurrentLevel;

  const expPercent = level >= LEVEL_CONFIG.maxLevel
    ? 100
    : Math.min(99, Math.floor((expInCurrentLevel / expNeededForNextLevel) * 100));

  return {
    level,
    expPercent,
    currentExp: expInCurrentLevel,
    nextLevelExp: expNeededForNextLevel,
  };
};

// 根据等级获取称号
export const getLevelTitle = (level, t) => {
  if (level >= 50) return t ? t('user.legendary') : '传奇玩家';
  if (level >= 30) return t ? t('user.master') : '大师玩家';
  if (level >= 15) return t ? t('user.elite') : '精英玩家';
  if (level >= 5) return t ? t('user.advanced') : '进阶玩家';
  return t ? t('user.newbie') : '新手玩家';
};
