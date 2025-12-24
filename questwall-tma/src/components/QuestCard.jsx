import { useState } from 'react';
import {
  IconChannel,
  IconUsers,
  IconTwitter,
  IconRetweet,
  IconHeart,
  IconComment,
  IconBlockchain,
  IconLink,
  IconWallet,
  IconNFT,
  IconQuest,
  IconDollar,
  IconStar,
  IconCheck,
} from './icons/CyberpunkIcons';

// 获取奖励信息
const getRewardInfo = (reward) => {
  const usdt = Number(reward?.amount) || 0;
  const points = reward?.points !== undefined ? reward.points : Math.floor(usdt * 10);
  return { usdt, points };
};

// 任务类型配置 - 平台颜色
const getQuestTypeInfo = (type, t) => {
  const labels = {
    join_channel: t ? t('quest.types.join_channel') : 'Channel',
    join_group: t ? t('quest.types.join_group') : 'Group',
    follow_twitter: t ? t('quest.types.follow_twitter') : 'Follow',
    retweet_twitter: t ? t('quest.types.retweet_twitter') : 'Retweet',
    like_twitter: t ? t('quest.types.like_twitter') : 'Like',
    comment_twitter: t ? t('quest.types.comment_twitter') : 'Comment',
    onchain_transfer: t ? t('quest.types.onchain_transfer') : 'Transfer',
    deep_link: t ? t('quest.types.deep_link') : 'Link',
    wallet_bind: t ? t('quest.types.wallet_bind') : 'Wallet',
    mint_nft: t ? t('quest.types.mint_nft') : 'NFT',
    default: t ? t('quest.types.default') : 'Quest',
  };

  const typeStyles = {
    join_channel: { icon: IconChannel, label: labels.join_channel, color: '#0088cc' },
    join_group: { icon: IconUsers, label: labels.join_group, color: '#0088cc' },
    follow_twitter: { icon: IconTwitter, label: labels.follow_twitter, color: '#ffffff' },
    retweet_twitter: { icon: IconRetweet, label: labels.retweet_twitter, color: '#00e5ff' },
    like_twitter: { icon: IconHeart, label: labels.like_twitter, color: '#ff4da6' },
    comment_twitter: { icon: IconComment, label: labels.comment_twitter, color: '#39ff14' },
    onchain_transfer: { icon: IconBlockchain, label: labels.onchain_transfer, color: '#ffc107' },
    deep_link: { icon: IconLink, label: labels.deep_link, color: '#39ff14' },
    wallet_bind: { icon: IconWallet, label: labels.wallet_bind, color: '#00e5ff' },
    mint_nft: { icon: IconNFT, label: labels.mint_nft, color: '#bf5fff' },
    default: { icon: IconQuest, label: labels.default, color: '#00e5ff' },
  };

  return typeStyles[type] || typeStyles.default;
};

