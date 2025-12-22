import React, { useState, useEffect } from 'react';

// USDT 配置
const USDT_CONFIG = {
  icon: '💵',
  name: 'USDT',
  minAmount: 5,
  color: '#26A17B',
  gradient: 'linear-gradient(135deg, #26A17B 0%, #3CB371 100%)',
};

// 提现状态配置
const WITHDRAW_STATUS = {
  PENDING: { label: '待审核', color: '#FFA500', icon: '⏳' },
  PROCESSING: { label: '处理中', color: '#2196F3', icon: '🔄' },
  COMPLETED: { label: '已完成', color: '#4CAF50', icon: '✅' },
  REJECTED: { label: '已拒绝', color: '#f44336', icon: '❌' },
};

export function WithdrawModal({ visible, onClose, wallet, onWithdraw, theme, t, api }) {
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
      setError('请输入有效的 TRC20 或 ERC20 地址');
      return;
    }

    setLoading(true);
    try {
      const result = await onWithdraw('USDT', amountNum, trimmedAddress);
      if (result.success) {
        setSubmitResult(result);
        setStep('success');
      } else {
        setError(result.message || '提现申请失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
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
      backgroundColor: 'rgba(0,0,0,0.6)',
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
      backgroundColor: theme.bg,
      borderRadius: '24px 24px 0 0',
      padding: '0 20px 20px',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
      animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    dragIndicator: {
      width: 36,
      height: 4,
      backgroundColor: theme.hint + '40',
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
      color: theme.text,
      margin: 0,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      backgroundColor: theme.secondaryBg,
      border: 'none',
      color: theme.hint,
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
      backgroundColor: theme.secondaryBg,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      padding: '10px 16px',
      border: 'none',
      borderRadius: 10,
      fontSize: 14,
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    // 余额显示
    balanceCard: {
      background: assetGradient,
      borderRadius: 16,
      padding: '20px',
      marginBottom: 20,
      color: '#fff',
    },
    balanceLabel: {
      fontSize: 12,
      opacity: 0.9,
      marginBottom: 4,
    },
    balanceValue: {
      fontSize: 32,
      fontWeight: '700',
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
    },
    balanceUnit: {
      fontSize: 16,
      opacity: 0.9,
    },
    // 金额输入区域
    amountSection: {
      backgroundColor: theme.secondaryBg,
      borderRadius: 16,
      padding: '16px',
      marginBottom: 16,
    },
    amountLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.hint,
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
      fontSize: 28,
      fontWeight: '700',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      color: theme.text,
      padding: 0,
    },
    assetBadge: {
      padding: '6px 12px',
      borderRadius: 8,
      background: assetGradient,
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    maxButton: {
      padding: '4px 10px',
      borderRadius: 6,
      border: `1px solid ${theme.hint}50`,
      backgroundColor: theme.secondaryBg,
      color: theme.text,
      fontSize: 12,
      fontWeight: '600',
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
      color: theme.hint,
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    addressInput: {
      width: '100%',
      padding: '14px 16px',
      fontSize: 14,
      border: `1px solid ${theme.hint}30`,
      borderRadius: 12,
      outline: 'none',
      backgroundColor: theme.secondaryBg,
      color: theme.text,
      fontFamily: 'monospace',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box',
    },
    addressHint: {
      fontSize: 11,
      color: theme.hint,
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
      borderBottom: `1px solid ${theme.hint}15`,
    },
    infoLabel: {
      fontSize: 13,
      color: theme.hint,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    infoValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    infoHighlight: {
      color: assetColor,
      fontWeight: '700',
    },
    // 错误提示
    errorBox: {
      backgroundColor: '#ff444415',
      border: '1px solid #ff444430',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    errorText: {
      color: '#ff4444',
      fontSize: 13,
      fontWeight: '500',
      margin: 0,
    },
    // 提交按钮
    submitButton: {
      width: '100%',
      padding: '16px',
      fontSize: 16,
      fontWeight: '700',
      borderRadius: 14,
      border: 'none',
      background: assetGradient,
      color: '#fff',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      boxShadow: `0 4px 16px ${assetColor}40`,
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    loadingSpinner: {
      width: 18,
      height: 18,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
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
      color: theme.text,
      marginBottom: 8,
    },
    successMessage: {
      fontSize: 14,
      color: theme.hint,
      marginBottom: 24,
      lineHeight: 1.6,
    },
    successDetail: {
      backgroundColor: theme.secondaryBg,
      borderRadius: 12,
      padding: '16px',
      marginBottom: 20,
      textAlign: 'left',
    },
    successDetailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${theme.hint}15`,
    },
    successDetailLabel: {
      fontSize: 13,
      color: theme.hint,
    },
    successDetailValue: {
      fontSize: 13,
      color: theme.text,
      fontWeight: '600',
    },
    // 历史记录
    historyList: {
      maxHeight: 400,
      overflowY: 'auto',
    },
    historyItem: {
      backgroundColor: theme.secondaryBg,
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 10,
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
      color: theme.text,
    },
    historyStatus: {
      fontSize: 12,
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: 6,
    },
    historyAddress: {
      fontSize: 12,
      color: theme.hint,
      fontFamily: 'monospace',
      marginBottom: 4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    historyTime: {
      fontSize: 11,
      color: theme.hint,
    },
    emptyHistory: {
      textAlign: 'center',
      padding: '40px 20px',
      color: theme.hint,
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
      color: theme.hint,
      lineHeight: 1.5,
    },
  };

  // 渲染表单
  const renderForm = () => (
    <>
      {/* 余额卡片 */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLabel}>可提现余额</div>
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
          <span>📍</span>
          收款地址
        </label>
        <input
          type="text"
          style={styles.addressInput}
          placeholder="输入 TRC20 或 ERC20 钱包地址"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = assetColor}
          onBlur={(e) => e.target.style.borderColor = theme.hint + '30'}
        />
        <div style={styles.addressHint}>
          支持 TRC20 (T开头) 和 ERC20 (0x开头) 地址
        </div>
      </div>

      {/* 提现信息 */}
      <div style={styles.infoCard}>
        <div style={{ ...styles.infoRow, ...styles.infoRowBorder }}>
          <span style={styles.infoLabel}>
            <span>📊</span>
            最低提现
          </span>
          <span style={styles.infoValue}>{minAmount} USDT</span>
        </div>
        <div style={{ ...styles.infoRow, ...styles.infoRowBorder }}>
          <span style={styles.infoLabel}>
            <span>💰</span>
            手续费
          </span>
          <span style={{ ...styles.infoValue, color: '#4CAF50' }}>免费</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>
            <span>✨</span>
            预计到账
          </span>
          <span style={{ ...styles.infoValue, ...styles.infoHighlight }}>
            {calculateActualAmount(amount)} USDT
          </span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span>
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
            提交中...
          </>
        ) : (
          <>
            <span>📤</span>
            提交提现申请
          </>
        )}
      </button>

      {/* 底部提示 */}
      <div style={styles.noteWrapper}>
        <p style={styles.note}>
          💡 提现申请提交后，将由客服人员审核并手动转账，预计 1-3 个工作日内处理
        </p>
      </div>
    </>
  );

  // 渲染成功页面
  const renderSuccess = () => (
    <div style={styles.successWrapper}>
      <div style={styles.successIcon}>✅</div>
      <div style={styles.successTitle}>提现申请已提交</div>
      <div style={styles.successMessage}>
        您的提现申请已成功提交，正在等待审核。<br/>
        审核通过后，客服将在 1-3 个工作日内为您转账。
      </div>

      {submitResult && (
        <div style={styles.successDetail}>
          <div style={styles.successDetailRow}>
            <span style={styles.successDetailLabel}>申请金额</span>
            <span style={styles.successDetailValue}>{submitResult.requestedAmount} USDT</span>
          </div>
          <div style={styles.successDetailRow}>
            <span style={styles.successDetailLabel}>手续费</span>
            <span style={{ ...styles.successDetailValue, color: '#4CAF50' }}>免费</span>
          </div>
          <div style={{ ...styles.successDetailRow, borderBottom: 'none' }}>
            <span style={styles.successDetailLabel}>预计到账</span>
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
        <span>📋</span>
        查看提现记录
      </button>

      <button
        style={{
          ...styles.submitButton,
          background: theme.secondaryBg,
          color: theme.text,
          boxShadow: 'none',
          marginTop: 10,
        }}
        onClick={handleClose}
      >
        关闭
      </button>
    </div>
  );

  // 渲染历史记录
  const renderHistory = () => (
    <>
      {loadingHistory ? (
        <div style={styles.emptyHistory}>
          <div style={styles.loadingSpinner} />
          <div style={{ marginTop: 12 }}>加载中...</div>
        </div>
      ) : withdrawHistory.length === 0 ? (
        <div style={styles.emptyHistory}>
          <div style={styles.emptyIcon}>📭</div>
          <div>暂无提现记录</div>
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
                  }}>
                    {status.icon} {status.label}
                  </span>
                </div>
                <div style={styles.historyAddress}>
                  收款地址: {item.toAddress}
                </div>
                <div style={styles.historyTime}>
                  申请时间: {new Date(item.createdAt).toLocaleString()}
                </div>
                {item.processedAt && (
                  <div style={styles.historyTime}>
                    处理时间: {new Date(item.processedAt).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        style={{
          ...styles.submitButton,
          background: theme.secondaryBg,
          color: theme.text,
          boxShadow: 'none',
          marginTop: 16,
        }}
        onClick={() => setStep('form')}
      >
        返回提现
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
            <div style={styles.titleIcon}>💵</div>
            <h3 style={styles.title}>
              {step === 'history' ? '提现记录' : step === 'success' ? '提交成功' : 'USDT 提现'}
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
                backgroundColor: 'form' === step ? assetColor : 'transparent',
                color: 'form' === step ? '#fff' : theme.hint,
              }}
              onClick={() => setStep('form')}
            >
              提现
            </button>
            <button
              style={{
                ...styles.tab,
                backgroundColor: 'history' === step ? assetColor : 'transparent',
                color: 'history' === step ? '#fff' : theme.hint,
              }}
              onClick={() => {
                setStep('history');
                loadHistory();
              }}
            >
              记录
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
      `}</style>
    </div>
  );
}
