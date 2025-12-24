import { IconCheck, IconStar, IconMedal } from './icons/CyberpunkIcons';

export function Header({ completedCount = 0, totalPoints = 0, t }) {
  // 计算排名
  const rank = totalPoints > 0 ? Math.max(1, 100 - Math.floor(totalPoints / 10)) : '-';

  const styles = {
    header: {
      padding: '0 16px 16px',
      position: 'relative',
    },
    content: {
      position: 'relative',
      zIndex: 1,
    },
    statsRow: {
      display: 'flex',
      gap: 10,
    },
    // 统计卡片基础样式
    statCard: {
      flex: 1,
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: '14px 10px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    },
    // 顶部彩色边框条
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      borderRadius: '16px 16px 0 0',
    },
    topBarGreen: {
      background: 'linear-gradient(90deg, #39ff14, #00e5ff)',
    },
    topBarBlue: {
      background: 'linear-gradient(90deg, #00e5ff, #0088ff)',
    },
    topBarPurple: {
      background: 'linear-gradient(90deg, #bf5fff, #ff4da6)',
    },
    statIcon: {
      fontSize: 20,
      marginBottom: 6,
      display: 'block',
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      margin: 0,
      color: '#fff',
    },
    statLabel: {
      fontSize: 10,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255,255,255,0.6)',
      margin: 0,
      marginTop: 4,
    },
  };

  return (
    <div style={styles.header}>
      <div style={styles.content}>
        <div style={styles.statsRow}>
          {/* 已完成 */}
          <div style={styles.statCard}>
            <div style={{ ...styles.topBar, ...styles.topBarGreen }} />
            <span style={{ ...styles.statIcon, color: '#39ff14' }}><IconCheck size={20} color="#39ff14" /></span>
            <p style={styles.statValue}>{completedCount}</p>
            <p style={styles.statLabel}>{t ? t('home.completed') : '已完成'}</p>
          </div>
          {/* 积分 */}
          <div style={styles.statCard}>
            <div style={{ ...styles.topBar, ...styles.topBarBlue }} />
            <span style={{ ...styles.statIcon, color: '#00e5ff' }}><IconStar size={20} color="#00e5ff" /></span>
            <p style={styles.statValue}>{totalPoints}</p>
            <p style={styles.statLabel}>{t ? t('home.points') : '积分'}</p>
          </div>
          {/* 排名 */}
          <div style={styles.statCard}>
            <div style={{ ...styles.topBar, ...styles.topBarPurple }} />
            <span style={{ ...styles.statIcon, color: '#bf5fff' }}><IconMedal size={20} color="#bf5fff" /></span>
            <p style={styles.statValue}>#{rank}</p>
            <p style={styles.statLabel}>{t ? t('home.rank') : '排名'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
