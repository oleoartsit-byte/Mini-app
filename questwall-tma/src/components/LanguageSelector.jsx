import React, { useState } from 'react';

export function LanguageSelector({ locale, setLocale, locales, theme, t }) {
  const [showOptions, setShowOptions] = useState(false);

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  const styles = {
    container: {
      margin: '0 16px 16px',
    },
    card: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      cursor: 'pointer',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      margin: 0,
    },
    subtitle: {
      fontSize: 13,
      color: theme.hint,
      margin: 0,
      marginTop: 2,
    },
    arrow: {
      fontSize: 14,
      color: theme.hint,
      transition: 'transform 0.2s ease',
      transform: showOptions ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    options: {
      borderTop: `1px solid ${theme.secondaryBg}`,
      overflow: 'hidden',
      maxHeight: showOptions ? '200px' : '0',
      transition: 'max-height 0.3s ease',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      transition: 'background-color 0.2s ease',
    },
    optionActive: {
      backgroundColor: theme.secondaryBg,
    },
    optionLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    optionFlag: {
      fontSize: 24,
    },
    optionName: {
      fontSize: 15,
      color: theme.text,
    },
    checkmark: {
      fontSize: 16,
      color: '#34c759',
    },
  };

  const handleSelect = (code) => {
    setLocale(code);
    setShowOptions(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header} onClick={() => setShowOptions(!showOptions)}>
          <div style={styles.headerLeft}>
            <div style={styles.icon}>🌐</div>
            <div>
              <p style={styles.title}>{t('profile.language')}</p>
              <p style={styles.subtitle}>{currentLocale.flag} {currentLocale.name}</p>
            </div>
          </div>
          <span style={styles.arrow}>▼</span>
        </div>

        <div style={styles.options}>
          {locales.map((item) => (
            <button
              key={item.code}
              style={{
                ...styles.option,
                ...(item.code === locale ? styles.optionActive : {}),
              }}
              onClick={() => handleSelect(item.code)}
            >
              <div style={styles.optionLeft}>
                <span style={styles.optionFlag}>{item.flag}</span>
                <span style={styles.optionName}>{item.name}</span>
              </div>
              {item.code === locale && <span style={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguageSelector;
