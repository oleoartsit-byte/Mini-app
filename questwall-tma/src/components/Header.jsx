export function Header({ completedCount = 0, totalPoints = 0, t }) {
  const styles = {
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '32px 20px 40px',
      position: 'relative',
      overflow: 'hidden',
    },
    pattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    },
    content: {
      position: 'relative',
      zIndex: 1,
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    logo: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: 'rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
    },
    brandText: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#fff',
      margin: 0,
      letterSpacing: '-0.5px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    subtitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      margin: 0,
      marginTop: 2,
    },
    statsRow: {
      display: 'flex',
      gap: 12,
      marginTop: 20,
    },
    statCard: {
      flex: 1,
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: 12,
      padding: '12px 14px',
      textAlign: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#fff',
      margin: 0,
    },
    statLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.7)',
      margin: 0,
      marginTop: 2,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  };

  // 计算排名（简单模拟：积分越高排名越靠前）
  const rank = totalPoints > 0 ? Math.max(1, 100 - Math.floor(totalPoints / 10)) : '-';

  return (
    <div style={styles.header}>
      <div style={styles.pattern} />
      <div style={styles.content}>
        <div style={styles.logoRow}>
          <div style={styles.logo}>🏆</div>
          <div style={styles.brandText}>
            <h1 style={styles.title}>{t ? t('home.appName') : 'Quest Wall'}</h1>
            <p style={styles.subtitle}>{t ? t('home.slogan') : '完成任务，赚取奖励'}</p>
          </div>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{completedCount}</p>
            <p style={styles.statLabel}>{t ? t('home.completed') : '已完成'}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>{totalPoints}</p>
            <p style={styles.statLabel}>{t ? t('home.points') : '积分'}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statValue}>#{rank}</p>
            <p style={styles.statLabel}>{t ? t('home.rank') : '排名'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
