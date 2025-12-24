import { useState } from 'react';
import { IconDollar, IconWithdraw, IconClock } from './icons/CyberpunkIcons';

export function WalletCard({ wallet, onWithdraw, t }) {
  const balances = wallet?.balances || { usdt: 0 };
  const usdtBalance = balances.usdt || 0;
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    // 外层容器 - 彩虹边框效果
    wrapper: {
      margin: '0 16px 20px',
      padding: 2,
      borderRadius: 18,
      background: 'linear-gradient(45deg, #00e5ff, #bf5fff, #ff4da6, #39ff14, #ffe135, #00e5ff, #bf5fff, #ff4da6, #39ff14, #ffe135, #00e5ff)',
      backgroundSize: '400% 400%',
      animation: 'rainbowBorder 8s linear infinite',
      position: 'relative',
    },
    // 内层容器
    container: {
      background: 'linear-gradient(145deg, rgba(20, 20, 40, 0.98), rgba(15, 15, 35, 0.98))',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
    },
    // 内层发光叠加
    innerGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 16,
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 229, 255, 0.1) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
    // 扫描光线效果
    scanLine: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      animation: isHovered ? 'cardShine 1.5s ease-out' : 'none',
      pointerEvents: 'none',
      zIndex: 10,
    },
    // 顶部标题区域
    header: {
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
      position: 'relative',
      zIndex: 1,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.3), rgba(0, 229, 255, 0.2))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      border: '1px solid rgba(57, 255, 20, 0.4)',
      boxShadow: '0 0 15px rgba(57, 255, 20, 0.2)',
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)',
      margin: 0,
      marginTop: 4,
      fontFamily: "'Rajdhani', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    // 余额显示区域 - 渐变边框
    balanceSection: {
      margin: '16px',
      padding: '24px 16px',
      textAlign: 'center',
      position: 'relative',
      zIndex: 1,
      background: 'rgba(30, 30, 50, 0.5)',
      borderRadius: 12,
      border: '1px solid rgba(0, 229, 255, 0.2)',
    },
    // 顶部高亮线
    balanceHighlight: {
      position: 'absolute',
      top: 0,
      left: '10%',
      right: '10%',
      height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.6), transparent)',
    },
    balanceRow: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 10,
    },
    balanceValue: {
      fontSize: 42,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#39ff14',
      textShadow: '0 0 20px rgba(57, 255, 20, 0.5)',
      letterSpacing: 2,
    },
    balanceUnit: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: 'rgba(255,255,255,0.6)',
      textTransform: 'uppercase',
    },
    balanceSubtext: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.4)',
      marginTop: 8,
      fontFamily: "'Rajdhani', sans-serif",
      letterSpacing: 1,
    },
    // 按钮区域
    actionsSection: {
      padding: '0 16px 16px',
      position: 'relative',
      zIndex: 1,
    },
    withdrawButton: {
      width: '100%',
      padding: '16px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #39ff14, #00e5ff)',
      color: '#000',
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(57, 255, 20, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    // 底部提示
    noteSection: {
      padding: '14px 16px',
      background: 'rgba(15, 15, 30, 0.6)',
      borderTop: '1px solid rgba(0, 229, 255, 0.1)',
      position: 'relative',
      zIndex: 1,
    },
    note: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.4)',
      margin: 0,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: "'Rajdhani', sans-serif",
    },
    noteIcon: {
      color: '#00e5ff',
    },
  };

  return (
    <div
      style={styles.wrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.container}>
        {/* 内层发光 */}
        <div style={styles.innerGlow} />

        {/* 扫描光线 */}
        <div style={styles.scanLine} />

        {/* 顶部 */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}><IconDollar size={22} color="#39ff14" /></div>
          <div style={styles.textContainer}>
            <p style={styles.title}>{t ? t('wallet.title') : 'MY WALLET'}</p>
            <p style={styles.subtitle}>USDT {t ? t('wallet.balance') : 'Balance'}</p>
          </div>
        </div>

        {/* 余额 */}
        <div style={styles.balanceSection}>
          <div style={styles.balanceHighlight} />
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
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.3)';
            }}
          >
            <IconWithdraw size={18} color="#000" />
            <span>{t ? t('wallet.withdraw') : 'WITHDRAW'}</span>
          </button>
        </div>

        {/* 提示 */}
        <div style={styles.noteSection}>
          <p style={styles.note}>
            <span style={styles.noteIcon}><IconClock size={14} color="#00e5ff" /></span>
            <span>{t ? t('wallet.withdrawNote') : 'Withdrawal requests processed in 1-3 business days'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
