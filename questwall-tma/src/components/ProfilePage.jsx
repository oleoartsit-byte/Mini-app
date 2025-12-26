import { useState } from 'react';
import { NotificationSettings } from './NotificationSettings';
import { ThemeSelector } from './ThemeSelector';
import { IconTwitter, IconBell, IconGlobe, IconMedal, IconCheck, IconFire, IconUsers, IconArrowRight } from './icons/CyberpunkIcons';
import { calculateLevelInfo, getLevelTitle } from '../utils/levelUtils';

export function ProfilePage({
  user,
  authStatus,
  wallet,
  completedQuests,
  checkInData,
  inviteData,
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

  // 基于完成任务数计算等级
  const completedCount = completedQuests?.length || 0;
  const levelInfo = calculateLevelInfo(completedCount);
  const level = levelInfo.level;
  const levelProgress = levelInfo.expPercent;

  const getUserDisplayName = () => {
    if (user) {
      return user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
    return t ? t('user.guest') : '游客';
  };

  const getStatusInfo = () => {
    switch (authStatus) {
      case 'success': return { color: '#39ff14', text: t ? t('user.authSuccess') : '已验证' };
      case 'failed': return { color: '#ff4da6', text: t ? t('user.authFailed') : '验证失败' };
      case 'dev': return { color: '#ffc107', text: t ? t('user.devMode') : '开发模式' };
      default: return { color: 'rgba(255, 255, 255, 0.5)', text: t ? t('user.authPending') : '验证中...' };
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

  const menuItems = [
    {
      icon: <IconTwitter size={20} color="#1DA1F2" />,
      labelKey: 'profile.twitter',
      label: t ? t('profile.twitter') : 'Twitter 绑定',
      badge: twitterBound ? `@${twitterUsername}` : (t ? t('profile.notBound') : '未绑定'),
      badgeColor: twitterBound ? '#1DA1F2' : null,
      action: onTwitterBind
    },
    {
      icon: <IconBell size={20} color="#ffc107" />,
      labelKey: 'notifications.title',
      label: t ? t('notifications.title') : '通知设置',
      badge: null,
      action: () => setShowNotificationSettings(true)
    },
    {
      icon: <IconGlobe size={20} color="#00e5ff" />,
      labelKey: 'profile.language',
      label: t ? t('profile.language') : '语言',
      badge: getCurrentLocaleName(),
      action: () => setShowLanguageSelector(true)
    },
  ];

  const styles = {
    container: {
      padding: '0 16px',
    },
    profileCard: {
      background: 'linear-gradient(145deg, rgba(25, 25, 45, 0.95), rgba(18, 18, 38, 0.95))',
      borderRadius: 20,
      padding: '24px 20px',
      marginBottom: 16,
      textAlign: 'center',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
    },
    profileGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 229, 255, 0.1) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 24,
      background: 'linear-gradient(135deg, #00e5ff 0%, #bf5fff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#000',
      fontSize: 32,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      margin: '0 auto 16px',
      boxShadow: '0 8px 24px rgba(0, 229, 255, 0.4)',
      position: 'relative',
      zIndex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 8,
      textShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
      position: 'relative',
      zIndex: 1,
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: statusInfo.color,
      backgroundColor: `${statusInfo.color}20`,
      border: `1px solid ${statusInfo.color}40`,
      marginBottom: 16,
      position: 'relative',
      zIndex: 1,
    },
    levelSection: {
      marginTop: 16,
      padding: '16px',
      background: 'rgba(0, 229, 255, 0.05)',
      borderRadius: 14,
      border: '1px solid rgba(0, 229, 255, 0.15)',
      position: 'relative',
      zIndex: 1,
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
      fontFamily: "'Orbitron', sans-serif",
      color: '#ffc107',
      textShadow: '0 0 10px rgba(255, 193, 7, 0.4)',
    },
    levelTitle: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#bf5fff',
      marginLeft: 4,
    },
    levelPoints: {
      fontSize: 12,
      fontFamily: "'Roboto Mono', monospace",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    progressBar: {
      height: 8,
      backgroundColor: 'rgba(0, 229, 255, 0.1)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #00e5ff 0%, #bf5fff 100%)',
      borderRadius: 4,
      transition: 'width 0.5s ease',
      boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      background: 'linear-gradient(165deg, #191932 0%, #0f0f23 100%)',
      borderRadius: 16,
      padding: '16px 12px',
      textAlign: 'center',
      border: '1px solid rgba(0, 229, 255, 0.25)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden',
    },
    statIcon: {
      fontSize: 24,
      marginBottom: 8,
      filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.3))',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#00e5ff',
      margin: 0,
      textShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
    },
    statLabel: {
      fontSize: 11,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    menuCard: {
      backgroundColor: '#0f0f23',
      background: 'linear-gradient(165deg, #191932 0%, #0f0f23 100%)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.25)',
      marginBottom: 16,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      zIndex: 10,
      isolation: 'isolate',
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: '1px solid rgba(0, 229, 255, 0.1)',
      cursor: 'pointer',
      backgroundColor: 'inherit',
    },
    menuIcon: {
      fontSize: 20,
      marginRight: 14,
    },
    menuLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
    },
    menuBadge: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      marginRight: 8,
    },
    menuArrow: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.3)',
    },
    // 语言选择弹窗
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
    modal: {
      background: 'linear-gradient(180deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
      borderRadius: '20px 20px 0 0',
      padding: '20px',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 20px))',
      width: '100%',
      maxHeight: '60vh',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderBottom: 'none',
    },
    modalHandle: {
      width: 40,
      height: 4,
      background: 'linear-gradient(90deg, #00e5ff, #bf5fff)',
      borderRadius: 2,
      margin: '0 auto 16px',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 16,
      textAlign: 'center',
      textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
    },
    languageOption: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: 'rgba(0, 229, 255, 0.05)',
      border: '1px solid rgba(0, 229, 255, 0.15)',
      borderRadius: 12,
      marginBottom: 8,
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
    },
    languageOptionActive: {
      background: 'rgba(0, 229, 255, 0.15)',
      border: '1px solid rgba(0, 229, 255, 0.4)',
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
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
    },
    checkmark: {
      fontSize: 18,
      color: '#00e5ff',
      textShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
    },
  };

  return (
    <div style={styles.container}>
      {/* 用户资料卡片 */}
      <div style={styles.profileCard}>
        <div style={styles.profileGlow} />
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
              <IconMedal size={16} color="#ffc107" />
              <span>Lv.{level}</span>
              <span style={styles.levelTitle}>{getLevelTitle(level, t)}</span>
            </div>
            <span style={styles.levelPoints}>{levelInfo.currentExp}/{levelInfo.nextLevelExp}</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${levelProgress}%` }} />
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><IconCheck size={24} color="#39ff14" /></div>
          <p style={styles.statValue}>{completedQuests?.length || 0}</p>
          <p style={styles.statLabel}>{t ? t('profile.completedQuests') : '完成任务'}</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><IconFire size={24} color="#ff6b35" /></div>
          <p style={styles.statValue}>{checkInData?.totalCheckIns || 0}</p>
          <p style={styles.statLabel}>{t ? t('profile.checkInDays') : '签到天数'}</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><IconUsers size={24} color="#bf5fff" /></div>
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
            <IconArrowRight size={16} color="rgba(255, 255, 255, 0.3)" />
          </div>
        ))}
      </div>

      {/* 通知设置弹窗 */}
      {showNotificationSettings && (
        <NotificationSettings
          token={token}
          onClose={() => setShowNotificationSettings(false)}
          t={t}
        />
      )}

      {/* 主题选择器 - 已移除，统一使用赛博朋克风格 */}
      {showThemeSelector && (
        <ThemeSelector
          onClose={() => setShowThemeSelector(false)}
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
                {lang.code === locale && <IconCheck size={18} color="#00e5ff" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
