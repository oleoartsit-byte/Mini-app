import { IconCheck, IconInfo } from './icons/CyberpunkIcons';

// 等级经验配置
// 每级所需任务数 = 基础任务数 + (等级-1) * 递增任务数
// 例如：1级升2级需要3任务，2级升3级需要5任务，3级升4级需要7任务...
const LEVEL_CONFIG = {
  baseExp: 3,      // 1级升2级需要的任务数
  expIncrement: 2, // 每升一级增加的任务数
  maxLevel: 99,    // 最大等级
};

// 计算到达某等级所需的总任务数
const getTotalExpForLevel = (level) => {
  if (level <= 1) return 0;
  // 等差数列求和: n项和 = n * (首项 + 末项) / 2
  // 第1级到第(level-1)级的经验总和
  const n = level - 1;
  const firstTerm = LEVEL_CONFIG.baseExp;
  const lastTerm = LEVEL_CONFIG.baseExp + (n - 1) * LEVEL_CONFIG.expIncrement;
  return Math.floor(n * (firstTerm + lastTerm) / 2);
};

// 根据完成任务数计算等级和经验百分比
const calculateLevelInfo = (completedCount) => {
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

export function UserCard({ user, authStatus, completedCount = 0, t }) {
  const getUserDisplayName = () => {
    if (user) {
      return user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
    return t ? t('user.guest') : 'Guest';
  };

  const getStatusInfo = () => {
    switch (authStatus) {
      case 'success': return { color: '#39ff14', bg: 'rgba(57, 255, 20, 0.15)', text: t ? t('user.authSuccess') : 'Verified', icon: <IconCheck size={12} color="#39ff14" /> };
      case 'failed': return { color: '#ff4757', bg: 'rgba(255, 71, 87, 0.15)', text: t ? t('user.authFailed') : 'Failed', icon: <IconInfo size={12} color="#ff4757" /> };
      case 'dev': return { color: '#ffc107', bg: 'rgba(255, 193, 7, 0.15)', text: t ? t('user.devMode') : 'Dev Mode', icon: <IconInfo size={12} color="#ffc107" /> };
      default: return { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255, 255, 255, 0.1)', text: t ? t('user.authPending') : 'Verifying...', icon: <span style={{ fontSize: 12 }}>◌</span> };
    }
  };

  // 根据等级获取称号
  const getLevelTitle = (level) => {
    if (level >= 50) return t ? t('user.legendary') : '传奇玩家';
    if (level >= 30) return t ? t('user.master') : '大师玩家';
    if (level >= 15) return t ? t('user.elite') : '精英玩家';
    if (level >= 5) return t ? t('user.advanced') : '进阶玩家';
    return t ? t('user.newbie') : '新手玩家';
  };

  const statusInfo = getStatusInfo();

  // 基于完成任务数计算等级和经验
  const levelInfo = calculateLevelInfo(completedCount);
  const userLevel = levelInfo.level;
  const expPercent = levelInfo.expPercent;

  const styles = {
    section: {
      padding: '20px 16px 16px',
      position: 'relative',
    },
    card: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    avatarWrapper: {
      position: 'relative',
      flexShrink: 0,
    },
    avatarRing: {
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: '50%',
      border: '2px solid #00e5ff',
      boxShadow: '0 0 15px rgba(0, 229, 255, 0.5), inset 0 0 15px rgba(0, 229, 255, 0.1)',
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a1a3e, #2a2a4e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#00e5ff',
      fontSize: 22,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      position: 'relative',
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 6,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    levelRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    levelBadge: {
      background: 'linear-gradient(135deg, #00e5ff, #0088ff)',
      padding: '2px 8px',
      borderRadius: 8,
      fontSize: 10,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
    },
    expBarWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    expBar: {
      width: 50,
      height: 4,
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    expFill: {
      width: `${expPercent}%`,
      height: '100%',
      background: 'linear-gradient(90deg, #39ff14, #00e5ff)',
      borderRadius: 2,
    },
    levelTitle: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: '#bf5fff',
      fontWeight: '600',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '8px 14px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: statusInfo.color,
      backgroundColor: statusInfo.bg,
      border: `1px solid ${statusInfo.color}40`,
    },
  };

  return (
    <div style={styles.section}>
      <div style={styles.card}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatarRing} />
          <div style={styles.avatar}>
            {user?.first_name?.[0]?.toUpperCase() || 'G'}
          </div>
        </div>
        <div style={styles.cardContent}>
          <p style={styles.cardTitle}>{getUserDisplayName()}</p>
          <div style={styles.levelRow}>
            <span style={styles.levelBadge}>LV.{userLevel}</span>
            <div style={styles.expBarWrapper}>
              <div style={styles.expBar}>
                <div style={styles.expFill} />
              </div>
              <span style={styles.levelTitle}>{getLevelTitle(userLevel)}</span>
            </div>
          </div>
        </div>
        <div style={styles.rightSection}>
          <div style={styles.statusBadge}>
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
