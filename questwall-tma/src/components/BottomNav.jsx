import { IconHome, IconQuest, IconTutorial, IconRewards, IconProfile } from './icons/CyberpunkIcons';

export function BottomNav({ activeTab, onTabChange, t }) {
  const tabs = [
    { id: 'home', Icon: IconHome, labelKey: 'nav.home' },
    { id: 'quests', Icon: IconQuest, labelKey: 'nav.quests' },
    { id: 'tutorials', Icon: IconTutorial, labelKey: 'nav.tutorials' },
    { id: 'rewards', Icon: IconRewards, labelKey: 'nav.rewards' },
    { id: 'profile', Icon: IconProfile, labelKey: 'nav.profile' },
  ];

  const styles = {
    nav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(12, 12, 25, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(100, 100, 255, 0.15)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 10px',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      zIndex: 1000,
    },
    tab: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '6px 14px',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      backgroundColor: 'transparent',
      position: 'relative',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      outline: 'none',
      boxShadow: 'none',
      WebkitAppearance: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    iconWrapperActive: {
      transform: 'scale(1.15)',
    },
    label: {
      fontSize: 9,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255,255,255,0.4)',
      margin: 0,
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    labelActive: {
      color: '#00e5ff',
      textShadow: '0 0 8px rgba(0, 229, 255, 0.5)',
    },
    // 顶部发光指示条
    indicator: {
      position: 'absolute',
      top: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 30,
      height: 3,
      borderRadius: '0 0 2px 2px',
      background: 'linear-gradient(90deg, #00e5ff, #bf5fff)',
      boxShadow: '0 0 10px rgba(0, 229, 255, 0.8), 0 0 20px rgba(0, 229, 255, 0.4)',
    },
  };

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.Icon;
        return (
          <div
            key={tab.id}
            style={styles.tab}
            onClick={() => onTabChange(tab.id)}
          >
            {/* 顶部发光指示条 - 只在选中时显示 */}
            {isActive && <div style={styles.indicator} />}

            <div style={{
              ...styles.iconWrapper,
              ...(isActive ? styles.iconWrapperActive : {}),
            }}>
              <IconComponent
                size={22}
                color={isActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.4)'}
                active={isActive}
              />
            </div>
            <span style={{
              ...styles.label,
              ...(isActive ? styles.labelActive : {}),
            }}>
              {t ? t(tab.labelKey) : tab.id}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
