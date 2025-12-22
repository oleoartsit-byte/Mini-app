import React from 'react';

export function Loading({ theme }) {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    spinner: {
      width: 24,
      height: 24,
      border: `3px solid ${theme.secondaryBg}`,
      borderTopColor: theme.button,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
    </div>
  );
}

// 美化版空状态组件
export function EmptyState({ theme, type = 'quests', onRetry, t }) {
  const emptyConfigs = {
    quests: {
      icon: '🎯',
      title: t ? t('empty.noQuests') : '暂无可用任务',
      description: t ? t('empty.noQuestsDesc') : '休息一下，稍后再来看看吧',
    },
    rewards: {
      icon: '🎁',
      title: t ? t('empty.noRewards') : '还没有奖励记录',
      description: t ? t('empty.noRewardsDesc') : '完成任务即可获得奖励',
    },
    history: {
      icon: '📜',
      title: t ? t('empty.noHistory') : '暂无交易记录',
      description: t ? t('empty.noHistoryDesc') : '您的交易记录将显示在这里',
    },
    search: {
      icon: '🔍',
      title: t ? t('empty.noResults') : '未找到相关任务',
      description: t ? t('empty.noResultsDesc') : '试试其他搜索词或筛选条件',
    },
  };

  const config = emptyConfigs[type] || emptyConfigs.quests;

  const styles = {
    container: {
      textAlign: 'center',
      padding: '60px 32px',
      margin: '0 16px',
      backgroundColor: theme.bg,
      borderRadius: 20,
      border: `1px solid ${theme.secondaryBg}`,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      margin: '0 auto 20px',
      background: `linear-gradient(135deg, ${theme.secondaryBg} 0%, ${theme.bg} 100%)`,
      borderRadius: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 40,
      boxShadow: `0 8px 24px ${theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: theme.hint,
      margin: 0,
      lineHeight: 1.5,
    },
    retryButton: {
      marginTop: 24,
      padding: '12px 32px',
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: 12,
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        {config.icon}
      </div>
      <h3 style={styles.title}>{config.title}</h3>
      <p style={styles.description}>{config.description}</p>
      {onRetry && (
        <button style={styles.retryButton} onClick={onRetry}>
          {t ? t('common.refresh') : '重新加载'}
        </button>
      )}
    </div>
  );
}

// 网络错误/加载失败组件
export function ErrorState({ theme, error, onRetry, t }) {
  const errorConfigs = {
    network: {
      icon: '📡',
      title: t ? t('error.network') : '网络连接失败',
      description: t ? t('error.networkDesc') : '请检查网络连接后重试',
    },
    server: {
      icon: '🔧',
      title: t ? t('error.server') : '服务器开小差了',
      description: t ? t('error.serverDesc') : '工程师正在紧急修复中',
    },
    timeout: {
      icon: '⏱️',
      title: t ? t('error.timeout') : '请求超时',
      description: t ? t('error.timeoutDesc') : '服务器响应时间过长，请稍后重试',
    },
    unknown: {
      icon: '😵',
      title: t ? t('error.unknown') : '出错了',
      description: t ? t('error.unknownDesc') : '发生了未知错误，请稍后重试',
    },
  };

  // 根据错误类型选择配置
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
      padding: '60px 32px',
      margin: '0 16px',
      backgroundColor: theme.bg,
      borderRadius: 20,
      border: `1px solid ${theme.secondaryBg}`,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      margin: '0 auto 20px',
      background: `linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 149, 0, 0.1) 100%)`,
      borderRadius: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 40,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: theme.hint,
      margin: 0,
      lineHeight: 1.5,
      marginBottom: 8,
    },
    errorDetail: {
      fontSize: 12,
      color: theme.hint,
      opacity: 0.7,
      margin: 0,
      padding: '8px 16px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 8,
      display: 'inline-block',
      maxWidth: '100%',
      wordBreak: 'break-all',
    },
    retryButton: {
      marginTop: 24,
      padding: '12px 32px',
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff9500 100%)',
      border: 'none',
      borderRadius: 12,
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    },
  };

  return (
    <div style={styles.container}>
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
          {t ? t('common.retry') : '重试'}
        </button>
      )}
    </div>
  );
}

// 离线状态提示条
export function OfflineBanner({ theme, t }) {
  const styles = {
    banner: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '12px 16px',
      backgroundColor: '#ff9500',
      color: '#fff',
      textAlign: 'center',
      fontSize: 13,
      fontWeight: '600',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingTop: 'max(12px, env(safe-area-inset-top))',
    },
    icon: {
      fontSize: 16,
    },
  };

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>📡</span>
      <span>{t ? t('offline.message') : '网络已断开，请检查连接'}</span>
    </div>
  );
}
