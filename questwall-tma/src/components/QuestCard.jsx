import React from 'react';

// 所有奖励统一使用 USDT
const getRewardInfo = () => {
  return { icon: '💵', label: 'USDT', color: '#26a17b', bgColor: 'rgba(38, 161, 123, 0.1)' };
};

const getQuestTypeInfo = (type, isDark, t) => {
  const labels = {
    join_channel: t ? t('quest.types.join_channel') : '关注频道',
    join_group: t ? t('quest.types.join_group') : '加入群组',
    follow_twitter: t ? t('quest.types.follow_twitter') : '关注推特',
    retweet_twitter: t ? t('quest.types.retweet_twitter') : '转发推特',
    like_twitter: t ? t('quest.types.like_twitter') : '点赞推特',
    comment_twitter: t ? t('quest.types.comment_twitter') : '评论推特',
    onchain_transfer: t ? t('quest.types.onchain_transfer') : '链上转账',
    deep_link: t ? t('quest.types.deep_link') : '深度链接',
    wallet_bind: t ? t('quest.types.wallet_bind') : '绑定钱包',
    mint_nft: t ? t('quest.types.mint_nft') : '铸造NFT',
    default: t ? t('quest.types.default') : '任务',
  };

  switch (type) {
    case 'join_channel':
      return { icon: '📢', label: labels.join_channel, color: isDark ? '#5ac8fa' : '#007aff', bgGradient: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)' };
    case 'join_group':
      return { icon: '👥', label: labels.join_group, color: isDark ? '#bf5af2' : '#5856d6', bgGradient: 'linear-gradient(135deg, #5856d6 0%, #af52de 100%)' };
    case 'follow_twitter':
      return { icon: '𝕏', label: labels.follow_twitter, color: isDark ? '#ffffff' : '#000000', bgGradient: isDark ? 'linear-gradient(135deg, #3a3a3c 0%, #2c2c2e 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' };
    case 'retweet_twitter':
      return { icon: '🔄', label: labels.retweet_twitter, color: isDark ? '#1da1f2' : '#1da1f2', bgGradient: 'linear-gradient(135deg, #1da1f2 0%, #0d8bd9 100%)' };
    case 'like_twitter':
      return { icon: '❤️', label: labels.like_twitter, color: isDark ? '#e0245e' : '#e0245e', bgGradient: 'linear-gradient(135deg, #e0245e 0%, #c51e53 100%)' };
    case 'comment_twitter':
      return { icon: '💬', label: labels.comment_twitter, color: isDark ? '#17bf63' : '#17bf63', bgGradient: 'linear-gradient(135deg, #17bf63 0%, #14a857 100%)' };
    case 'onchain_transfer':
      return { icon: '⛓️', label: labels.onchain_transfer, color: '#ff9f0a', bgGradient: 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)' };
    case 'deep_link':
      return { icon: '📲', label: labels.deep_link, color: isDark ? '#30d158' : '#34c759', bgGradient: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)' };
    case 'wallet_bind':
      return { icon: '💎', label: labels.wallet_bind, color: isDark ? '#64d2ff' : '#43e97b', bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' };
    case 'mint_nft':
      return { icon: '🎨', label: labels.mint_nft, color: isDark ? '#bf5af2' : '#af52de', bgGradient: 'linear-gradient(135deg, #af52de 0%, #5e5ce6 100%)' };
    default:
      return { icon: '🎯', label: labels.default, color: isDark ? '#7d8aff' : '#667eea', bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
  }
};

export function QuestCard({ quest, onStart, theme, isCompleted = false, t }) {
  const isDark = theme.bg !== '#ffffff';
  const rewardInfo = getRewardInfo(); // 统一使用 USDT
  const typeInfo = getQuestTypeInfo(quest.type, isDark, t);

  const styles = {
    card: {
      backgroundColor: theme.bg,
      margin: '0 16px 12px',
      borderRadius: 16,
      padding: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      border: `1px solid ${theme.secondaryBg}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    },
    completedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.bg === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    completedBadge: {
      background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
      color: '#fff',
      padding: '8px 20px',
      borderRadius: 20,
      fontSize: 14,
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)',
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: typeInfo.bgGradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      flexShrink: 0,
      boxShadow: `0 4px 12px ${typeInfo.color}30`,
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    typeBadge: {
      fontSize: 10,
      fontWeight: '600',
      color: typeInfo.color,
      backgroundColor: `${typeInfo.color}15`,
      padding: '3px 8px',
      borderRadius: 6,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
      marginBottom: 4,
      lineHeight: 1.3,
    },
    desc: {
      fontSize: 13,
      color: theme.hint,
      margin: 0,
      lineHeight: 1.5,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    reward: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 10,
      backgroundColor: rewardInfo.bgColor,
    },
    rewardIcon: {
      fontSize: 16,
    },
    rewardAmount: {
      fontSize: 14,
      fontWeight: '700',
      color: rewardInfo.color,
    },
    rewardLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.hint,
      marginLeft: 2,
    },
    button: {
      padding: '10px 20px',
      fontSize: 14,
      fontWeight: '700',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    buttonDisabled: {
      background: theme.secondaryBg,
      color: theme.hint,
      boxShadow: 'none',
      cursor: 'default',
    },
    participants: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      color: theme.hint,
      marginTop: 8,
    },
  };

  const handleClick = (e) => {
    if (!isCompleted) {
      onStart(quest);
    }
  };

  // 生成稳定的参与人数（基于questId）
  const participantCount = quest.id ? (parseInt(quest.id) * 17 % 500) + 100 : 150;

  return (
    <div
      style={styles.card}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isCompleted) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isCompleted && (
        <div style={styles.completedOverlay}>
          <div style={styles.completedBadge}>
            <span>✓</span>
            <span>{t ? t('quest.completed') : '已完成'}</span>
          </div>
        </div>
      )}

      <div style={styles.iconWrapper}>
        {typeInfo.icon}
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <span style={styles.typeBadge}>{typeInfo.label}</span>
        </div>
        <h3 style={styles.title}>{quest.title}</h3>
        <p style={styles.desc}>{quest.description}</p>

        <div style={styles.footer}>
          <div style={styles.reward}>
            <span style={styles.rewardIcon}>{rewardInfo.icon}</span>
            <span style={styles.rewardAmount}>+{quest.reward?.amount || 0}</span>
            <span style={styles.rewardLabel}>{rewardInfo.label}</span>
          </div>
          <button
            style={{
              ...styles.button,
              ...(isCompleted ? styles.buttonDisabled : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isCompleted) onStart(quest);
            }}
          >
            {isCompleted ? (t ? t('quest.completed') : '已完成') : (t ? t('quest.start') : '开始')}
          </button>
        </div>

        <div style={styles.participants}>
          <span>👥</span>
          <span>{t ? t('quest.participants', { count: participantCount }) : `${participantCount} 人已参与`}</span>
        </div>
      </div>
    </div>
  );
}
