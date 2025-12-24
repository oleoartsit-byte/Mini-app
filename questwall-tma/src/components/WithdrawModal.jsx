import { useState, useEffect } from 'react';
import { IconDollar, IconClock, IconHistory, IconCheck, IconWithdraw, IconTarget, IconInfo, IconStar } from './icons/CyberpunkIcons';

// USDT 配置 - 青色赛博朋克主题
const USDT_CONFIG = {
  icon: 'dollar',
  name: 'USDT',
  minAmount: 5,
  color: '#00e5ff',
  gradient: 'linear-gradient(135deg, #00e5ff 0%, #bf5fff 100%)',
};

// 提现状态配置
const WITHDRAW_STATUS = {
  PENDING: { label: '待审核', color: '#FFA500', iconType: 'clock' },
  PROCESSING: { label: '处理中', color: '#2196F3', iconType: 'history' },
  COMPLETED: { label: '已完成', color: '#4CAF50', iconType: 'check' },
  REJECTED: { label: '已拒绝', color: '#f44336', iconType: 'withdraw' },
};

// 获取状态图标
const getStatusIcon = (iconType, color) => {
  const size = 12;
  switch (iconType) {
    case 'clock': return <IconClock size={size} color={color} />;
    case 'history': return <IconHistory size={size} color={color} />;
    case 'check': return <IconCheck size={size} color={color} />;
    case 'withdraw': return <IconWithdraw size={size} color={color} />;
    default: return null;
  }
};

