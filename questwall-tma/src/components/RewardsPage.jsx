import { useState, useEffect } from 'react';
import { IconWallet, IconWithdraw, IconHistory, IconDollar, IconClock } from './icons/CyberpunkIcons';

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

export function RewardsPage({ wallet, t, onWithdraw, api }) {
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
  }, [api, t]);

  const styles = {
    container: {
      padding: '0 16px',
    },
    // USDT 钱包卡片 - 赛博朋克主题
    walletCard: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.25)',
      marginBottom: 20,
      position: 'relative',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    topHighlight: {
      position: 'absolute',
      top: 0,
      left: '10%',
      right: '10%',
      height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.6), transparent)',
    },
    walletHeader: {
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
    },
    walletIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(191, 95, 255, 0.2))',
      border: '1px solid rgba(0, 229, 255, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      boxShadow: '0 4px 12px rgba(0, 229, 255, 0.2)',
    },
    walletTextContainer: {
      flex: 1,
    },
    walletTitle: {
      fontSize: 15,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      textShadow: '0 0 8px rgba(0, 229, 255, 0.3)',
    },
    walletSubtitle: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      marginTop: 2,
    },
    balanceSection: {
      padding: '24px 16px',
    },
    balanceRow: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4,
    },
    dollarSign: {
      fontSize: 36,
      fontWeight: '800',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      color: '#fff',
    },
    balanceInteger: {
      fontSize: 48,
      fontWeight: '800',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      color: '#fff',
    },
    balanceDecimal: {
      fontSize: 28,
      fontWeight: '700',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    usdtBadge: {
      background: 'rgba(0, 229, 255, 0.15)',
      border: '1px solid rgba(0, 229, 255, 0.5)',
      borderRadius: 8,
      padding: '4px 10px',
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#00e5ff',
      marginLeft: 12,
    },
    changeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
    },
    changeIndicator: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: '600',
      color: '#ffc107',
    },
    changePeriod: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    actionsSection: {
      padding: '0 16px 16px',
    },
    withdrawButton: {
      width: '100%',
      padding: '14px 16px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 229, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'transform 0.2s, box-shadow 0.2s',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    noteSection: {
      padding: '12px 16px',
      background: 'rgba(0, 229, 255, 0.05)',
    },
    note: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
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
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textShadow: '0 0 8px rgba(0, 229, 255, 0.3)',
    },
    historyList: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    historyItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderBottom: '1px solid rgba(0, 229, 255, 0.1)',
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
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
    },
    historyTime: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      marginTop: 2,
    },
    historyAmount: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#39ff14',
      margin: 0,
      textShadow: '0 0 8px rgba(57, 255, 20, 0.3)',
    },
    emptyText: {
      padding: 30,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.6)',
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: 14,
    },
  };

  return (
    <div style={styles.container}>
      {/* USDT 钱包卡片 */}
      <div style={styles.walletCard}>
        <div style={styles.topHighlight} />
        {/* 顶部 */}
        <div style={styles.walletHeader}>
          <div style={styles.walletIcon}><IconWallet size={20} color="#00e5ff" /></div>
          <div style={styles.walletTextContainer}>
            <p style={styles.walletTitle}>{t ? t('wallet.title') : '我的钱包'}</p>
            <p style={styles.walletSubtitle}>USDT {t ? t('wallet.balance') : '余额'}</p>
          </div>
        </div>

        {/* 余额 */}
        <div style={styles.balanceSection}>
          <div style={styles.balanceRow}>
            <span style={styles.dollarSign}>$</span>
            <span style={styles.balanceInteger}>{Math.floor(usdtBalance)}</span>
            <span style={styles.balanceDecimal}>.{(usdtBalance % 1).toFixed(2).substring(2)}</span>
            <span style={styles.usdtBadge}>USDT</span>
          </div>
          <div style={styles.changeRow}>
            <span style={styles.changeIndicator}>▲ +${(usdtBalance * 0.1).toFixed(2)} (11.04%)</span>
            <span style={styles.changePeriod}>{t ? t('wallet.thisWeek') : '本周'}</span>
          </div>
        </div>

        {/* 提现按钮 */}
        <div style={styles.actionsSection}>
          <button
            style={styles.withdrawButton}
            onClick={onWithdraw}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 229, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 229, 255, 0.3)';
            }}
          >
            <IconWithdraw size={18} color="#000" />
            <span>{t ? t('wallet.withdraw') : '提现'}</span>
          </button>
        </div>

        {/* 提示 */}
        <div style={styles.noteSection}>
          <p style={styles.note}>
            <IconClock size={14} color="#00e5ff" />
            <span>{t ? t('wallet.withdrawNote') : '提现申请将在 1-3 个工作日内处理'}</span>
          </p>
        </div>
      </div>

      {/* 奖励历史 */}
      <h3 style={styles.sectionTitle}>
        <IconHistory size={18} color="#00e5ff" />
        <span>{t ? t('rewards.history') : '奖励记录'}</span>
      </h3>
      <div style={styles.historyList}>
        {loading ? (
          <div style={styles.emptyText}>
            {t ? t('common.loading') : '加载中...'}
          </div>
        ) : rewardHistory.length === 0 ? (
          <div style={styles.emptyText}>
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
              <div style={styles.historyIcon}><IconDollar size={20} color="#fff" /></div>
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
