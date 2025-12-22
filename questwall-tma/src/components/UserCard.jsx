export function UserCard({ user, authStatus, theme, t }) {
  const getUserDisplayName = () => {
    if (user) {
      return user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
    return t ? t('user.guest') : '游客';
  };

  const getStatusInfo = () => {
    switch (authStatus) {
      case 'success': return { color: '#34c759', bg: 'rgba(52, 199, 89, 0.1)', text: t ? t('user.authSuccess') : '已验证', icon: '✓' };
      case 'failed': return { color: '#ff3b30', bg: 'rgba(255, 59, 48, 0.1)', text: t ? t('user.authFailed') : '验证失败', icon: '✗' };
      case 'dev': return { color: '#ff9500', bg: 'rgba(255, 149, 0, 0.1)', text: t ? t('user.devMode') : '开发模式', icon: '⚡' };
      default: return { color: '#8e8e93', bg: 'rgba(142, 142, 147, 0.1)', text: t ? t('user.authPending') : '验证中...', icon: '◌' };
    }
  };

  const statusInfo = getStatusInfo();

  const styles = {
    section: {
      backgroundColor: theme.bg,
      margin: '-24px 16px 16px',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      position: 'relative',
      zIndex: 10,
    },
    card: {
      padding: '18px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 22,
      fontWeight: '700',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
      padding: '4px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: '600',
      color: statusInfo.color,
      backgroundColor: statusInfo.bg,
    },
  };

  return (
    <div style={styles.section}>
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user?.first_name?.[0]?.toUpperCase() || 'G'}
        </div>
        <div style={styles.cardContent}>
          <p style={styles.cardTitle}>{getUserDisplayName()}</p>
          <div style={styles.statusBadge}>
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
