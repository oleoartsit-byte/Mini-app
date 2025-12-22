import { useState, useEffect } from 'react';

const getTypeIcon = (type) => {
  switch (type) {
    case 'quest': return '🎯';
    case 'checkin': return '📅';
    case 'invite': return '👥';
    case 'transfer': return '💸';
    case 'withdraw': return '📤';
    default: return '💰';
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'quest': return '任务奖励';
    case 'checkin': return '签到奖励';
    case 'invite': return '邀请奖励';
    case 'transfer': return '转入';
    case 'withdraw': return '提现';
    default: return '其他';
  }
};

const getCurrencyIcon = () => {
  return '💵'; // 统一使用 USDT
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

export function TransactionHistory({ theme, api }) {
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
      color: theme.text,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    filterButton: {
      padding: '6px 12px',
      fontSize: 12,
      fontWeight: '500',
      borderRadius: 8,
      border: `1px solid ${theme.hint}30`,
      backgroundColor: 'transparent',
      color: theme.hint,
      cursor: 'pointer',
    },
    listCard: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${theme.secondaryBg}`,
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: `1px solid ${theme.secondaryBg}`,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.secondaryBg,
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
      fontWeight: '500',
      color: theme.text,
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
      fontSize: 12,
      color: theme.hint,
      padding: '2px 6px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 4,
    },
    time: {
      fontSize: 12,
      color: theme.hint,
    },
    amount: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 16,
      fontWeight: '700',
    },
    positive: {
      color: theme.success || '#34c759',
    },
    negative: {
      color: theme.danger || '#ff3b30',
    },
    emptyState: {
      padding: '40px 20px',
      textAlign: 'center',
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 14,
      color: theme.hint,
      margin: 0,
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            <span>📊</span>
            <span>交易历史</span>
          </h3>
        </div>
        <div style={styles.listCard}>
          <div style={{ padding: 20, textAlign: 'center', color: theme.hint }}>
            加载中...
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
            <span>📊</span>
            <span>交易历史</span>
          </h3>
        </div>
        <div style={styles.listCard}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>暂无交易记录</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <span>📊</span>
          <span>交易历史</span>
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
                  <span style={styles.typeLabel}>{getTypeLabel(tx.type)}</span>
                  <span style={styles.time}>{tx.time}</span>
                </div>
              </div>
              <div style={{
                ...styles.amount,
                ...(isPositive ? styles.positive : styles.negative),
              }}>
                <span>{isPositive ? '+' : '-'}{tx.amount}</span>
                <span>{getCurrencyIcon(tx.currency)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
