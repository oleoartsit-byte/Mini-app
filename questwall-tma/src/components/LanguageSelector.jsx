import { useState } from 'react';
import { IconGlobe, IconCheck } from './icons/CyberpunkIcons';

export function LanguageSelector({ locale, setLocale, locales, t }) {
  const [showOptions, setShowOptions] = useState(false);

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  const styles = {
    container: {
      margin: '0 16px 16px',
    },
    card: {
      background: 'linear-gradient(145deg, rgba(25, 25, 45, 0.95), rgba(18, 18, 38, 0.95))',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.15)',
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
      background: 'linear-gradient(135deg, #00e5ff 0%, #bf5fff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      boxShadow: '0 4px 12px rgba(0, 229, 255, 0.3)',
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.5)',
      margin: 0,
      marginTop: 2,
    },
    arrow: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.4)',
      transition: 'transform 0.3s ease',
      transform: showOptions ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    options: {
      borderTop: '1px solid rgba(0, 229, 255, 0.1)',
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
      backgroundColor: 'rgba(0, 229, 255, 0.1)',
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
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
    },
    checkmark: {
      fontSize: 16,
      color: '#00e5ff',
      textShadow: '0 0 8px rgba(0, 229, 255, 0.5)',
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
            <div style={styles.icon}><IconGlobe size={20} color="#fff" /></div>
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
              {item.code === locale && <span style={styles.checkmark}><IconCheck size={16} color="#00e5ff" /></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguageSelector;
