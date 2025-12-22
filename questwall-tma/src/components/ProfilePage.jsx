import React, { useState } from 'react';
import { NotificationSettings } from './NotificationSettings';
import { ThemeSelector } from './ThemeSelector';

export function ProfilePage({
  user,
  authStatus,
  wallet,
  completedQuests,
  checkInData,
  inviteData,
  theme,
  token,
  // 多语言相关
  t,
  locale,
  setLocale,
  supportedLocales,
  // Twitter 绑定
  onTwitterBind,
  twitterBound,
  twitterUsername,
}) {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const balances = wallet?.balances || { stars: 0, ton: 0, usdt: 0, points: 0 };

  // 计算等级（每100积分升1级）
  const totalPoints = Math.floor(
    (balances.stars || 0) * 1 +
    (balances.ton || 0) * 100 +
    (balances.usdt || 0) * 10 +
    (balances.points || 0) * 1
  );
  const level = Math.floor(totalPoints / 100) + 1;
  const levelProgress = (totalPoints % 100);

  const getUserDisplayName = () => {
    if (user) {
      return user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
    return t ? t('user.guest') : '游客';
  };

  const getStatusInfo = () => {
    switch (authStatus) {
      case 'success': return { color: '#34c759', text: t ? t('user.authSuccess') : '已验证' };
      case 'failed': return { color: '#ff3b30', text: t ? t('user.authFailed') : '验证失败' };
      case 'dev': return { color: '#ff9500', text: t ? t('user.devMode') : '开发模式' };
      default: return { color: '#8e8e93', text: t ? t('user.authPending') : '验证中...' };
    }
  };

  const statusInfo = getStatusInfo();

  // 获取当前语言名称
  const getCurrentLocaleName = () => {
    if (supportedLocales && locale) {
      const current = supportedLocales.find(l => l.code === locale);
      return current ? `${current.flag} ${current.name}` : '简体中文';
    }
    return '简体中文';
  };

  // 获取主题名称
  const getThemeName = () => {
    if (t) {
      switch (theme.themeMode) {
        case 'light': return t('theme.light');
        case 'dark': return t('theme.dark');
        default: return t('theme.system');
      }
    }
    return theme.themeMode === 'light' ? '浅色' : theme.themeMode === 'dark' ? '深色' : '跟随系统';
  };

  const menuItems = [
    {
      icon: '🐦',
      labelKey: 'profile.twitter',
      label: t ? t('profile.twitter') : 'Twitter 绑定',
      badge: twitterBound ? `@${twitterUsername}` : (t ? t('profile.notBound') : '未绑定'),
      badgeColor: twitterBound ? '#1DA1F2' : null,
      action: onTwitterBind
    },
    {
      icon: '🔔',
      labelKey: 'notifications.title',
      label: t ? t('notifications.title') : '通知设置',
      badge: null,
      action: () => setShowNotificationSettings(true)
    },
    {
      icon: '🌐',
      labelKey: 'profile.language',
      label: t ? t('profile.language') : '语言',
      badge: getCurrentLocaleName(),
      action: () => setShowLanguageSelector(true)
    },
    {
      icon: '🎨',
      labelKey: 'profile.theme',
      label: t ? t('profile.theme') : '主题',
      badge: getThemeName(),
      action: () => setShowThemeSelector(true)
    },
  ];

  const styles = {
    container: {
      padding: '0 16px',
    },
    profileCard: {
      backgroundColor: theme.bg,
      borderRadius: 20,
      padding: '24px 20px',
      marginBottom: 16,
      textAlign: 'center',
      border: `1px solid ${theme.secondaryBg}`,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 24,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 32,
      fontWeight: '700',
      margin: '0 auto 16px',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
    },
    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      marginBottom: 8,
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 20,
      fontSize: 13,
      fontWeight: '600',
      color: statusInfo.color,
      backgroundColor: `${statusInfo.color}15`,
      marginBottom: 16,
    },
    levelSection: {
      marginTop: 16,
      padding: '16px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 14,
    },
    levelHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    levelBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      fontWeight: '700',
      color: theme.bg !== '#ffffff' ? '#7d8aff' : '#667eea',
    },
    levelPoints: {
      fontSize: 12,
      color: theme.hint,
    },
    progressBar: {
      height: 8,
      backgroundColor: `${theme.hint}30`,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 4,
      transition: 'width 0.5s ease',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      padding: '16px 12px',
      textAlign: 'center',
      border: `1px solid ${theme.secondaryBg}`,
    },
    statIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
    },
    statLabel: {
      fontSize: 11,
      color: theme.hint,
      margin: 0,
      marginTop: 4,
    },
    menuCard: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${theme.secondaryBg}`,
      marginBottom: 16,
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: `1px solid ${theme.secondaryBg}`,
      cursor: 'pointer',
    },
    menuIcon: {
      fontSize: 20,
      marginRight: 14,
    },
    menuLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
      margin: 0,
    },
    menuBadge: {
      fontSize: 13,
      color: theme.hint,
      marginRight: 8,
    },
    menuArrow: {
      fontSize: 14,
      color: theme.hint,
    },
    logoutButton: {
      width: '100%',
      padding: '14px',
      fontSize: 15,
      fontWeight: '600',
      borderRadius: 14,
      border: `1px solid ${theme.danger || '#ff3b30'}`,
      background: 'transparent',
      color: theme.danger || '#ff3b30',
      cursor: 'pointer',
      marginBottom: 20,
    },
    // 语言选择弹窗
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
    },
    modal: {
      backgroundColor: theme.bg,
      borderRadius: '20px 20px 0 0',
      padding: '20px',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 20px))',
      width: '100%',
      maxHeight: '60vh',
      animation: 'slideUp 0.3s ease-out',
    },
    modalHandle: {
      width: 36,
      height: 4,
      backgroundColor: theme.hint,
      borderRadius: 2,
      margin: '0 auto 16px',
      opacity: 0.3,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      marginBottom: 16,
      textAlign: 'center',
    },
    languageOption: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 12,
      marginBottom: 8,
      cursor: 'pointer',
      border: 'none',
      width: '100%',
      textAlign: 'left',
    },
    languageOptionActive: {
      backgroundColor: 'rgba(102, 126, 234, 0.15)',
      border: '1px solid #667eea',
    },
    languageInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    languageFlag: {
      fontSize: 24,
    },
    languageName: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
    },
    checkmark: {
      fontSize: 18,
      color: '#667eea',
    },
  };

  return (
    <div style={styles.container}>
      {/* 用户资料卡片 */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {user?.first_name?.[0]?.toUpperCase() || 'G'}
        </div>
        <h2 style={styles.userName}>{getUserDisplayName()}</h2>
        <div style={styles.statusBadge}>
          <span>{statusInfo.text}</span>
        </div>

        {/* 等级进度 */}
        <div style={styles.levelSection}>
          <div style={styles.levelHeader}>
            <div style={styles.levelBadge}>
              <span>🏅</span>
              <span>Lv.{level}</span>
            </div>
            <span style={styles.levelPoints}>{levelProgress}/100</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${levelProgress}%` }} />
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <p style={styles.statValue}>{completedQuests?.length || 0}</p>
          <p style={styles.statLabel}>{t ? t('profile.completedQuests') : '完成任务'}</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔥</div>
          <p style={styles.statValue}>{checkInData?.streak || 0}</p>
          <p style={styles.statLabel}>{t ? t('profile.checkInDays') : '连续签到'}</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <p style={styles.statValue}>{inviteData?.inviteCount || 0}</p>
          <p style={styles.statLabel}>{t ? t('profile.invitedFriends') : '邀请好友'}</p>
        </div>
      </div>

      {/* 菜单列表 */}
      <div style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <div
            key={item.labelKey}
            style={{
              ...styles.menuItem,
              borderBottom: index === menuItems.length - 1 ? 'none' : styles.menuItem.borderBottom,
            }}
            onClick={item.action}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            <span style={styles.menuLabel}>{item.label}</span>
            {item.badge && <span style={{...styles.menuBadge, color: item.badgeColor || styles.menuBadge.color}}>{item.badge}</span>}
            <span style={styles.menuArrow}>›</span>
          </div>
        ))}
      </div>

      {/* 通知设置弹窗 */}
      {showNotificationSettings && (
        <NotificationSettings
          theme={theme}
          token={token}
          onClose={() => setShowNotificationSettings(false)}
          t={t}
        />
      )}

      {/* 主题选择器 */}
      {showThemeSelector && (
        <ThemeSelector
          currentTheme={theme.themeMode}
          onThemeChange={theme.setThemeMode}
          onClose={() => setShowThemeSelector(false)}
          theme={theme}
          t={t}
        />
      )}

      {/* 语言选择弹窗 */}
      {showLanguageSelector && (
        <div style={styles.overlay} onClick={() => setShowLanguageSelector(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHandle} />
            <h3 style={styles.modalTitle}>{t ? t('language.title') : '语言设置'}</h3>

            {supportedLocales && supportedLocales.map(lang => (
              <button
                key={lang.code}
                style={{
                  ...styles.languageOption,
                  ...(lang.code === locale ? styles.languageOptionActive : {}),
                }}
                onClick={() => {
                  setLocale(lang.code);
                  setShowLanguageSelector(false);
                }}
              >
                <div style={styles.languageInfo}>
                  <span style={styles.languageFlag}>{lang.flag}</span>
                  <span style={styles.languageName}>{lang.name}</span>
                </div>
                {lang.code === locale && <span style={styles.checkmark}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
