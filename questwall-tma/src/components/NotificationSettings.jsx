import { useState, useEffect } from 'react';
import { IconCheck, IconDollar, IconQuest, IconGift, IconUsers } from './icons/CyberpunkIcons';

export function NotificationSettings({ token, onClose, t }) {
  const [prefs, setPrefs] = useState({
    questComplete: true,
    reward: true,
    newQuest: true,
    checkIn: true,
    invite: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/notification-prefs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPrefs(data.prefs);
      }
    } catch (error) {
      console.error('Failed to fetch notification prefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePref = async (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    setSaving(true);

    try {
      await fetch(`${API_BASE}/auth/notification-prefs`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });
    } catch (error) {
      console.error('Failed to update notification prefs:', error);
      // Revert on error
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  const notificationOptions = [
    { key: 'questComplete', icon: <IconCheck size={20} color="#39ff14" />, label: t ? t('notifications.questComplete') : 'Quest Complete', description: t ? t('notifications.questCompleteDesc') : 'Notify when quest is verified' },
    { key: 'reward', icon: <IconDollar size={20} color="#ffc107" />, label: t ? t('notifications.reward') : 'Reward Notification', description: t ? t('notifications.rewardDesc') : 'Notify when rewards are received' },
    { key: 'newQuest', icon: <IconQuest size={20} color="#00e5ff" />, label: t ? t('notifications.newQuest') : 'New Quest Alert', description: t ? t('notifications.newQuestDesc') : 'Notify when new quests are available' },
    { key: 'checkIn', icon: <IconGift size={20} color="#bf5fff" />, label: t ? t('notifications.checkIn') : 'Check-in Reminder', description: t ? t('notifications.checkInDesc') : 'Daily check-in reminder' },
    { key: 'invite', icon: <IconUsers size={20} color="#ff4da6" />, label: t ? t('notifications.invite') : 'Invite Success', description: t ? t('notifications.inviteDesc') : 'Notify when friends accept invite' },
  ];

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
    container: {
      background: 'linear-gradient(180deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
      borderRadius: '20px 20px 0 0',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      padding: '20px',
      paddingBottom: '100px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
      border: '1px solid rgba(191, 95, 255, 0.2)',
      borderBottom: 'none',
      position: 'relative',
    },
    glowEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(191, 95, 255, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingBottom: 18,
      borderBottom: '1px solid rgba(191, 95, 255, 0.2)',
      position: 'relative',
      zIndex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      textShadow: '0 0 15px rgba(191, 95, 255, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    closeButton: {
      background: 'rgba(191, 95, 255, 0.1)',
      border: '1px solid rgba(191, 95, 255, 0.3)',
      width: 36,
      height: 36,
      borderRadius: 10,
      fontSize: 20,
      color: 'rgba(255, 255, 255, 0.6)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    optionItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '18px 0',
      borderBottom: '1px solid rgba(191, 95, 255, 0.1)',
      position: 'relative',
      zIndex: 1,
    },
    optionIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(191, 95, 255, 0.15), rgba(0, 229, 255, 0.15))',
      border: '1px solid rgba(191, 95, 255, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      marginRight: 14,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
    },
    optionDescription: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.4)',
      margin: 0,
      marginTop: 4,
    },
    toggle: {
      width: 54,
      height: 30,
      borderRadius: 15,
      padding: 2,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    toggleOn: {
      background: 'linear-gradient(135deg, #39ff14, #00e5ff)',
      boxShadow: '0 0 15px rgba(57, 255, 20, 0.5)',
    },
    toggleOff: {
      backgroundColor: 'rgba(60, 60, 80, 0.8)',
      border: '1px solid rgba(191, 95, 255, 0.25)',
    },
    toggleKnob: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    toggleKnobOn: {
      transform: 'translateX(24px)',
    },
    toggleKnobOff: {
      transform: 'translateX(0)',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: 40,
      position: 'relative',
      zIndex: 1,
    },
    spinner: {
      width: 36,
      height: 36,
      border: '3px solid rgba(191, 95, 255, 0.2)',
      borderTopColor: '#bf5fff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px',
      boxShadow: '0 0 15px rgba(191, 95, 255, 0.3)',
    },
    loadingText: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontFamily: "'Orbitron', sans-serif",
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    savingIndicator: {
      position: 'fixed',
      top: 60,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      padding: '10px 20px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 1,
      zIndex: 2001,
      boxShadow: '0 0 20px rgba(0, 229, 255, 0.5)',
    },
  };

  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.container} onClick={e => e.stopPropagation()}>
          <div style={styles.glowEffect} />
          <div style={styles.header}>
            <h3 style={styles.title}>{t ? t('notifications.title') : 'Notifications'}</h3>
            <button style={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>{t ? t('common.loading') : 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      {saving && <div style={styles.savingIndicator}>{t ? t('common.saving') : 'Saving...'}</div>}
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        <div style={styles.glowEffect} />
        <div style={styles.header}>
          <h3 style={styles.title}>{t ? t('notifications.title') : 'Notifications'}</h3>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(191, 95, 255, 0.6)';
              e.currentTarget.style.color = '#bf5fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(191, 95, 255, 0.3)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
          >
            ×
          </button>
        </div>

        {notificationOptions.map((option, index) => (
          <div
            key={option.key}
            style={{
              ...styles.optionItem,
              borderBottom: index === notificationOptions.length - 1 ? 'none' : styles.optionItem.borderBottom,
            }}
          >
            <div style={styles.optionIcon}>{option.icon}</div>
            <div style={styles.optionContent}>
              <p style={styles.optionLabel}>{option.label}</p>
              <p style={styles.optionDescription}>{option.description}</p>
            </div>
            <div
              style={{
                ...styles.toggle,
                ...(prefs[option.key] ? styles.toggleOn : styles.toggleOff),
              }}
              onClick={() => updatePref(option.key, !prefs[option.key])}
            >
              <div
                style={{
                  ...styles.toggleKnob,
                  ...(prefs[option.key] ? styles.toggleKnobOn : styles.toggleKnobOff),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
