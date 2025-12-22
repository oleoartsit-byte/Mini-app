import React from 'react';

const THEME_OPTIONS = [
  { key: 'system', label: '跟随系统', icon: '📱' },
  { key: 'light', label: '浅色', icon: '☀️' },
  { key: 'dark', label: '深色', icon: '🌙' },
];

export function ThemeSelector({ currentTheme, onThemeChange, onClose, theme }) {
  const styles = {
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
    content: {
      backgroundColor: theme.bg,
      borderRadius: '16px 16px 0 0',
      padding: '20px',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 20px))',
      width: '100%',
      animation: 'slideUp 0.3s ease-out',
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: theme.hint,
      borderRadius: 2,
      margin: '0 auto 16px',
      opacity: 0.3,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      marginBottom: 16,
      textAlign: 'center',
    },
    optionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderRadius: 12,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    optionActive: {
      backgroundColor: `${theme.link}15`,
      border: `2px solid ${theme.link}`,
    },
    optionInactive: {
      backgroundColor: theme.secondaryBg,
      border: '2px solid transparent',
    },
    optionIcon: {
      fontSize: 24,
      marginRight: 14,
    },
    optionLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    checkmark: {
      fontSize: 20,
      color: theme.link,
    },
    keyframes: `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.content} onClick={e => e.stopPropagation()}>
          <div style={styles.handle} />
          <h3 style={styles.title}>选择主题</h3>
          <div style={styles.optionList}>
            {THEME_OPTIONS.map(option => (
              <div
                key={option.key}
                style={{
                  ...styles.option,
                  ...(currentTheme === option.key ? styles.optionActive : styles.optionInactive),
                }}
                onClick={() => {
                  onThemeChange(option.key);
                  onClose();
                }}
              >
                <span style={styles.optionIcon}>{option.icon}</span>
                <span style={styles.optionLabel}>{option.label}</span>
                {currentTheme === option.key && (
                  <span style={styles.checkmark}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