export function WithdrawModal({ visible, onClose, wallet, onWithdraw, t, api }) {
  const [step, setStep] = useState('form'); // form | success | history
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitResult, setSubmitResult] = useState(null);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 加载提现历史
  const loadHistory = async () => {
    if (!api) return;
    setLoadingHistory(true);
    try {
      const result = await api.getPayoutHistory();
      if (result.items) {
        // 只显示 USDT 的提现记录
        setWithdrawHistory(result.items.filter(item => item.asset === 'USDT'));
      }
    } catch (err) {
      console.error('加载提现历史失败:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (visible && step === 'history') {
      loadHistory();
    }
  }, [visible, step]);

  // 重置状态
  const handleClose = () => {
    setStep('form');
    setAmount('');
    setAddress('');
    setError('');
    setSubmitResult(null);
    onClose();
  };

  if (!visible) return null;

  const balances = wallet?.balances || { stars: 0, ton: 0, usdt: 0 };
  const currentBalance = balances.usdt || 0;
  const minAmount = USDT_CONFIG.minAmount;
  const assetColor = USDT_CONFIG.color;
  const assetGradient = USDT_CONFIG.gradient;

  // 计算预计到账金额（无手续费）
  const calculateActualAmount = (amt) => {
    const num = parseFloat(amt) || 0;
    return num.toFixed(2);
  };

  const handleSubmit = async () => {
    setError('');

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setError(t ? t('withdraw.errorAmount') : '请输入有效金额');
      return;
    }

    if (amountNum < minAmount) {
      setError(t ? t('withdraw.errorMinAmount', { min: minAmount, asset: 'USDT' }) : `最低提现金额为 ${minAmount} USDT`);
      return;
    }

    if (amountNum > currentBalance) {
      setError(t ? t('withdraw.errorBalance') : '余额不足');
      return;
    }

    if (!address.trim()) {
      setError(t ? t('withdraw.errorAddress') : '请输入收款地址');
      return;
    }

    // 验证地址格式 (TRC20 或 ERC20)
    const trimmedAddress = address.trim();
    const isTRC20 = trimmedAddress.startsWith('T') && trimmedAddress.length === 34;
    const isERC20 = trimmedAddress.startsWith('0x') && trimmedAddress.length === 42;

    if (!isTRC20 && !isERC20) {
      setError(t ? t('withdraw.errorAddressFormat') : '请输入有效的 TRC20 或 ERC20 地址');
      return;
    }

    setLoading(true);
    try {
      const result = await onWithdraw('USDT', amountNum, trimmedAddress);
      if (result.success) {
        setSubmitResult(result);
        setStep('success');
      } else {
        setError(result.message || (t ? t('withdraw.errorFailed') : '提现申请失败'));
      }
    } catch (err) {
      setError(t ? t('withdraw.errorNetwork') : '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease',
    },
    modal: {
      width: '100%',
      maxWidth: 500,
      background: 'linear-gradient(145deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
      borderRadius: '24px 24px 0 0',
      padding: '0 20px 20px',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
      animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderBottom: 'none',
    },
    dragIndicator: {
      width: 36,
      height: 4,
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      borderRadius: 2,
      margin: '12px auto 16px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    titleWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    titleIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: assetGradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 20,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    // Tab 切换
    tabWrapper: {
      display: 'flex',
      gap: 8,
      marginBottom: 20,
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 12,
      padding: 4,
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    tab: {
      flex: 1,
      padding: '10px 16px',
      border: 'none',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    // 余额显示
    balanceCard: {
      background: assetGradient,
      borderRadius: 16,
      padding: '20px',
      marginBottom: 20,
      color: '#000',
      boxShadow: '0 4px 20px rgba(0, 229, 255, 0.3)',
    },
    balanceLabel: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: '600',
      opacity: 0.8,
      marginBottom: 4,
    },
    balanceValue: {
      fontSize: 32,
      fontWeight: '700',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
    },
    balanceUnit: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      opacity: 0.8,
    },
    // 金额输入区域
    amountSection: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 16,
      padding: '16px',
      marginBottom: 16,
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    amountLabel: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: 8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    amountInputWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    amountInput: {
      flex: 1,
      fontSize: 32,
      fontWeight: '500',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      color: '#fff',
      padding: 0,
      WebkitTextFillColor: '#fff',
    },
    assetBadge: {
      padding: '6px 12px',
      borderRadius: 8,
      background: assetGradient,
      color: '#000',
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
    },
    maxButton: {
      padding: '4px 10px',
      borderRadius: 6,
      border: '1px solid rgba(0, 229, 255, 0.4)',
      background: 'rgba(0, 229, 255, 0.1)',
      color: '#00e5ff',
      fontSize: 11,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginLeft: 8,
    },
    // 地址输入
    addressSection: {
      marginBottom: 16,
    },
    addressLabel: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    addressInput: {
      width: '100%',
      padding: '14px 16px',
      fontSize: 14,
      fontFamily: "'Roboto Mono', monospace",
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      outline: 'none',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box',
    },
    addressHint: {
      fontSize: 11,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      marginTop: 6,
    },
    // 提现信息卡片
    infoCard: {
      background: `linear-gradient(135deg, ${assetColor}15 0%, ${assetColor}05 100%)`,
      borderRadius: 16,
      padding: '16px',
      marginBottom: 16,
      border: `1px solid ${assetColor}20`,
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
    },
    infoRowBorder: {
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    infoLabel: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    infoValue: {
      fontSize: 14,
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      fontWeight: '600',
    },
    infoHighlight: {
      color: '#39ff14',
      fontWeight: '700',
      textShadow: '0 0 8px rgba(57, 255, 20, 0.3)',
    },
    // 错误提示
    errorBox: {
      background: 'rgba(255, 77, 166, 0.1)',
      border: '1px solid rgba(255, 77, 166, 0.3)',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    errorText: {
      color: '#ff4da6',
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: '500',
      margin: 0,
    },
    // 提交按钮
    submitButton: {
      width: '100%',
      padding: '16px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 14,
      border: 'none',
      background: assetGradient,
      color: '#000',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      boxShadow: `0 4px 16px ${assetColor}40`,
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    loadingSpinner: {
      width: 18,
      height: 18,
      border: '2px solid rgba(0,0,0,0.3)',
      borderTopColor: '#000',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    // 成功页面
    successWrapper: {
      textAlign: 'center',
      padding: '20px 0',
    },
    successIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      marginBottom: 8,
      textShadow: '0 0 10px rgba(57, 255, 20, 0.3)',
    },
    successMessage: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: 24,
      lineHeight: 1.6,
    },
    successDetail: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 20,
      textAlign: 'left',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    successDetailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    successDetailLabel: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    successDetailValue: {
      fontSize: 13,
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      fontWeight: '600',
    },
    // 历史记录
    historyList: {
      maxHeight: 400,
      overflowY: 'auto',
    },
    historyItem: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 10,
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    historyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    historyAmount: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
    },
    historyStatus: {
      fontSize: 11,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      padding: '4px 8px',
      borderRadius: 6,
    },
    historyAddress: {
      fontSize: 12,
      fontFamily: "'Roboto Mono', monospace",
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: 4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    historyTime: {
      fontSize: 11,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    emptyHistory: {
      textAlign: 'center',
      padding: '40px 20px',
      color: 'rgba(255, 255, 255, 0.6)',
      fontFamily: "'Rajdhani', sans-serif",
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    // 底部提示
    noteWrapper: {
      marginTop: 16,
      textAlign: 'center',
    },
    note: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      lineHeight: 1.5,
    },
    secondaryButton: {
      width: '100%',
      padding: '16px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 14,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 10,
    },
  };

  // 渲染表单
  const renderForm = () => (
    <>
      {/* 余额卡片 */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLabel}>{t ? t('withdraw.withdrawableBalance') : '可提现余额'}</div>
        <div style={styles.balanceValue}>
          {currentBalance.toFixed(2)}
          <span style={styles.balanceUnit}>USDT</span>
        </div>
      </div>

      {/* 金额输入 */}
      <div style={styles.amountSection}>
        <div style={styles.amountLabel}>
          <span>{t ? t('withdraw.amount') : '提现金额'}</span>
          <button
            style={styles.maxButton}
            onClick={() => {
              setAmount(currentBalance.toFixed(2));
              setError('');
            }}
          >
            {t ? t('withdraw.max') : '全部'}
          </button>
        </div>
        <div style={styles.amountInputWrapper}>
          <input
            type="number"
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
          />
          <span style={styles.assetBadge}>USDT</span>
        </div>
      </div>

      {/* 地址输入 */}
      <div style={styles.addressSection}>
        <label style={styles.addressLabel}>
          <IconTarget size={14} color="#00e5ff" />
          {t ? t('withdraw.recipientAddress') : '收款地址'}
        </label>
        <input
          type="text"
          style={styles.addressInput}
          placeholder={t ? t('withdraw.addressPlaceholderFull') : '输入 TRC20 或 ERC20 钱包地址'}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = '#00e5ff'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        <div style={styles.addressHint}>
          {t ? t('withdraw.addressHint') : '支持 TRC20 (T开头) 和 ERC20 (0x开头) 地址'}
        </div>
      </div>

      {/* 提现信息 */}
      <div style={styles.infoCard}>
        <div style={{ ...styles.infoRow, ...styles.infoRowBorder }}>
          <span style={styles.infoLabel}>
            <IconClock size={14} color="#00e5ff" />
            {t ? t('withdraw.minAmount') : '最低提现'}
          </span>
          <span style={styles.infoValue}>{minAmount} USDT</span>
        </div>
        <div style={{ ...styles.infoRow, ...styles.infoRowBorder }}>
          <span style={styles.infoLabel}>
            <IconDollar size={14} color="#00e5ff" />
            {t ? t('withdraw.fee') : '手续费'}
          </span>
          <span style={{ ...styles.infoValue, color: '#39ff14' }}>{t ? t('withdraw.feeAmount') : '免费'}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>
            <IconStar size={14} color="#00e5ff" />
            {t ? t('withdraw.estimatedArrival') : '预计到账'}
          </span>
          <span style={{ ...styles.infoValue, ...styles.infoHighlight }}>
            {calculateActualAmount(amount)} USDT
          </span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={styles.errorBox}>
          <IconInfo size={16} color="#ff4da6" />
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* 提交按钮 */}
      <button
        style={styles.submitButton}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <div style={styles.loadingSpinner} />
            {t ? t('withdraw.submitting') : '提交中...'}
          </>
        ) : (
          <>
            <IconWithdraw size={16} color="#000" />
            {t ? t('withdraw.submitWithdraw') : '提交提现申请'}
          </>
        )}
      </button>

      {/* 底部提示 */}
      <div style={styles.noteWrapper}>
        <p style={styles.note}>
          <IconInfo size={12} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: 4, verticalAlign: 'middle' }} /> {t ? t('withdraw.noteFull') : '提现申请提交后，将由客服人员审核并手动转账，预计 1-3 个工作日内处理'}
        </p>
      </div>
    </>
  );

  // 渲染成功页面
  const renderSuccess = () => (
    <div style={styles.successWrapper}>
      <div style={styles.successIcon}><IconCheck size={64} color="#39ff14" /></div>
      <div style={styles.successTitle}>{t ? t('withdraw.successTitle') : '提现申请已提交'}</div>
      <div style={styles.successMessage}>
        {t ? t('withdraw.successMessage') : '您的提现申请已成功提交，正在等待审核。审核通过后，客服将在 1-3 个工作日内为您转账。'}
      </div>

      {submitResult && (
        <div style={styles.successDetail}>
          <div style={styles.successDetailRow}>
            <span style={styles.successDetailLabel}>{t ? t('withdraw.requestedAmount') : '申请金额'}</span>
            <span style={styles.successDetailValue}>{submitResult.requestedAmount} USDT</span>
          </div>
          <div style={styles.successDetailRow}>
            <span style={styles.successDetailLabel}>{t ? t('withdraw.fee') : '手续费'}</span>
            <span style={{ ...styles.successDetailValue, color: '#39ff14' }}>{t ? t('withdraw.feeAmount') : '免费'}</span>
          </div>
          <div style={{ ...styles.successDetailRow, borderBottom: 'none' }}>
            <span style={styles.successDetailLabel}>{t ? t('withdraw.estimatedArrival') : '预计到账'}</span>
            <span style={{ ...styles.successDetailValue, color: assetColor }}>
              {submitResult.actualAmount || submitResult.requestedAmount} USDT
            </span>
          </div>
        </div>
      )}

      <button
        style={styles.submitButton}
        onClick={() => {
          setStep('history');
          loadHistory();
        }}
      >
        <IconHistory size={16} color="#000" />
        {t ? t('withdraw.viewHistory') : '查看提现记录'}
      </button>

      <button
        style={styles.secondaryButton}
        onClick={handleClose}
      >
        {t ? t('withdraw.close') : '关闭'}
      </button>
    </div>
  );

  // 渲染历史记录
  const renderHistory = () => (
    <>
      {loadingHistory ? (
        <div style={styles.emptyHistory}>
          <div style={styles.loadingSpinner} />
          <div style={{ marginTop: 12 }}>{t ? t('withdraw.loading') : '加载中...'}</div>
        </div>
      ) : withdrawHistory.length === 0 ? (
        <div style={styles.emptyHistory}>
          <div style={styles.emptyIcon}><IconHistory size={48} color="rgba(255, 255, 255, 0.3)" /></div>
          <div>{t ? t('withdraw.noHistory') : '暂无提现记录'}</div>
        </div>
      ) : (
        <div style={styles.historyList}>
          {withdrawHistory.map((item) => {
            const status = WITHDRAW_STATUS[item.status] || WITHDRAW_STATUS.PENDING;
            return (
              <div key={item.id} style={styles.historyItem}>
                <div style={styles.historyHeader}>
                  <span style={styles.historyAmount}>
                    {parseFloat(item.amount).toFixed(2)} USDT
                  </span>
                  <span style={{
                    ...styles.historyStatus,
                    backgroundColor: status.color + '20',
                    color: status.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    {getStatusIcon(status.iconType, status.color)} {t ? t(`withdraw.status.${item.status.toLowerCase()}`) || status.label : status.label}
                  </span>
                </div>
                <div style={styles.historyAddress}>
                  {t ? t('withdraw.toAddress') : '收款地址'}: {item.toAddress}
                </div>
                <div style={styles.historyTime}>
                  {t ? t('withdraw.applyTime') : '申请时间'}: {new Date(item.createdAt).toLocaleString()}
                </div>
                {item.processedAt && (
                  <div style={styles.historyTime}>
                    {t ? t('withdraw.processTime') : '处理时间'}: {new Date(item.processedAt).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        style={styles.secondaryButton}
        onClick={() => setStep('form')}
      >
        {t ? t('withdraw.backToWithdraw') : '返回提现'}
      </button>
    </>
  );

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 拖动指示条 */}
        <div style={styles.dragIndicator} />

        {/* 标题栏 */}
        <div style={styles.header}>
          <div style={styles.titleWrapper}>
            <div style={styles.titleIcon}><IconDollar size={18} color="#fff" /></div>
            <h3 style={styles.title}>
              {step === 'history' ? (t ? t('withdraw.historyTitle') : '提现记录') : step === 'success' ? (t ? t('withdraw.submitSuccess') : '提交成功') : (t ? t('withdraw.usdtTitle') : 'USDT 提现')}
            </h3>
          </div>
          <button style={styles.closeButton} onClick={handleClose}>×</button>
        </div>

        {/* Tab 切换 (仅在表单页显示) */}
        {step === 'form' && (
          <div style={styles.tabWrapper}>
            <button
              style={{
                ...styles.tab,
                background: 'form' === step ? assetGradient : 'transparent',
                color: 'form' === step ? '#000' : 'rgba(255, 255, 255, 0.5)',
              }}
              onClick={() => setStep('form')}
            >
              {t ? t('withdraw.tabWithdraw') : '提现'}
            </button>
            <button
              style={{
                ...styles.tab,
                background: 'history' === step ? assetGradient : 'transparent',
                color: 'history' === step ? '#000' : 'rgba(255, 255, 255, 0.5)',
              }}
              onClick={() => {
                setStep('history');
                loadHistory();
              }}
            >
              {t ? t('withdraw.tabHistory') : '记录'}
            </button>
          </div>
        )}

        {/* 根据步骤渲染不同内容 */}
        {step === 'form' && renderForm()}
        {step === 'success' && renderSuccess()}
        {step === 'history' && renderHistory()}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        input::placeholder {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
