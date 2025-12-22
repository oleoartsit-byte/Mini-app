import React, { useState } from 'react';

export function InviteCard({ inviteData, onCopyLink, onShare, theme, t }) {
  const { inviteCount, inviteBonus = 0, commissionBonus = 0, inviteLink, config } = inviteData;
  const inviterReward = config?.inviterReward || 1; // 默认 1 USDT
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styles = {
    section: {
      backgroundColor: theme.bg,
      margin: '0 16px 12px',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `1px solid ${theme.secondaryBg}`,
    },
    header: {
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      color: theme.bg !== '#ffffff' ? '#7d8aff' : '#667eea',
      fontWeight: '600',
      margin: 0,
      marginTop: 2,
    },
    arrowWrapper: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: expanded ? 'rgba(102, 126, 234, 0.15)' : theme.secondaryBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    arrow: {
      fontSize: 12,
      color: expanded ? (theme.bg !== '#ffffff' ? '#7d8aff' : '#667eea') : theme.hint,
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    expandedContent: {
      maxHeight: expanded ? '280px' : '0',
      opacity: expanded ? 1 : 0,
      overflow: 'hidden',
      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
    },
    statsRow: {
      display: 'flex',
      padding: '0 16px 12px',
      gap: 12,
    },
    statItem: {
      flex: 1,
      textAlign: 'center',
      padding: '10px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 10,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
    },
    statLabel: {
      fontSize: 11,
      color: theme.hint,
      margin: 0,
      marginTop: 4,
    },
    linkSection: {
      padding: '0 16px 12px',
    },
    linkBox: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 10,
    },
    linkText: {
      flex: 1,
      fontSize: 12,
      color: theme.text,
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'monospace',
    },
    copyButton: {
      padding: '6px 12px',
      fontSize: 12,
      fontWeight: '600',
      borderRadius: 8,
      border: 'none',
      background: copied ? '#34c759' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    shareButton: {
      margin: '0 16px 12px',
      padding: '12px',
      fontSize: 14,
      fontWeight: '700',
      borderRadius: 10,
      border: 'none',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: 'calc(100% - 32px)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
  };

  return (
    <div style={styles.section}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <div style={styles.headerLeft}>
          <div style={styles.iconWrapper}>👥</div>
          <div style={styles.textContainer}>
            <p style={styles.title}>{t ? t('invite.title') : '邀请好友'}</p>
            <p style={styles.subtitle}>
              {t ? t('invite.inviteCount') : '已邀请'} {inviteCount} {t ? t('invite.people') : '人'} · 💵{inviteBonus} · 💰{commissionBonus.toFixed(2)}
            </p>
            <p style={styles.reward}>{t ? t('invite.subtitle').replace('{amount}', inviterReward) : `邀请得 ${inviterReward} USDT 💵`}</p>
          </div>
        </div>
        <div style={styles.arrowWrapper}>
          <span style={styles.arrow}>▼</span>
        </div>
      </div>

      <div style={styles.expandedContent}>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <p style={styles.statValue}>{inviteCount}</p>
            <p style={styles.statLabel}>{t ? t('invite.inviteCount') : '已邀请'}</p>
          </div>
          <div style={styles.statItem}>
            <p style={{...styles.statValue, color: '#52c41a'}}>+{inviteBonus}</p>
            <p style={styles.statLabel}>{t ? t('invite.inviteBonus') : '邀请奖励'} 💵</p>
          </div>
          <div style={styles.statItem}>
            <p style={{...styles.statValue, color: '#52c41a'}}>+{commissionBonus.toFixed(2)}</p>
            <p style={styles.statLabel}>{t ? t('invite.commissionBonus') : '返佣'} 💰</p>
          </div>
        </div>

        <div style={styles.linkSection}>
          <div style={styles.linkBox}>
            <p style={styles.linkText}>{inviteLink}</p>
            <button style={styles.copyButton} onClick={handleCopy}>
              {copied ? (t ? t('invite.linkCopied') : '已复制 ✓') : (t ? t('common.copy') : '复制')}
            </button>
          </div>
        </div>

        <button style={styles.shareButton} onClick={onShare}>
          <span>📤</span>
          <span>{t ? t('invite.shareToTg') : '分享给好友'}</span>
        </button>
      </div>
    </div>
  );
}
