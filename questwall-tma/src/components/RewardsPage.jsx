import React, { useState, useEffect } from 'react';

// 格式化时间显示
function formatTime(dateStr, t) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (date >= today) {
    const todayLabel = t ? t('common.today') : '今天';
    return `${todayLabel} ${timeStr}`;
  } else if (date >= yesterday) {
    const yesterdayLabel = t ? t('common.yesterday') : '昨天';
    return `${yesterdayLabel} ${timeStr}`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
  }
}

// 获取任务类型翻译 key
function getQuestTypeKey(type) {
  const typeKeyMap = {
    'JOIN_CHANNEL': 'join_channel',
    'JOIN_GROUP': 'join_group',
    'DEEP_LINK': 'deep_link',
    'FOLLOW_TWITTER': 'follow_twitter',
    'RETWEET_TWITTER': 'retweet_twitter',
    'LIKE_TWITTER': 'like_twitter',
    'COMMENT_TWITTER': 'comment_twitter',
    'LIKE_POST': 'like_post',
    'ONCHAIN_TRANSFER': 'onchain_transfer',
    'FORM': 'form',
    'MINT_NFT': 'mint_nft',
    'CUSTOM': 'custom',
  };
  return typeKeyMap[type] || 'default';
}

// 获取任务类型中文名（备用）
function getQuestTypeName(type) {
  const typeMap = {
    'JOIN_CHANNEL': '关注频道',
    'JOIN_GROUP': '加入群组',
    'DEEP_LINK': '深度链接',
    'FOLLOW_TWITTER': '关注推特',
    'RETWEET_TWITTER': '转发推特',
    'LIKE_TWITTER': '点赞推特',
    'COMMENT_TWITTER': '评论推特',
    'LIKE_POST': '点赞帖子',
    'ONCHAIN_TRANSFER': '链上交易',
    'FORM': '表单任务',
    'MINT_NFT': '铸造 NFT',
    'CUSTOM': '自定义任务',
  };
  return typeMap[type] || type;
}

export function RewardsPage({ wallet, theme, t, onWithdraw, api }) {
  const balances = wallet?.balances || { usdt: 0 };
  const usdtBalance = balances.usdt || 0;

  const [rewardHistory, setRewardHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!api) return;
      setLoading(true);
      try {
        const data = await api.getRewardHistory();
        if (data && data.items) {
          setRewardHistory(data.items.map(item => {
            const questTypeKey = getQuestTypeKey(item.questType);
            const questTypeName = t ? t(`quest.types.${questTypeKey}`) : getQuestTypeName(item.questType);
            const completedLabel = t ? t('quest.completed') : '完成任务';
            return {
              id: item.id,
              type: item.type?.toLowerCase() || 'usdt',
              amount: parseFloat(item.amount) || 0,
              source: item.questTitle ? `${completedLabel}：${questTypeName}` : (t ? t('rewards.title') : '奖励'),
              time: formatTime(item.createdAt, t),
            };
          }));
        }
      } catch (error) {
        console.error('获取奖励历史失败:', error);
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
    // USDT 钱包卡片
    walletCard: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `1px solid ${theme.secondaryBg}`,
      marginBottom: 20,
    },
    walletHeader: {
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: `1px solid ${theme.secondaryBg}`,
    },
    walletIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'linear-gradient(135deg, #26A17B 0%, #3CB371 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      boxShadow: '0 4px 12px rgba(38, 161, 123, 0.25)',
    },
    walletTextContainer: {
      flex: 1,
    },
    walletTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
    },
    walletSubtitle: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
      marginTop: 2,
    },
    balanceSection: {
      padding: '24px 16px',
      textAlign: 'center',
    },
    balanceRow: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 8,
    },
    balanceValue: {
      fontSize: 42,
      fontWeight: '700',
      color: theme.text,
    },
    balanceUnit: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.hint,
    },
    balanceSubtext: {
      fontSize: 13,
      color: theme.hint,
      marginTop: 8,
    },
    actionsSection: {
      padding: '0 16px 16px',
    },
    withdrawButton: {
      width: '100%',
      padding: '14px',
      fontSize: 15,
      fontWeight: '700',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #26A17B 0%, #3CB371 100%)',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(38, 161, 123, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    noteSection: {
      padding: '12px 16px',
      backgroundColor: theme.secondaryBg,
    },
    note: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    // 奖励历史
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    historyList: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${theme.secondaryBg}`,
    },
    historyItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderBottom: `1px solid ${theme.secondaryBg}`,
    },
    historyIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #26A17B 0%, #3CB371 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
    },
    historyContent: {
      flex: 1,
    },
    historySource: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      margin: 0,
    },
    historyTime: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
      marginTop: 2,
    },
    historyAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: '#26A17B',
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      {/* USDT 钱包卡片 */}
      <div style={styles.walletCard}>
        {/* 顶部 */}
        <div style={styles.walletHeader}>
          <div style={styles.walletIcon}>💵</div>
          <div style={styles.walletTextContainer}>
            <p style={styles.walletTitle}>{t ? t('wallet.title') : '我的钱包'}</p>
            <p style={styles.walletSubtitle}>USDT {t ? t('wallet.balance') : '余额'}</p>
          </div>
        </div>

        {/* 余额 */}
        <div style={styles.balanceSection}>
          <div style={styles.balanceRow}>
            <span style={styles.balanceValue}>{usdtBalance.toFixed(2)}</span>
            <span style={styles.balanceUnit}>USDT</span>
          </div>
          <div style={styles.balanceSubtext}>
            ≈ ${usdtBalance.toFixed(2)} USD
          </div>
        </div>

        {/* 提现按钮 */}
        <div style={styles.actionsSection}>
          <button
            style={styles.withdrawButton}
            onClick={onWithdraw}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(38, 161, 123, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(38, 161, 123, 0.3)';
            }}
          >
            <span>💸</span>
            <span>{t ? t('wallet.withdraw') : '提现'}</span>
          </button>
        </div>

        {/* 提示 */}
        <div style={styles.noteSection}>
          <p style={styles.note}>
            <span>⏱️</span>
            <span>{t ? t('wallet.withdrawNote') : '提现申请将在 1-3 个工作日内处理'}</span>
          </p>
        </div>
      </div>

      {/* 奖励历史 */}
      <h3 style={styles.sectionTitle}>
        <span>📜</span>
        <span>{t ? t('rewards.history') : '奖励记录'}</span>
      </h3>
      <div style={styles.historyList}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: theme.hint }}>
            {t ? t('common.loading') : '加载中...'}
          </div>
        ) : rewardHistory.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: theme.hint }}>
            {t ? t('empty.noRewards') : '暂无奖励记录'}
          </div>
        ) : (
          rewardHistory.map((item, index) => (
            <div
              key={item.id}
              style={{
                ...styles.historyItem,
                borderBottom: index === rewardHistory.length - 1 ? 'none' : styles.historyItem.borderBottom,
              }}
            >
              <div style={styles.historyIcon}>💵</div>
              <div style={styles.historyContent}>
                <p style={styles.historySource}>{item.source}</p>
                <p style={styles.historyTime}>{item.time}</p>
              </div>
              <p style={styles.historyAmount}>+{item.amount} {item.type.toUpperCase()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
