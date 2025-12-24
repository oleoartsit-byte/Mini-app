import { useState, useEffect } from 'react';
import { IconQuest, IconGift, IconUsers, IconDollar, IconWithdraw, IconHistory } from './icons/CyberpunkIcons';

const getTypeIcon = (type) => {
  switch (type) {
    case 'quest': return <IconQuest size={22} color="#00e5ff" />;
    case 'checkin': return <IconGift size={22} color="#ffc107" />;
    case 'invite': return <IconUsers size={22} color="#bf5fff" />;
    case 'transfer': return <IconDollar size={22} color="#39ff14" />;
    case 'withdraw': return <IconWithdraw size={22} color="#ff4da6" />;
    default: return <IconDollar size={22} color="#00e5ff" />;
  }
};

const getTypeLabel = (type, t) => {
  const labels = {
    quest: t ? t('transaction.quest') : '任务奖励',
    checkin: t ? t('transaction.checkin') : '签到奖励',
    invite: t ? t('transaction.invite') : '邀请奖励',
    transfer: t ? t('transaction.transfer') : '转入',
    withdraw: t ? t('transaction.withdraw') : '提现',
  };
  return labels[type] || (t ? t('transaction.other') : '其他');
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

export function TransactionHistory({ api, t }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!api) return;
      setLoading(true);
      try {
        const data = await api.getTransactionHistory();
        if (data && data.items) {
          setTransactions(data.items.map(item => ({
            id: item.id,
            type: item.type || 'quest',
            title: item.title || item.description || '交易',
            amount: parseFloat(item.amount) || 0,
            currency: item.asset || item.currency || 'USDT',
            time: formatTime(item.createdAt),
            isPositive: item.direction !== 'out',
          })));
        }
      } catch (error) {
        console.error('获取交易历史失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [api]);

  const displayTransactions = transactions;

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
      color: 'rgba(255, 255, 255, 0.4)',
    },
    amount: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
    },
    positive: {
      color: '#39ff14',
      textShadow: '0 0 10px rgba(57, 255, 20, 0.4)',
    },
    negative: {
      color: '#ff4da6',
      textShadow: '0 0 10px rgba(255, 77, 166, 0.4)',
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
      color: 'rgba(255, 255, 255, 0.4)',
      margin: 0,
    },
    loadingText: {
      padding: 30,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
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
            <span>{t ? t('transaction.history') : '交易历史'}</span>
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

  if (displayTransactions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            <IconHistory size={18} color="#00e5ff" />
            <span>{t ? t('transaction.history') : '交易历史'}</span>
          </h3>
        </div>
        <div style={styles.listCard}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}><IconHistory size={48} color="rgba(0, 229, 255, 0.4)" /></div>
            <p style={styles.emptyText}>{t ? t('empty.noHistory') : '暂无交易记录'}</p>
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
          <span>{t ? t('transaction.history') : '交易历史'}</span>
        </h3>
      </div>

      <div style={styles.listCard}>
        {displayTransactions.map((tx, index) => {
          const isPositive = tx.type !== 'withdraw';
          return (
            <div
              key={tx.id}
              style={{
                ...styles.item,
                borderBottom: index === displayTransactions.length - 1 ? 'none' : styles.item.borderBottom,
              }}
            >
              <div style={styles.iconBox}>
                {getTypeIcon(tx.type)}
              </div>
              <div style={styles.info}>
                <p style={styles.itemTitle}>{tx.title}</p>
                <div style={styles.itemMeta}>
                  <span style={styles.typeLabel}>{getTypeLabel(tx.type, t)}</span>
                  <span style={styles.time}>{tx.time}</span>
                </div>
              </div>
              <div style={{
                ...styles.amount,
                ...(isPositive ? styles.positive : styles.negative),
              }}>
                <span>{isPositive ? '+' : '-'}{tx.amount}</span>
                <span style={{ fontSize: 12, opacity: 0.8 }}><IconDollar size={14} color="currentColor" /></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
