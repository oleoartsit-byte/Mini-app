import { useState } from 'react';
import { IconUsers, IconDollar, IconShare, IconCheck } from './icons/CyberpunkIcons';

export function InviteCard({ inviteData, onCopyLink, onShare, t }) {
  const { inviteCount, inviteBonus = 0, commissionBonus = 0, inviteLink, config } = inviteData;
  const inviterReward = config?.inviterReward || 1;
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styles = {
    section: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      margin: '0 16px 12px',
      borderRadius: 16,
      overflow: 'hidden',
      border: '2px solid rgba(255, 77, 166, 0.4)',
      position: 'relative',
    },
    header: {
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      position: 'relative',
      zIndex: 1,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    iconWrapper: {
      width: 50,
      height: 50,
      borderRadius: 14,
      background: 'linear-gradient(135deg, #ff4da6, #bf5fff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      border: '2px solid rgba(255, 77, 166, 0.6)',
      boxShadow: '0 4px 20px rgba(255, 77, 166, 0.4)',
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.6)',
      margin: 0,
      marginTop: 4,
      fontFamily: "'Rajdhani', sans-serif",
    },
    reward: {
      fontSize: 12,
      color: '#ff4da6',
      fontWeight: '700',
      margin: 0,
      marginTop: 4,
      fontFamily: "'Orbitron', sans-serif",
      textShadow: '0 0 8px rgba(255, 77, 166, 0.4)',
    },
    arrowWrapper: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: expanded ? 'rgba(191, 95, 255, 0.2)' : 'rgba(60, 60, 80, 0.5)',
      border: expanded ? '1px solid rgba(191, 95, 255, 0.4)' : '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    arrow: {
      fontSize: 10,
      color: expanded ? '#bf5fff' : 'rgba(255,255,255,0.4)',
      transition: 'transform 0.3s ease',
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    },
    expandedContent: {
      maxHeight: expanded ? '320px' : '0',
      opacity: expanded ? 1 : 0,
      overflow: 'hidden',
      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
      position: 'relative',
      zIndex: 1,
    },
    statsRow: {
      display: 'flex',
      padding: '0 16px 14px',
      gap: 8,
    },
    statItem: {
      flex: 1,
      textAlign: 'center',
      padding: '10px 6px',
      background: 'rgba(20, 20, 40, 0.6)',
      borderRadius: 10,
      border: '1px solid rgba(191, 95, 255, 0.15)',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
    },
    statLabel: {
      fontSize: 9,
      color: 'rgba(255,255,255,0.4)',
      margin: 0,
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontFamily: "'Rajdhani', sans-serif",
    },
    linkSection: {
      padding: '0 16px 14px',
    },
    linkBox: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: 'rgba(15, 15, 30, 0.6)',
      borderRadius: 10,
      border: '1px solid rgba(0, 229, 255, 0.2)',
    },
    linkText: {
      flex: 1,
      fontSize: 10,
      color: '#00e5ff',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: "'Roboto Mono', monospace",
      letterSpacing: 0.5,
    },
    copyButton: {
      padding: '6px 14px',
      fontSize: 10,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 6,
      border: 'none',
      background: copied
        ? 'linear-gradient(135deg, #39ff14, #00e5ff)'
        : 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: copied
        ? '0 0 12px rgba(57, 255, 20, 0.5)'
        : '0 0 10px rgba(0, 229, 255, 0.3)',
      transition: 'all 0.3s ease',
    },
    shareButton: {
      margin: '0 16px 16px',
      padding: '12px',
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #ff4da6, #bf5fff)',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: 'calc(100% - 32px)',
      boxShadow: '0 0 15px rgba(255, 77, 166, 0.3)',
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.section}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <div style={styles.headerLeft}>
          <div style={styles.iconWrapper}><IconUsers size={22} color="#fff" /></div>
          <div style={styles.textContainer}>
            <p style={styles.title}>{t ? t('invite.title') : 'INVITE FRIENDS'}</p>
            <p style={styles.subtitle}>
              {inviteCount} {t ? t('invite.people') : 'invited'} · <IconDollar size={12} color="#39ff14" />{inviteBonus} · <IconDollar size={12} color="#ffc107" />{commissionBonus.toFixed(2)}
            </p>
            <p style={styles.reward}>+{inviterReward} USDT <IconDollar size={12} color="#39ff14" /></p>
          </div>
        </div>
        <div style={styles.arrowWrapper}>
          <span style={styles.arrow}>▼</span>
        </div>
      </div>

      <div style={styles.expandedContent}>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <p style={{ ...styles.statValue, color: '#00e5ff' }}>{inviteCount}</p>
            <p style={styles.statLabel}>{t ? t('invite.inviteCount') : 'Invited'}</p>
          </div>
          <div style={styles.statItem}>
            <p style={{ ...styles.statValue, color: '#39ff14' }}>+{inviteBonus}</p>
            <p style={styles.statLabel}>{t ? t('invite.inviteBonus') : 'Bonus'}</p>
          </div>
          <div style={styles.statItem}>
            <p style={{ ...styles.statValue, color: '#ffc107' }}>+{commissionBonus.toFixed(2)}</p>
            <p style={styles.statLabel}>{t ? t('invite.commissionBonus') : 'Commission'}</p>
          </div>
        </div>

        <div style={styles.linkSection}>
          <div style={styles.linkBox}>
            <p style={styles.linkText}>{inviteLink}</p>
            <button style={styles.copyButton} onClick={handleCopy}>
              {copied ? <IconCheck size={12} color="#000" /> : 'COPY'}
            </button>
          </div>
        </div>

        <button style={styles.shareButton} onClick={onShare}>
          <IconShare size={18} color="#fff" />
          <span>{t ? t('invite.shareToTg') : 'SHARE'}</span>
        </button>
      </div>
    </div>
  );
}
