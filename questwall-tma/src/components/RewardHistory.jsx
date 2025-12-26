import { useState, useEffect } from 'react';
import { IconQuest, IconGift, IconUsers, IconDollar, IconHistory } from './icons/CyberpunkIcons';

const getTypeIcon = (type) => {
  switch (type) {
    case 'quest': return <IconQuest size={22} color="#00e5ff" />;
    case 'checkin': return <IconGift size={22} color="#ffc107" />;
    case 'invite': return <IconUsers size={22} color="#bf5fff" />;
    default: return <IconDollar size={22} color="#00e5ff" />;
  }
};

const getTypeLabel = (type) => {
  const labels = {
    quest: '任务',
    checkin: '签到',
    invite: '邀请',
  };
  return labels[type] || '其他';
};

// 格式化时间为真实日期
function formatTime(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function RewardHistory({ api, t }) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!api) return;
      setLoading(true);
      try {
        const data = await api.getRewardHistory();
        if (data && data.items) {
          setRewards(data.items.map(item => ({
            id: item.id,
            type: item.type || 'quest',
            title: item.title || '奖励',
            amount: parseFloat(item.amount) || 0,
            currency: item.currency || 'USDT',
            time: formatTime(item.createdAt),
          })));
        }
      } catch (error) {
        console.error('获取奖励记录失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [api]);

  const styles = {
    container: {
      padding: '0 16px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0 12px',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textShadow: '0 0 8px rgba(0, 229, 255, 0.3)',
    },
    listCard: {
      backgroundColor: '#0f0f23',
      background: 'linear-gradient(165deg, #191932 0%, #0f0f23 100%)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.25)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      zIndex: 10,
      isolation: 'isolate',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: '1px solid rgba(0, 229, 255, 0.1)',
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(191, 95, 255, 0.15))',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      marginRight: 12,
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    itemMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    typeLabel: {
      fontSize: 11,
      fontFamily: "'Rajdhani', sans-serif",
      color: '#00e5ff',
      padding: '2px 8px',
      background: 'rgba(0, 229, 255, 0.1)',
      borderRadius: 6,
      border: '1px solid rgba(0, 229, 255, 0.2)',
    },
    time: {
      fontSize: 11,
      fontFamily: "'Roboto Mono', monospace",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    amount: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#39ff14',
      textShadow: '0 0 10px rgba(57, 255, 20, 0.4)',
    },
    emptyState: {
      padding: '50px 20px',
      textAlign: 'center',
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.3))',
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
    },
    loadingText: {
      padding: 30,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.6)',
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: 14,
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            <IconHistory size={18} color="#00e5ff" />
            <span>奖励记录</span>
          </h3>
        </div>
        <div style={styles.listCard}>
          <div style={styles.loadingText}>
            {t ? t('common.loading') : '加载中...'}
          </div>
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            <IconHistory size={18} color="#00e5ff" />
            <span>奖励记录</span>
          </h3>
        </div>
        <div style={styles.listCard}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}><IconHistory size={48} color="rgba(0, 229, 255, 0.4)" /></div>
            <p style={styles.emptyText}>{t ? t('empty.noRewards') : '还没有奖励记录'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <IconHistory size={18} color="#00e5ff" />
          <span>{t ? t('reward.history') : '奖励记录'}</span>
        </h3>
      </div>

      <div style={styles.listCard}>
        {rewards.map((reward, index) => (
          <div
            key={reward.id}
            style={{
              ...styles.item,
              borderBottom: index === rewards.length - 1 ? 'none' : styles.item.borderBottom,
            }}
          >
            <div style={styles.iconBox}>
              {getTypeIcon(reward.type)}
            </div>
            <div style={styles.info}>
              <p style={styles.itemTitle}>{reward.title}</p>
              <div style={styles.itemMeta}>
                <span style={styles.typeLabel}>{getTypeLabel(reward.type)}</span>
                <span style={styles.time}>{reward.time}</span>
              </div>
            </div>
            <div style={styles.amount}>
              <span>+{reward.amount}</span>
              <span style={{ fontSize: 12, opacity: 0.8 }}><IconDollar size={14} color="currentColor" /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
