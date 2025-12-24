import { useState, useEffect } from 'react';
import { AnimatedButton } from './PageTransition';
import { IconTwitter, IconCheck } from './icons/CyberpunkIcons';

export function TwitterBindModal({ isOpen, onClose, api, onBindSuccess, onUnbindSuccess, t }) {
  // step: input | verification | posted | verifying | success | error | bound
  const [step, setStep] = useState('input');
  const [hasPosted, setHasPosted] = useState(false);  // 用户是否已点击发布推文
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [message, setMessage] = useState('');
  const [boundInfo, setBoundInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  // 获取当前绑定状态
  useEffect(() => {
    if (isOpen && api) {
      api.getTwitterStatus().then(status => {
        if (status.bound) {
          setBoundInfo({
            username: status.twitterUsername,
            id: status.twitterId,
          });
          setStep('bound');
        } else {
          setStep('input');
          setBoundInfo(null);
          setMessage('');
          setUsername('');
          setVerificationCode('');
          setHasPosted(false);
        }
      });
    }
  }, [isOpen, api]);

  // 获取验证码
  const handleGetCode = async () => {
    if (!username.trim()) {
      setMessage(t ? t('twitter.enterUsername') : '请输入 Twitter 用户名');
      return;
    }

    setStep('verifying');
    setMessage(t ? t('twitter.gettingCode') : '正在获取验证码...');

    const result = await api.getTwitterVerificationCode();

    if (result.success) {
      setVerificationCode(result.code);
      setCodeExpiresAt(new Date(result.expiresAt));
      setStep('verification');
      setMessage('');
    } else {
      setStep('input');
      setMessage(result.message || (t ? t('twitter.getCodeFailed') : '获取验证码失败'));
    }
  };

  // 复制验证码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 打开 Twitter 帖子页面，让用户自己引用转发
  const handleOpenTwitterPost = () => {
    // 直接跳转到目标推文页面（测试用，后续换成官方账号推文）
    const targetTweetUrl = 'https://x.com/MoSalah/status/2003237101740130408';

    // 使用 Telegram WebApp API 打开外部链接（更好的控制）
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(targetTweetUrl);
    } else {
      window.open(targetTweetUrl, '_blank');
    }

    // 标记用户已点击，切换到验证步骤
    setHasPosted(true);
    setStep('posted');
  };

  // 验证并绑定
  const handleVerifyAndBind = async () => {
    setStep('verifying');
    setMessage(t ? t('twitter.verifying') : '正在验证推文...');

    const result = await api.verifyAndBindTwitter(username.trim());

    if (result.success) {
      setStep('success');
      setMessage(t ? t('twitter.bindSuccess') : `成功绑定 @${result.twitter?.username || username}`);
      setBoundInfo({
        username: result.twitter?.username || username,
        id: result.twitter?.id,
      });
      setTimeout(() => {
        onBindSuccess?.();
        onClose();
      }, 1500);
    } else {
      setStep('posted');  // 验证失败回到 posted 步骤，不要回到 verification
      // 如果是已被其他用户绑定过的错误，使用特定的提示
      if (result.code === 'TWITTER_ALREADY_OWNED') {
        setMessage(t ? t('twitter.alreadyOwned') : result.message);
      } else {
        setMessage(result.message || (t ? t('twitter.bindFailed') : '绑定失败'));
      }
    }
  };

  // 解绑
  const handleUnbind = async () => {
    setStep('verifying');
    setMessage(t ? t('twitter.unbinding') : '正在解绑...');

    const result = await api.unbindTwitter();

    if (result.success) {
      setBoundInfo(null);
      setStep('input');
      setUsername('');
      setVerificationCode('');
      setMessage('');
      onUnbindSuccess?.();
    } else {
      setStep('bound');
      setMessage(result.message || (t ? t('twitter.unbindFailed') : '解绑失败'));
    }
  };

  // 返回上一步
  const handleBack = () => {
    setStep('input');
    setMessage('');
    setVerificationCode('');
    setHasPosted(false);
  };

  if (!isOpen) return null;

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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    },
    content: {
      background: 'linear-gradient(145deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 360,
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 0 30px rgba(0, 229, 255, 0.1)',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      marginBottom: 8,
      textAlign: 'center',
      textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.5)',
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 1.5,
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 20,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
    },
    stepNumber: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    stepCircle: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: '#1DA1F2',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: '600',
      fontFamily: "'Orbitron', sans-serif",
      flexShrink: 0,
    },
    stepText: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      lineHeight: 1.4,
    },
    codeBox: {
      background: 'rgba(29, 161, 242, 0.1)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid rgba(29, 161, 242, 0.3)',
    },
    codeText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1DA1F2',
      fontFamily: "'Roboto Mono', monospace",
    },
    copyButton: {
      padding: '8px 16px',
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 8,
      border: 'none',
      backgroundColor: copied ? '#39ff14' : '#1DA1F2',
      color: copied ? '#000' : '#fff',
      cursor: 'pointer',
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 16,
      border: '1px solid rgba(0, 229, 255, 0.15)',
    },
    inputPrefix: {
      fontSize: 16,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.4)',
      marginRight: 4,
    },
    input: {
      flex: 1,
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: 16,
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '14px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: 'none',
      background: '#1DA1F2',
      color: '#fff',
      cursor: 'pointer',
      marginBottom: 12,
      boxShadow: '0 0 15px rgba(29, 161, 242, 0.3)',
    },
    secondaryButton: {
      width: '100%',
      padding: '14px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: '1px solid rgba(255, 255, 255, 0.15)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      cursor: 'pointer',
      marginBottom: 12,
    },
    unbindButton: {
      width: '100%',
      padding: '14px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: '1px solid rgba(255, 77, 166, 0.3)',
      backgroundColor: 'rgba(255, 77, 166, 0.1)',
      color: '#ff4da6',
      cursor: 'pointer',
      marginTop: 12,
    },
    message: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: step === 'error' ? '#ff4da6' : 'rgba(255, 255, 255, 0.5)',
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 1.4,
    },
    boundCard: {
      background: 'rgba(29, 161, 242, 0.1)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      border: '1px solid rgba(29, 161, 242, 0.3)',
    },
    twitterIcon: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      backgroundColor: '#1DA1F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
    },
    boundUsername: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
    },
    boundLabel: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: '#39ff14',
    },
    spinner: {
      width: 32,
      height: 32,
      border: '3px solid rgba(0, 229, 255, 0.2)',
      borderTopColor: '#00e5ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '20px auto',
      boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
    },
    successIcon: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: 12,
    },
    expiryNote: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.4)',
      textAlign: 'center',
      marginBottom: 16,
    },
  };

  const renderContent = () => {
    // 加载中
    if (step === 'verifying') {
      return (
        <>
          <h3 style={styles.title}>{t ? t('twitter.title') : 'Twitter 绑定'}</h3>
          <div style={styles.spinner} />
          <p style={styles.message}>{message}</p>
        </>
      );
    }

    // 绑定成功
    if (step === 'success') {
      return (
        <>
          <div style={styles.successIcon}><IconCheck size={48} color="#39ff14" /></div>
          <h3 style={styles.title}>{t ? t('twitter.success') : '绑定成功'}</h3>
          <p style={styles.message}>{message}</p>
        </>
      );
    }

    // 已绑定状态
    if (step === 'bound' && boundInfo) {
      return (
        <>
          <h3 style={styles.title}>{t ? t('twitter.bound') : 'Twitter 已绑定'}</h3>
          <p style={styles.subtitle}>
            {t ? t('twitter.boundDesc') : '您可以参与 Twitter 任务并获得真实验证'}
          </p>

          <div style={styles.boundCard}>
            <div style={styles.twitterIcon}><IconTwitter size={24} color="#1DA1F2" /></div>
            <div>
              <div style={styles.boundUsername}>@{boundInfo.username}</div>
              <div style={styles.boundLabel}>{t ? t('twitter.verified') : '已验证绑定'}</div>
            </div>
          </div>

          {message && <p style={styles.message}>{message}</p>}

          <AnimatedButton style={styles.secondaryButton} onClick={onClose}>
            {t ? t('common.close') : '关闭'}
          </AnimatedButton>
          <AnimatedButton style={styles.unbindButton} onClick={handleUnbind}>
            {t ? t('twitter.unbind') : '解除绑定'}
          </AnimatedButton>
        </>
      );
    }

    // 验证码步骤 - 显示验证码和转发按钮
    if (step === 'verification') {
      return (
        <>
          <h3 style={styles.title}>{t ? t('twitter.verifyTitle') : '验证账号所有权'}</h3>

          {/* 步骤 1: 复制验证码 */}
          <div style={styles.stepNumber}>
            <div style={styles.stepCircle}>1</div>
            <div style={styles.stepText}>
              {t ? t('twitter.step1') : '复制下方验证码'}
            </div>
          </div>

          <div style={styles.codeBox}>
            <span style={styles.codeText}>{verificationCode}</span>
            <button style={styles.copyButton} onClick={handleCopyCode}>
              {copied ? <IconCheck size={12} color="#39ff14" /> : (t ? t('common.copy') : '复制')}
            </button>
          </div>

          {/* 步骤 2: 发布推文 */}
          <div style={styles.stepNumber}>
            <div style={styles.stepCircle}>2</div>
            <div style={styles.stepText}>
              转发官方推文并带上验证码
            </div>
          </div>

          <p style={styles.expiryNote}>
            ⏱️ {t ? t('twitter.codeExpiry') : '验证码 10 分钟内有效，验证后可删除推文'}
          </p>

          {message && <p style={styles.message}>{message}</p>}

          <AnimatedButton style={styles.button} onClick={handleOpenTwitterPost}>
            <IconTwitter size={14} color="#fff" /> 转发推文
          </AnimatedButton>
          <AnimatedButton style={styles.secondaryButton} onClick={handleBack}>
            {t ? t('common.back') : '返回'}
          </AnimatedButton>
        </>
      );
    }

    // 已发布推文 - 显示验证并绑定按钮
    if (step === 'posted') {
      return (
        <>
          <h3 style={styles.title}>{t ? t('twitter.verifyTitle') : '验证账号所有权'}</h3>

          <div style={styles.stepNumber}>
            <div style={{ ...styles.stepCircle, backgroundColor: '#39ff14' }}><IconCheck size={12} color="#000" /></div>
            <div style={styles.stepText}>
              已复制验证码
            </div>
          </div>

          <div style={styles.stepNumber}>
            <div style={{ ...styles.stepCircle, backgroundColor: '#39ff14' }}><IconCheck size={12} color="#000" /></div>
            <div style={styles.stepText}>
              已跳转到 Twitter
            </div>
          </div>

          {/* 步骤 3: 验证 */}
          <div style={styles.stepNumber}>
            <div style={styles.stepCircle}>3</div>
            <div style={styles.stepText}>
              发布推文后点击验证
            </div>
          </div>

          <p style={styles.expiryNote}>
            ⏱️ 请确保推文已发布，然后点击下方按钮验证
          </p>

          {message && <p style={styles.message}>{message}</p>}

          <AnimatedButton style={styles.button} onClick={handleVerifyAndBind}>
            <IconCheck size={14} color="#000" /> 验证并绑定
          </AnimatedButton>
          <AnimatedButton
            style={styles.secondaryButton}
            onClick={handleOpenTwitterPost}
          >
            <IconTwitter size={14} color="#fff" /> 重新转发
          </AnimatedButton>
          <AnimatedButton style={styles.secondaryButton} onClick={handleBack}>
            {t ? t('common.back') : '返回'}
          </AnimatedButton>
        </>
      );
    }

    // 输入状态（默认）
    return (
      <>
        <h3 style={styles.title}>{t ? t('twitter.bindTitle') : '绑定 Twitter 账号'}</h3>
        <p style={styles.subtitle}>
          {t ? t('twitter.bindDesc') : '绑定后可以验证您是否完成了 Twitter 任务，确保奖励发放'}
        </p>

        <div style={styles.inputContainer}>
          <span style={styles.inputPrefix}>@</span>
          <input
            style={styles.input}
            type="text"
            placeholder={t ? t('twitter.placeholder') : '输入您的 Twitter 用户名'}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGetCode()}
          />
        </div>

        {message && <p style={styles.message}>{message}</p>}

        <AnimatedButton style={styles.button} onClick={handleGetCode}>
          <IconTwitter size={14} color="#fff" /> {t ? t('twitter.next') : '下一步'}
        </AnimatedButton>
        <AnimatedButton style={styles.secondaryButton} onClick={onClose}>
          {t ? t('common.cancel') : '取消'}
        </AnimatedButton>
      </>
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.content} onClick={e => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
}
