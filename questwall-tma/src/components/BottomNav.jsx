import React from 'react';

export function BottomNav({ activeTab, onTabChange, theme, t }) {
  const tabs = [
    { id: 'home', icon: '🏠', activeIcon: '🏠', labelKey: 'nav.home' },
    { id: 'quests', icon: '🎯', activeIcon: '🎯', labelKey: 'nav.quests' },
    { id: 'rewards', icon: '🎁', activeIcon: '🎁', labelKey: 'nav.rewards' },
    { id: 'profile', icon: '👤', activeIcon: '👤', labelKey: 'nav.profile' },
  ];

  const styles = {
    nav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.isDark ? 'rgba(28, 28, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderTop: `1px solid ${theme.secondaryBg}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0',
      // 底部安全区域适配 (iPhone X 等)
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      // 左右安全区域适配 (横屏时)
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    },
    tab: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '8px 16px',
      cursor: 'pointer',
      borderRadius: 12,
      transition: 'all 0.2s ease',
      border: 'none',
      background: 'transparent',
      position: 'relative',
    },
    tabActive: {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    },
    icon: {
      fontSize: 22,
      transition: 'transform 0.2s ease',
    },
    iconActive: {
      transform: 'scale(1.1)',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.hint,
      margin: 0,
      transition: 'color 0.2s ease',
    },
    labelActive: {
      color: theme.bg !== '#ffffff' ? '#7d8aff' : '#667eea',
      fontWeight: '700',
    },
    indicator: {
      position: 'absolute',
      top: 2,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  };

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(isActive ? styles.tabActive : {}),
            }}
            onClick={() => onTabChange(tab.id)}
          >
            {isActive && <div style={styles.indicator} />}
            <span style={{
              ...styles.icon,
              ...(isActive ? styles.iconActive : {}),
            }}>
              {isActive ? tab.activeIcon : tab.icon}
            </span>
            <span style={{
              ...styles.label,
              ...(isActive ? styles.labelActive : {}),
            }}>
              {t ? t(tab.labelKey) : tab.id}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
