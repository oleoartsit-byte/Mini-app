import { IconTarget, IconGift, IconHistory, IconSearch, IconInfo, IconClock } from './icons/CyberpunkIcons';

export function Loading() {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    spinner: {
      width: 28,
      height: 28,
      border: '3px solid rgba(0, 229, 255, 0.15)',
      borderTopColor: '#00e5ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
    </div>
  );
}

// 空状态组件
export function EmptyState({ type = 'quests', onRetry, t }) {
  const emptyConfigs = {
    quests: {
      icon: <IconTarget size={38} color="#00e5ff" />,
      title: t ? t('empty.noQuests') : 'No Quests Available',
      description: t ? t('empty.noQuestsDesc') : 'Take a break and check back later',
    },
    rewards: {
      icon: <IconGift size={38} color="#ffc107" />,
      title: t ? t('empty.noRewards') : 'No Rewards Yet',
      description: t ? t('empty.noRewardsDesc') : 'Complete quests to earn rewards',
    },
    history: {
      icon: <IconHistory size={38} color="#bf5fff" />,
      title: t ? t('empty.noHistory') : 'No Transaction History',
      description: t ? t('empty.noHistoryDesc') : 'Your transactions will appear here',
    },
    search: {
      icon: <IconSearch size={38} color="#00e5ff" />,
      title: t ? t('empty.noResults') : 'No Results Found',
      description: t ? t('empty.noResultsDesc') : 'Try different search terms or filters',
    },
  };

  const config = emptyConfigs[type] || emptyConfigs.quests;

  const styles = {
    container: {
      textAlign: 'center',
      padding: '50px 28px',
      margin: '0 16px',
      background: 'linear-gradient(145deg, rgba(25, 25, 45, 0.95), rgba(18, 18, 38, 0.95))',
      borderRadius: 16,
      border: '1px solid rgba(0, 229, 255, 0.15)',
      position: 'relative',
      overflow: 'hidden',
    },
    glowOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 229, 255, 0.08) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
    iconWrapper: {
      width: 80,
      height: 80,
      margin: '0 auto 20px',
      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(191, 95, 255, 0.15))',
      borderRadius: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 38,
      boxShadow: '0 0 25px rgba(0, 229, 255, 0.15)',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      position: 'relative',
      zIndex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 8,
      position: 'relative',
      zIndex: 1,
    },
    description: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.5)',
      margin: 0,
      lineHeight: 1.5,
      position: 'relative',
      zIndex: 1,
    },
    retryButton: {
      marginTop: 24,
      padding: '12px 30px',
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: '#000',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
      transition: 'all 0.3s ease',
      position: 'relative',
      zIndex: 1,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.glowOverlay} />
      <div style={styles.iconWrapper}>
        {config.icon}
      </div>
      <h3 style={styles.title}>{config.title}</h3>
      <p style={styles.description}>{config.description}</p>
      {onRetry && (
        <button style={styles.retryButton} onClick={onRetry}>
          {t ? t('common.refresh') : 'Refresh'}
        </button>
      )}
    </div>
  );
}

// 错误状态组件
export function ErrorState({ error, onRetry, t }) {
  const errorConfigs = {
    network: {
      icon: <IconInfo size={38} color="#ff4da6" />,
      title: t ? t('error.network') : 'Network Error',
      description: t ? t('error.networkDesc') : 'Please check your connection and try again',
    },
    server: {
      icon: <IconInfo size={38} color="#ff4da6" />,
      title: t ? t('error.server') : 'Server Error',
      description: t ? t('error.serverDesc') : 'Our engineers are working on it',
    },
    timeout: {
      icon: <IconClock size={38} color="#ffc107" />,
      title: t ? t('error.timeout') : 'Request Timeout',
      description: t ? t('error.timeoutDesc') : 'Server took too long to respond',
    },
    unknown: {
      icon: <IconInfo size={38} color="#ff4da6" />,
      title: t ? t('error.unknown') : 'Something Went Wrong',
      description: t ? t('error.unknownDesc') : 'An unexpected error occurred',
    },
  };

  const getErrorType = () => {
    if (!error) return 'unknown';
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('network') || msg.includes('fetch')) return 'network';
    if (msg.includes('timeout')) return 'timeout';
    if (msg.includes('500') || msg.includes('server')) return 'server';
    return 'unknown';
  };

  const config = errorConfigs[getErrorType()];

  const styles = {
    container: {
      textAlign: 'center',
      padding: '50px 28px',
      margin: '0 16px',
      background: 'linear-gradient(145deg, rgba(25, 25, 45, 0.95), rgba(18, 18, 38, 0.95))',
      borderRadius: 16,
      border: '1px solid rgba(255, 77, 166, 0.2)',
      position: 'relative',
      overflow: 'hidden',
    },
    glowOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 77, 166, 0.08) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
    iconWrapper: {
      width: 80,
      height: 80,
      margin: '0 auto 20px',
      background: 'linear-gradient(135deg, rgba(255, 77, 166, 0.15), rgba(255, 193, 7, 0.15))',
      borderRadius: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 38,
      boxShadow: '0 0 25px rgba(255, 77, 166, 0.15)',
      border: '1px solid rgba(255, 77, 166, 0.2)',
      position: 'relative',
      zIndex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 8,
      position: 'relative',
      zIndex: 1,
    },
    description: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.5)',
      margin: 0,
      lineHeight: 1.5,
      marginBottom: 8,
      position: 'relative',
      zIndex: 1,
    },
    errorDetail: {
      fontSize: 10,
      fontFamily: "'Roboto Mono', monospace",
      color: '#ff4da6',
      margin: 0,
      padding: '8px 14px',
      backgroundColor: 'rgba(255, 77, 166, 0.1)',
      borderRadius: 6,
      display: 'inline-block',
      maxWidth: '100%',
      wordBreak: 'break-all',
      border: '1px solid rgba(255, 77, 166, 0.15)',
      position: 'relative',
      zIndex: 1,
    },
    retryButton: {
      marginTop: 24,
      padding: '12px 30px',
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: '#fff',
      background: 'linear-gradient(135deg, #ff4da6, #bf5fff)',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      boxShadow: '0 0 15px rgba(255, 77, 166, 0.3)',
      transition: 'all 0.3s ease',
      position: 'relative',
      zIndex: 1,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.glowOverlay} />
      <div style={styles.iconWrapper}>
        {config.icon}
      </div>
      <h3 style={styles.title}>{config.title}</h3>
      <p style={styles.description}>{config.description}</p>
      {error?.message && (
        <p style={styles.errorDetail}>{error.message}</p>
      )}
      {onRetry && (
        <button style={styles.retryButton} onClick={onRetry}>
          {t ? t('common.retry') : 'Retry'}
        </button>
      )}
    </div>
  );
}

// 离线提示条
export function OfflineBanner({ t }) {
  const styles = {
    banner: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #ff9500, #ff4da6)',
      color: '#fff',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 1,
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingTop: 'max(12px, env(safe-area-inset-top))',
      boxShadow: '0 4px 20px rgba(255, 149, 0, 0.4)',
    },
    icon: {
      fontSize: 16,
    },
  };

  return (
    <div style={styles.banner}>
      <IconInfo size={16} color="#fff" />
      <span>{t ? t('offline.message') : 'OFFLINE - Check Connection'}</span>
    </div>
  );
}
