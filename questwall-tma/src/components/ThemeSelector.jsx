// ThemeSelector - 保留组件但简化，因为已统一使用赛博朋克风格
// 此组件现在主要用于向后兼容，实际主题已固定

import { IconQuest } from './icons/CyberpunkIcons';

export function ThemeSelector({ onClose, t }) {
  const styles = {
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
    content: {
      background: 'linear-gradient(180deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
      borderRadius: '20px 20px 0 0',
      padding: '20px',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 20px))',
      width: '100%',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderBottom: 'none',
    },
    handle: {
      width: 40,
      height: 4,
      background: 'linear-gradient(90deg, #00e5ff, #bf5fff)',
      borderRadius: 2,
      margin: '0 auto 16px',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 16,
      textAlign: 'center',
      textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
    },
    infoBox: {
      background: 'rgba(0, 229, 255, 0.1)',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoIcon: {
      fontSize: 32,
      textAlign: 'center',
      marginBottom: 8,
      filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.5))',
    },
    infoText: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      margin: 0,
      lineHeight: 1.5,
    },
    closeButton: {
      width: '100%',
      padding: '14px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={e => e.stopPropagation()}>
        <div style={styles.handle} />
        <h3 style={styles.title}>{t ? t('theme.title') : '主题设置'}</h3>

        <div style={styles.infoBox}>
          <div style={styles.infoIcon}><IconQuest size={32} color="#00e5ff" /></div>
          <p style={styles.infoText}>
            {t ? t('theme.cyberpunkFixed') : '当前使用赛博朋克主题，为您提供最佳的游戏体验。'}
          </p>
        </div>

        <button style={styles.closeButton} onClick={onClose}>
          {t ? t('common.close') : '关闭'}
        </button>
      </div>
    </div>
  );
}
