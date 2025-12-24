import { useState } from 'react';
import { IconGift, IconCheck } from './icons/CyberpunkIcons';

// 默认签到奖励配置（积分）
const DEFAULT_DAILY_REWARDS = [10, 20, 30, 40, 50, 60, 100];
const DEFAULT_MAKEUP_COST = 20;
const MAX_MAKEUP_DAYS = 7;

export function CheckInCard({ checkInData, onCheckIn, onMakeup, t }) {
  const { lastCheckIn, streak, todayChecked, checkInHistory = [], config } = checkInData;
  const [showMakeup, setShowMakeup] = useState(false);

  const dailyRewards = config?.dailyRewards || DEFAULT_DAILY_REWARDS;
  const makeupCost = config?.makeupCost || DEFAULT_MAKEUP_COST;
  const currentDay = ((streak - 1) % 7) + 1;
  const todayReward = dailyRewards[(currentDay - 1) % 7] || 10;

  const getRecentDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = MAX_MAKEUP_DAYS - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = i === 0;
      const isChecked = checkInHistory.includes(dateStr) || (isToday && todayChecked);

      days.push({
        date: dateStr,
        dayNum: date.getDate(),
        weekDay: t
          ? t(`checkIn.weekDays.${date.getDay()}`)
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        isToday,
        isChecked,
        canMakeup: !isChecked && !isToday,
      });
    }
    return days;
  };

  const recentDays = getRecentDays();
  const missedDays = recentDays.filter(d => d.canMakeup).length;

  const styles = {
    section: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      margin: '0 16px 12px',
      borderRadius: 16,
      overflow: 'hidden',
      border: '2px solid rgba(255, 193, 7, 0.4)',
      position: 'relative',
    },
    content: {
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      position: 'relative',
      zIndex: 1,
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    iconWrapper: {
      width: 46,
      height: 46,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #ffc107, #ff9500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 16px rgba(255, 193, 7, 0.4)',
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#ffc107',
      margin: 0,
      marginBottom: 2,
      whiteSpace: 'nowrap',
    },
    subtitle: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.6)',
      margin: 0,
      fontFamily: "'Rajdhani', sans-serif",
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    reward: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 3,
      padding: '2px 6px',
      background: 'rgba(255, 215, 0, 0.2)',
      borderRadius: 8,
      fontSize: 10,
      fontWeight: '600',
      fontFamily: "'Roboto Mono', monospace",
      color: '#ffc107',
      width: 'fit-content',
    },
    buttonGroup: {
      display: 'flex',
      gap: 6,
      flexShrink: 0,
    },
    checkInButton: {
      padding: '10px 14px',
      fontSize: 11,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: 'none',
      background: todayChecked
        ? 'rgba(57, 255, 20, 0.2)'
        : 'linear-gradient(135deg, #ffc107, #ff9500)',
      color: todayChecked ? '#39ff14' : '#000',
      cursor: todayChecked ? 'default' : 'pointer',
      boxShadow: todayChecked ? '0 0 10px rgba(57, 255, 20, 0.3)' : '0 4px 12px rgba(255, 215, 0, 0.3)',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
    },
    makeupButton: {
      padding: '10px 12px',
      fontSize: 10,
      fontWeight: '600',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.6)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      transition: 'all 0.3s ease',
      fontFamily: "'Rajdhani', sans-serif",
      whiteSpace: 'nowrap',
    },
    makeupPanel: {
      maxHeight: showMakeup ? '300px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    makeupContent: {
      padding: '16px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderTop: '1px solid rgba(255, 193, 7, 0.2)',
    },
    makeupHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    makeupTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#fff',
      margin: 0,
      fontFamily: "'Rajdhani', sans-serif",
    },
    makeupCost: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Rajdhani', sans-serif",
    },
    daysGrid: {
      display: 'flex',
      gap: 5,
      justifyContent: 'space-between',
    },
    dayItem: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px 4px',
      borderRadius: 8,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid transparent',
    },
    dayWeek: {
      fontSize: 9,
      marginBottom: 3,
      color: 'rgba(255,255,255,0.6)',
      fontFamily: "'Rajdhani', sans-serif",
    },
    dayNum: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 3,
      fontFamily: "'Orbitron', sans-serif",
    },
    dayStatus: {
      fontSize: 11,
      fontWeight: '500',
    },
    missedCount: {
      fontSize: 10,
      color: '#ff4da6',
      marginTop: 10,
      textAlign: 'center',
      fontFamily: "'Rajdhani', sans-serif",
    },
  };

  const getDayStyle = (day) => {
    if (day.isToday) {
      return {
        ...styles.dayItem,
        background: todayChecked
          ? 'linear-gradient(135deg, rgba(57, 255, 20, 0.2), rgba(255, 193, 7, 0.15))'
          : 'linear-gradient(135deg, rgba(255, 193, 7, 0.25), rgba(255, 150, 0, 0.2))',
        border: todayChecked
          ? '1px solid rgba(57, 255, 20, 0.4)'
          : '1px solid rgba(255, 193, 7, 0.5)',
      };
    }
    if (day.isChecked) {
      return {
        ...styles.dayItem,
        background: 'rgba(57, 255, 20, 0.1)',
        border: '1px solid rgba(57, 255, 20, 0.2)',
      };
    }
    if (day.canMakeup) {
      return {
        ...styles.dayItem,
        background: 'rgba(255, 77, 166, 0.1)',
        border: '1px dashed rgba(255, 77, 166, 0.3)',
      };
    }
    return styles.dayItem;
  };

  const handleMakeup = (day) => {
    if (day.canMakeup && onMakeup) {
      onMakeup(day.date, makeupCost);
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.content}>
        <div style={styles.left}>
          <div style={styles.iconWrapper}><IconGift size={22} color="#fff" /></div>
          <div style={styles.textContainer}>
            <p style={styles.title}>DAILY CHECK-IN</p>
            <p style={styles.subtitle}>
              {streak > 0
                ? (t ? `${t('checkIn.streak')} ${streak} ${t('checkIn.days')}` : `${streak} day streak`)
                : (t ? t('checkIn.checkInBtn') : 'Start checking in')}
            </p>
            {!todayChecked && (
              <div style={styles.reward}>+{todayReward} Points</div>
            )}
          </div>
        </div>
        <div style={styles.buttonGroup}>
          {missedDays > 0 && (
            <button
              style={styles.makeupButton}
              onClick={() => setShowMakeup(!showMakeup)}
            >
              {t ? t('checkIn.makeup') : 'Makeup'}
              <span style={{
                transform: showMakeup ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                display: 'inline-block',
                fontSize: 8,
              }}>
                ▼
              </span>
            </button>
          )}
          <button
            style={styles.checkInButton}
            onClick={onCheckIn}
            disabled={todayChecked}
          >
            {todayChecked ? <IconCheck size={14} color="#39ff14" /> : (t ? t('checkIn.checkInBtn') : 'Check In')}
          </button>
        </div>
      </div>

      <div style={styles.makeupPanel}>
        <div style={styles.makeupContent}>
          <div style={styles.makeupHeader}>
            <p style={styles.makeupTitle}>{t ? t('checkIn.selectDate') : 'Select date to makeup'}</p>
            <span style={styles.makeupCost}>{t ? t('checkIn.makeupCost', { cost: makeupCost }) : `Cost: ${makeupCost} pts`}</span>
          </div>

          <div style={styles.daysGrid}>
            {recentDays.map((day) => (
              <div
                key={day.date}
                style={getDayStyle(day)}
                onClick={() => handleMakeup(day)}
              >
                <span style={styles.dayWeek}>{day.weekDay}</span>
                <span style={{
                  ...styles.dayNum,
                  color: day.isToday
                    ? (todayChecked ? '#39ff14' : '#ffc107')
                    : (day.isChecked ? '#39ff14' : (day.canMakeup ? '#ff4da6' : 'rgba(255,255,255,0.6)')),
                }}>
                  {day.dayNum}
                </span>
                <span style={{
                  ...styles.dayStatus,
                  color: day.isToday
                    ? (todayChecked ? '#39ff14' : '#ffc107')
                    : (day.isChecked ? '#39ff14' : '#ff4da6'),
                }}>
                  {day.isToday
                    ? (todayChecked ? <IconCheck size={11} color="#39ff14" /> : (t ? t('checkIn.today') : 'Today'))
                    : day.isChecked
                      ? <IconCheck size={11} color="#39ff14" />
                      : day.canMakeup
                        ? (t ? t('checkIn.missed') : 'Miss')
                        : ''}
                </span>
              </div>
            ))}
          </div>

          {missedDays > 0 && (
            <p style={styles.missedCount}>
              {t ? t('checkIn.missedHint', { count: missedDays }) : `${missedDays} missed days. Tap to makeup.`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