export function QuestCard({ quest, onStart, isCompleted = false, t }) {
  const [isHovered, setIsHovered] = useState(false);
  const rewardInfo = getRewardInfo(quest.reward);
  const typeInfo = getQuestTypeInfo(quest.type, t);

  const styles = {
    card: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      margin: '0 16px 12px',
      borderRadius: 16,
      padding: '14px',
      paddingLeft: '18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    // 左侧彩色边框条 - 根据任务类型变色
    leftColorBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 4,
      background: typeInfo.color,
      borderRadius: '16px 0 0 16px',
    },
    // 扫描光效果
    scanLine: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent)',
      transition: 'left 0.5s ease',
      pointerEvents: 'none',
      zIndex: 5,
    },
    scanLineActive: {
      left: '100%',
    },
    completedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    completedBadge: {
      background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.3), rgba(0, 229, 255, 0.2))',
      color: '#39ff14',
      padding: '8px 20px',
      borderRadius: 16,
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      border: '1px solid rgba(57, 255, 20, 0.4)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    iconWrapper: {
      width: 46,
      height: 46,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${typeInfo.color}30, ${typeInfo.color}15)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      flexShrink: 0,
      border: `1px solid ${typeInfo.color}40`,
      animation: 'iconFloat 3s ease-in-out infinite',
    },
    content: {
      flex: 1,
      minWidth: 0,
      position: 'relative',
      zIndex: 1,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    typeBadge: {
      fontSize: 9,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: typeInfo.color,
      backgroundColor: `${typeInfo.color}15`,
      padding: '3px 8px',
      borderRadius: 6,
      border: `1px solid ${typeInfo.color}30`,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 4,
      lineHeight: 1.3,
    },
    desc: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      lineHeight: 1.4,
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
    },
    rewardItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      borderRadius: 8,
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    rewardIcon: {
      fontSize: 12,
    },
    rewardAmount: {
      fontSize: 11,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
    },
    rewardLabel: {
      fontSize: 9,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
    },
    button: {
      padding: '8px 16px',
      fontSize: 11,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow: '0 0 12px rgba(0, 229, 255, 0.3)',
      transition: 'all 0.3s ease',
    },
    buttonDisabled: {
      background: 'rgba(60, 60, 80, 0.5)',
      color: 'rgba(255, 255, 255, 0.5)',
      boxShadow: 'none',
      cursor: 'default',
    },
    participants: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 10,
      color: 'rgba(255, 255, 255, 0.6)',
      marginTop: 8,
      fontFamily: "'Rajdhani', sans-serif",
    },
    participantDot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#00e5ff',
      boxShadow: '0 0 6px #00e5ff',
    },
  };

  const handleClick = () => {
    if (!isCompleted) {
      onStart(quest);
    }
  };

  const participantCount = quest.id ? (parseInt(quest.id) * 17 % 500) + 100 : 150;

  return (
    <div
      style={styles.card}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 左侧彩色边框条 */}
      <div style={styles.leftColorBar} />

      {/* 扫描光效果 */}
      <div style={{
        ...styles.scanLine,
        ...(isHovered ? styles.scanLineActive : {}),
      }} />

      {isCompleted && (
        <div style={styles.completedOverlay}>
          <div style={styles.completedBadge}>
            <IconCheck size={14} color="#39ff14" />
            <span>{t ? t('quest.completed') : 'COMPLETED'}</span>
          </div>
        </div>
      )}

      {/* 任务类型图标 */}
      <div style={styles.iconWrapper}>
        <typeInfo.icon size={22} color={typeInfo.color} />
      </div>

      <div style={styles.content}>
        {/* 类型标签 */}
        <div style={styles.header}>
          <span style={styles.typeBadge}>{typeInfo.label}</span>
        </div>

        {/* 标题和描述 */}
        <h3 style={styles.title}>{quest.title}</h3>
        <p style={styles.desc}>{quest.description}</p>

        {/* 奖励和按钮 */}
        <div style={styles.footer}>
          <div style={styles.reward}>
            {/* USDT 奖励 */}
            <div style={styles.rewardItem}>
              <span style={styles.rewardIcon}><IconDollar size={12} color="#39ff14" /></span>
              <span style={{ ...styles.rewardAmount, color: '#39ff14' }}>+{rewardInfo.usdt}</span>
              <span style={styles.rewardLabel}>USDT</span>
            </div>
            {/* 积分奖励 */}
            <div style={styles.rewardItem}>
              <span style={styles.rewardIcon}><IconStar size={12} color="#ffc107" /></span>
              <span style={{ ...styles.rewardAmount, color: '#ffc107' }}>+{rewardInfo.points}</span>
              <span style={styles.rewardLabel}>PTS</span>
            </div>
          </div>

          {/* 开始按钮 */}
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
            {isCompleted ? <IconCheck size={14} color="#39ff14" /> : (t ? t('quest.start') : 'START')}
          </button>
        </div>

        {/* 参与人数 */}
        <div style={styles.participants}>
          <div style={styles.participantDot} />
          <span>{t ? t('quest.participants', { count: participantCount }) : `${participantCount} joined`}</span>
        </div>
      </div>
    </div>
  );
}
