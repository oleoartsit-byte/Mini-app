export function WalletCard({ wallet, onWithdraw, theme, t }) {
  const balances = wallet?.balances || { usdt: 0 };
  const usdtBalance = balances.usdt || 0;

  const styles = {
    section: {
      backgroundColor: theme.bg,
      margin: '0 16px 20px',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `1px solid ${theme.secondaryBg}`,
    },
    // 顶部标题区域
    header: {
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: `1px solid ${theme.secondaryBg}`,
    },
    iconWrapper: {
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
    textContainer: {
      flex: 1,
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
    // 余额显示区域
    balanceSection: {
      padding: '20px 16px',
      textAlign: 'center',
    },
    balanceRow: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 8,
    },
    balanceValue: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.text,
    },
    balanceUnit: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.hint,
    },
    balanceSubtext: {
      fontSize: 12,
      color: theme.hint,
      marginTop: 6,
    },
    // 按钮区域
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
    // 底部提示
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
  };

  return (
    <div style={styles.section}>
      {/* 顶部 */}
      <div style={styles.header}>
        <div style={styles.iconWrapper}>💵</div>
        <div style={styles.textContainer}>
          <p style={styles.title}>{t ? t('wallet.title') : '我的钱包'}</p>
          <p style={styles.subtitle}>USDT {t ? t('wallet.balance') : '余额'}</p>
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
  );
}
