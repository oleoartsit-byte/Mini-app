import React, { useState } from 'react';

// 默认签到奖励配置（积分）- 当后端未返回配置时使用
const DEFAULT_DAILY_REWARDS = [10, 20, 30, 40, 50, 60, 100];
const DEFAULT_MAKEUP_COST = 20;

// 可补签的最大天数
const MAX_MAKEUP_DAYS = 7;

export function CheckInCard({ checkInData, onCheckIn, onMakeup, theme, t }) {
  const { lastCheckIn, streak, todayChecked, checkInHistory = [], config } = checkInData;
  const [showMakeup, setShowMakeup] = useState(false);

  // 从后端配置获取奖励数组和补签费用，若无则使用默认值
  const dailyRewards = config?.dailyRewards || DEFAULT_DAILY_REWARDS;
  const makeupCost = config?.makeupCost || DEFAULT_MAKEUP_COST;

  // 获取今天是连续签到的第几天（1-7循环）
  const currentDay = ((streak - 1) % 7) + 1;
  // 今天的奖励（从后端配置获取）
  const todayReward = dailyRewards[(currentDay - 1) % 7] || 10;

  // 获取最近7天的日期
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
          : ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        isToday,
        isChecked,
        canMakeup: !isChecked && !isToday, // 不能补今天，今天要正常签到
      });
    }
    return days;
  };

  const recentDays = getRecentDays();
  const missedDays = recentDays.filter(d => d.canMakeup).length;

  const styles = {
    section: {
      backgroundColor: theme.bg,
      margin: '0 16px 12px',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `1px solid ${theme.secondaryBg}`,
    },
    content: {
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
    },
    subtitle: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
      marginTop: 2,
    },
    reward: {
      fontSize: 12,
      color: '#ff9500',
      fontWeight: '600',
      margin: 0,
      marginTop: 2,
    },
    buttonGroup: {
      display: 'flex',
      gap: 8,
    },
    checkInButton: {
      padding: '10px 18px',
      fontSize: 14,
      fontWeight: '700',
      borderRadius: 10,
      border: 'none',
      background: todayChecked
        ? theme.secondaryBg
        : 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)',
      color: todayChecked ? theme.hint : '#fff',
      cursor: todayChecked ? 'default' : 'pointer',
      boxShadow: todayChecked ? 'none' : '0 4px 12px rgba(255, 149, 0, 0.3)',
    },
    makeupButton: {
      padding: '10px 14px',
      fontSize: 13,
      fontWeight: '600',
      borderRadius: 10,
      border: `1px solid ${theme.hint}33`,
      background: 'transparent',
      color: theme.hint,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    // 补签面板样式
    makeupPanel: {
      maxHeight: showMakeup ? '300px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderTop: showMakeup ? `1px solid ${theme.secondaryBg}` : 'none',
    },
    makeupContent: {
      padding: '16px',
    },
    makeupHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    makeupTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      margin: 0,
    },
    makeupCost: {
      fontSize: 12,
      color: theme.hint,
    },
    daysGrid: {
      display: 'flex',
      gap: 8,
      justifyContent: 'space-between',
    },
    dayItem: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px 4px',
      borderRadius: 10,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    dayWeek: {
      fontSize: 10,
      marginBottom: 4,
    },
    dayNum: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    dayStatus: {
      fontSize: 12,
      fontWeight: '500',
    },
    missedCount: {
      fontSize: 11,
      color: '#ff5e3a',
      marginTop: 8,
      textAlign: 'center',
    },
  };

  const getDayStyle = (day) => {
    if (day.isToday) {
      return {
        ...styles.dayItem,
        background: todayChecked
          ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
          : 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)',
      };
    }
    if (day.isChecked) {
      return {
        ...styles.dayItem,
        background: theme.secondaryBg,
      };
    }
    if (day.canMakeup) {
      return {
        ...styles.dayItem,
        background: `${theme.hint}15`,
        border: `1px dashed ${theme.hint}50`,
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
          <div style={styles.iconWrapper}>📅</div>
          <div style={styles.textContainer}>
            <p style={styles.title}>{t ? t('checkIn.title') : '每日签到'}</p>
            <p style={styles.subtitle}>
              {streak > 0
                ? (t ? `${t('checkIn.streak')} ${streak} ${t('checkIn.days')}` : `连续 ${streak} 天`)
                : (t ? t('checkIn.checkInBtn') : '开始签到')}
            </p>
            {!todayChecked && (
              <p style={styles.reward}>{t ? t('checkIn.todayReward') : '今日'} +{todayReward} 积分</p>
            )}
          </div>
        </div>
        <div style={styles.buttonGroup}>
          {missedDays > 0 && (
            <button
              style={styles.makeupButton}
              onClick={() => setShowMakeup(!showMakeup)}
            >
              {t ? t('checkIn.makeup') : '补签'}
              <span style={{
                transform: showMakeup ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                display: 'inline-block',
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
            {todayChecked ? (t ? t('checkIn.checkedIn') + ' ✓' : '已签到 ✓') : (t ? t('checkIn.checkInBtn') : '签到')}
          </button>
        </div>
      </div>

      {/* 补签面板 */}
      <div style={styles.makeupPanel}>
        <div style={styles.makeupContent}>
          <div style={styles.makeupHeader}>
            <p style={styles.makeupTitle}>{t ? t('checkIn.selectDate') : '选择要补签的日期'}</p>
            <span style={styles.makeupCost}>{t ? t('checkIn.makeupCost', { cost: makeupCost }) : `消耗 ${makeupCost} 积分`}</span>
          </div>

          <div style={styles.daysGrid}>
            {recentDays.map((day) => (
              <div
                key={day.date}
                style={getDayStyle(day)}
                onClick={() => handleMakeup(day)}
              >
                <span style={{ ...styles.dayWeek, color: day.isToday ? '#fff' : theme.text }}>{day.weekDay}</span>
                <span style={{
                  ...styles.dayNum,
                  color: day.isToday ? '#fff' : (day.isChecked ? '#4CAF50' : (day.canMakeup ? '#ff5e3a' : theme.text)),
                }}>
                  {day.dayNum}
                </span>
                <span style={{
                  ...styles.dayStatus,
                  color: day.isToday ? '#fff' : (day.isChecked ? '#4CAF50' : '#ff5e3a'),
                }}>
                  {day.isToday
                    ? (todayChecked ? '✓' : (t ? t('checkIn.today') : '今'))
                    : day.isChecked
                      ? '✓'
                      : day.canMakeup
                        ? (t ? t('checkIn.missed') : '漏')
                        : ''}
                </span>
              </div>
            ))}
          </div>

          {missedDays > 0 && (
            <p style={styles.missedCount}>
              {t ? t('checkIn.missedHint', { count: missedDays }) : `您有 ${missedDays} 天漏签，点击日期即可补签`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
