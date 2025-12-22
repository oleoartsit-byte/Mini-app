import React, { useState, useEffect } from 'react';

export function NotificationSettings({ theme, token, onClose }) {
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
    { key: 'questComplete', icon: '✅', label: '任务完成通知', description: '任务验证通过时推送通知' },
    { key: 'reward', icon: '💰', label: '奖励发放通知', description: '奖励到账时推送通知' },
    { key: 'newQuest', icon: '🆕', label: '新任务通知', description: '有新任务上线时推送通知' },
    { key: 'checkIn', icon: '📅', label: '签到提醒', description: '每日签到提醒' },
    { key: 'invite', icon: '👥', label: '邀请成功通知', description: '好友接受邀请时推送通知' },
  ];

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
      zIndex: 1000,
    },
    container: {
      backgroundColor: theme.bg,
      borderRadius: '20px 20px 0 0',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      padding: '20px',
      paddingBottom: '40px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottom: `1px solid ${theme.secondaryBg}`,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: 24,
      color: theme.hint,
      cursor: 'pointer',
      padding: 0,
    },
    optionItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: `1px solid ${theme.secondaryBg}`,
    },
    optionIcon: {
      fontSize: 24,
      marginRight: 14,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      margin: 0,
    },
    optionDescription: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
      marginTop: 4,
    },
    toggle: {
      width: 50,
      height: 30,
      borderRadius: 15,
      padding: 2,
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    toggleOn: {
      backgroundColor: '#34c759',
    },
    toggleOff: {
      backgroundColor: theme.secondaryBg,
    },
    toggleKnob: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transition: 'transform 0.3s',
    },
    toggleKnobOn: {
      transform: 'translateX(20px)',
    },
    toggleKnobOff: {
      transform: 'translateX(0)',
    },
    loadingText: {
      textAlign: 'center',
      color: theme.hint,
      padding: 40,
    },
    savingIndicator: {
      position: 'fixed',
      top: 60,
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: 20,
      fontSize: 13,
      zIndex: 1001,
    },
  };

  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.container} onClick={e => e.stopPropagation()}>
          <div style={styles.header}>
            <h3 style={styles.title}>通知设置</h3>
            <button style={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <p style={styles.loadingText}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      {saving && <div style={styles.savingIndicator}>保存中...</div>}
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>通知设置</h3>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {notificationOptions.map((option, index) => (
          <div
            key={option.key}
            style={{
              ...styles.optionItem,
              borderBottom: index === notificationOptions.length - 1 ? 'none' : styles.optionItem.borderBottom,
            }}
          >
            <span style={styles.optionIcon}>{option.icon}</span>
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
