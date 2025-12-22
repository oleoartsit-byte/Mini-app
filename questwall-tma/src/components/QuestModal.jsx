import React, { useState, useCallback, useEffect } from 'react';
import { AnimatedButton } from './PageTransition';
import { TwitterBindModal } from './TwitterBindModal';

// 所有奖励统一使用 USDT
const getRewardIcon = () => '💵';

// 获取任务类型信息
const getQuestTypeInfo = (type) => {
  switch (type) {
    case 'join_channel':
      return { icon: '📢', label: '关注频道', actionText: '前往关注', verifyText: '验证关注' };
    case 'join_group':
      return { icon: '👥', label: '加入群组', actionText: '前往加入', verifyText: '验证加入' };
    case 'deep_link':
      return { icon: '🔗', label: '访问链接', actionText: '前往访问', verifyText: '确认完成' };
    case 'follow_twitter':
      return { icon: '🐦', label: '关注推特', actionText: '前往关注', verifyText: '验证关注' };
    case 'retweet_twitter':
      return { icon: '🔁', label: '转发推文', actionText: '前往转发', verifyText: '验证转发' };
    case 'like_twitter':
      return { icon: '❤️', label: '点赞推文', actionText: '前往点赞', verifyText: '验证点赞' };
    case 'comment_twitter':
      return { icon: '💬', label: '评论推文', actionText: '前往评论', verifyText: '验证评论' };
    case 'like_post':
      return { icon: '❤️', label: '点赞帖子', actionText: '前往点赞', verifyText: '确认完成' };
    default:
      return { icon: '🎯', label: '任务', actionText: '开始', verifyText: '完成' };
  }
};

// 检查是否是需要验证的任务类型
const isVerifiableQuest = (type) => {
  return ['join_channel', 'join_group', 'follow_twitter', 'retweet_twitter', 'like_twitter', 'comment_twitter'].includes(type);
};

export function QuestModal({ quest, onClose, onSubmit, theme, api, twitterBound, twitterUsername, onTwitterBindSuccess, t }) {
  const [step, setStep] = useState('intro'); // intro | need_bind | verifying | success | error
  const [verifyMessage, setVerifyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTwitterBind, setShowTwitterBind] = useState(false);
  const [localTwitterBound, setLocalTwitterBound] = useState(twitterBound);
  const [localTwitterUsername, setLocalTwitterUsername] = useState(twitterUsername);

  // 同步外部 Twitter 绑定状态
  useEffect(() => {
    setLocalTwitterBound(twitterBound);
    setLocalTwitterUsername(twitterUsername);
  }, [twitterBound, twitterUsername]);

  // 当任务改变时重置弹窗状态
  useEffect(() => {
    if (quest) {
      setStep('intro');
      setVerifyMessage('');
      setIsLoading(false);
      setShowTwitterBind(false);
    }
  }, [quest?.id]);

  // 构建频道/群组链接
  const getTargetLink = useCallback(() => {
    if (!quest) return null;
    if (quest.targetUrl) return quest.targetUrl;
    if (quest.channelId) {
      if (quest.channelId.startsWith('@')) {
        return `https://t.me/${quest.channelId.substring(1)}`;
      }
      return `https://t.me/${quest.channelId}`;
    }
    return null;
  }, [quest]);

  // 检查是否是 Twitter 任务
  const isTwitterQuest = (type) => {
    return ['follow_twitter', 'retweet_twitter', 'like_twitter', 'comment_twitter'].includes(type);
  };

  // 前往频道/群组/Twitter
  const handleGoToTarget = useCallback(async () => {
    if (!quest) return;

    // Twitter 任务：先检查是否绑定
    if (isTwitterQuest(quest.type) && !localTwitterBound) {
      setStep('need_bind');
      return;
    }

    const link = getTargetLink();
    if (link) {
      // 先领取任务（忽略错误）
      if (api?.claimQuest) {
        api.claimQuest(quest.id).catch(e => console.log('领取任务:', e));
      }

      // 使用 Telegram WebApp 打开链接（非 Twitter 链接）
      if (link.includes('t.me') && window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(link);
      } else {
        window.open(link, '_blank');
      }
      // 更新状态为待验证
      setStep('ready_verify');
    }
  }, [quest, api, getTargetLink, localTwitterBound]);

  // 处理 Twitter 绑定成功
  const handleTwitterBindSuccess = useCallback(() => {
    // 刷新绑定状态
    if (api?.getTwitterStatus) {
      api.getTwitterStatus().then(status => {
        if (status.bound) {
          setLocalTwitterBound(true);
          setLocalTwitterUsername(status.twitterUsername);
          onTwitterBindSuccess?.();
          // 绑定成功后自动跳转到 Twitter 页面
          const link = getTargetLink();
          if (link) {
            // 先领取任务
            if (api?.claimQuest) {
              api.claimQuest(quest.id).catch(e => console.log('领取任务:', e));
            }
            window.open(link, '_blank');
            setStep('ready_verify');
          }
        }
      });
    }
    setShowTwitterBind(false);
  }, [api, quest, getTargetLink, onTwitterBindSuccess]);

  // 验证是否完成任务
  const handleVerify = useCallback(async () => {
    if (!quest) return;
    setIsLoading(true);
    setStep('verifying');
    setVerifyMessage('正在验证...');

    try {
      // Twitter 任务验证（关注/转发/点赞/评论）
      if (isTwitterQuest(quest.type)) {
        const typeMap = {
          'follow_twitter': 'twitter_follow',
          'retweet_twitter': 'twitter_retweet',
          'like_twitter': 'twitter_like',
          'comment_twitter': 'twitter_comment',
        };
        const result = await api.submitQuest(quest.id, { type: typeMap[quest.type] });

        if (result.success || result.verified || result.status === 'REWARDED') {
          setStep('success');
          setVerifyMessage(result.message || '验证成功！奖励已发放！');
          setTimeout(() => {
            onSubmit?.();
          }, 800);
        } else {
          setStep('error');
          setVerifyMessage(result.message || '请先完成任务后再验证');
        }
        return;
      }

      // Telegram 频道/群组验证
      if (!api || !quest.channelId) {
        onSubmit?.();
        return;
      }

      const result = await api.verifyMember(quest.channelId);

      if (result.isMember) {
        setStep('success');
        setVerifyMessage('验证成功！');
        setTimeout(() => {
          onSubmit?.();
        }, 800);
      } else {
        setStep('error');
        setVerifyMessage(result.message || '请先完成任务后再验证');
      }
    } catch (error) {
      setStep('error');
      setVerifyMessage('验证失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [api, quest, onSubmit]);

  // 必须在所有 hooks 之后才能 return
  if (!quest) return null;

  const typeInfo = getQuestTypeInfo(quest.type);
  const needsVerification = isVerifiableQuest(quest.type);
  const hasChannelId = quest.channelId || quest.targetUrl;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
    },
    content: {
      backgroundColor: theme.bg,
      borderRadius: '16px 16px 0 0',
      padding: '20px 20px 40px 20px',
      paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 20px))',
      width: '100%',
      maxHeight: '80vh',
      animation: 'slideUp 0.3s ease-out',
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: theme.hint,
      borderRadius: 2,
      margin: '0 auto 16px',
      opacity: 0.3,
    },
    typeTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 20,
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
      margin: '0 auto 12px',
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      margin: 0,
      marginBottom: 8,
      textAlign: 'center',
    },
    desc: {
      fontSize: 15,
      color: theme.hint,
      margin: 0,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 1.5,
    },
    reward: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontSize: 15,
      fontWeight: '600',
      color: theme.warning,
      marginBottom: 20,
    },
    buttons: {
      display: 'flex',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      padding: '14px',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 12,
      border: 'none',
      backgroundColor: theme.secondaryBg,
      color: theme.text,
      cursor: 'pointer',
    },
    primaryButton: {
      flex: 1,
      padding: '14px',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
    submitButton: {
      flex: 1,
      padding: '14px',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 12,
      border: 'none',
      backgroundColor: theme.success,
      color: '#fff',
      cursor: 'pointer',
    },
    verifyButton: {
      flex: 1,
      padding: '14px',
      fontSize: 16,
      fontWeight: '600',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
    statusContainer: {
      textAlign: 'center',
      padding: '20px 0',
    },
    statusIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    statusText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    statusHint: {
      fontSize: 14,
      color: theme.hint,
    },
    spinner: {
      width: 40,
      height: 40,
      border: `3px solid ${theme.secondaryBg}`,
      borderTopColor: '#667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 12px',
    },
    stepsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 20,
      padding: '12px 16px',
      backgroundColor: theme.secondaryBg,
      borderRadius: 12,
    },
    stepItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: theme.hint,
    },
    stepItemActive: {
      color: '#667eea',
      fontWeight: '600',
    },
    stepItemDone: {
      color: theme.success,
    },
    stepArrow: {
      fontSize: 12,
      color: theme.hint,
      opacity: 0.5,
    },
  };

  // 渲染步骤指示器
  const renderSteps = () => {
    if (!needsVerification) return null;

    const getStepLabel = () => {
      switch (quest.type) {
        case 'join_channel': return '关注';
        case 'join_group': return '加入';
        case 'follow_twitter': return '关注';
        case 'retweet_twitter': return '转发';
        case 'like_twitter': return '点赞';
        case 'comment_twitter': return '评论';
        default: return '完成';
      }
    };

    const steps = [
      { key: 'go', label: getStepLabel() },
      { key: 'verify', label: '验证' },
      { key: 'done', label: '完成' },
    ];

    const currentStepIndex =
      step === 'intro' ? 0 :
      step === 'ready_verify' || step === 'verifying' || step === 'error' ? 1 :
      step === 'success' ? 2 : 0;

    return (
      <div style={styles.stepsContainer}>
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            {idx > 0 && <span style={styles.stepArrow}>→</span>}
            <span style={{
              ...styles.stepItem,
              ...(idx === currentStepIndex ? styles.stepItemActive : {}),
              ...(idx < currentStepIndex ? styles.stepItemDone : {}),
            }}>
              {idx < currentStepIndex ? '✓' : `${idx + 1}.`} {s.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    // 需要绑定 Twitter 状态
    if (step === 'need_bind') {
      const getBindHint = () => {
        switch (quest.type) {
          case 'follow_twitter': return '关注状态';
          case 'retweet_twitter': return '转发状态';
          case 'like_twitter': return '点赞状态';
          case 'comment_twitter': return '评论状态';
          default: return '任务完成状态';
        }
      };
      return (
        <>
          <div style={{ textAlign: 'center' }}>
            <span style={styles.typeTag}>
              <span>🐦</span>
              <span>需要绑定 Twitter</span>
            </span>
          </div>
          <h2 style={styles.title}>{quest.title}</h2>
          <p style={styles.desc}>
            完成此任务需要先绑定您的 Twitter 账号，以便验证您的任务完成状态。
          </p>
          <div style={{
            backgroundColor: theme.secondaryBg,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔗</div>
            <p style={{ fontSize: 14, color: theme.hint, margin: 0 }}>
              绑定后我们将验证您的{getBindHint()}，确保奖励发放给真实用户
            </p>
          </div>
          <div style={styles.reward}>
            奖励: {getRewardIcon()} +{quest.reward.amount} USDT
          </div>
          <div style={styles.buttons}>
            <AnimatedButton style={styles.cancelButton} onClick={onClose}>
              取消
            </AnimatedButton>
            <AnimatedButton
              style={{...styles.primaryButton, background: '#1DA1F2'}}
              onClick={() => setShowTwitterBind(true)}
            >
              🐦 绑定 Twitter
            </AnimatedButton>
          </div>
        </>
      );
    }

    // 验证中状态
    if (step === 'verifying') {
      return (
        <div style={styles.statusContainer}>
          <div style={styles.spinner} />
          <p style={styles.statusText}>正在验证...</p>
          <p style={styles.statusHint}>请稍候</p>
        </div>
      );
    }

    // 验证成功状态
    if (step === 'success') {
      return (
        <div style={styles.statusContainer}>
          <div style={styles.statusIcon}>✅</div>
          <p style={styles.statusText}>验证成功！</p>
          <p style={styles.statusHint}>任务即将完成</p>
        </div>
      );
    }

    // 验证失败状态
    if (step === 'error') {
      return (
        <>
          <div style={styles.statusContainer}>
            <div style={styles.statusIcon}>❌</div>
            <p style={styles.statusText}>验证未通过</p>
            <p style={styles.statusHint}>{verifyMessage}</p>
          </div>
          <div style={styles.buttons}>
            <AnimatedButton style={styles.cancelButton} onClick={onClose}>
              取消
            </AnimatedButton>
            <AnimatedButton style={styles.primaryButton} onClick={handleGoToTarget}>
              重新{typeInfo.actionText}
            </AnimatedButton>
          </div>
        </>
      );
    }

    // 准备验证状态
    if (step === 'ready_verify') {
      const getReadyVerifyHint = () => {
        switch (quest.type) {
          case 'join_channel': return '已关注频道？点击验证完成任务';
          case 'join_group': return '已加入群组？点击验证完成任务';
          case 'follow_twitter': return '已关注 Twitter？点击验证完成任务';
          case 'retweet_twitter': return '已转发推文？点击验证完成任务';
          case 'like_twitter': return '已点赞推文？点击验证完成任务';
          case 'comment_twitter': return '已评论推文？点击验证完成任务';
          default: return '已完成任务？点击验证';
        }
      };
      return (
        <>
          <div style={{ textAlign: 'center' }}>
            <span style={styles.typeTag}>
              <span>{typeInfo.icon}</span>
              <span>{typeInfo.label}</span>
            </span>
          </div>
          <h2 style={styles.title}>{quest.title}</h2>
          <p style={styles.desc}>{getReadyVerifyHint()}</p>
          <div style={styles.reward}>
            奖励: {getRewardIcon()} +{quest.reward.amount} USDT
          </div>
          <div style={styles.buttons}>
            <AnimatedButton style={styles.cancelButton} onClick={handleGoToTarget}>
              重新{typeInfo.actionText}
            </AnimatedButton>
            <AnimatedButton
              style={styles.verifyButton}
              onClick={handleVerify}
              disabled={isLoading}
            >
              {typeInfo.verifyText}
            </AnimatedButton>
          </div>
        </>
      );
    }

    // 默认介绍状态
    return (
      <>
        <div style={{ textAlign: 'center' }}>
          <span style={styles.typeTag}>
            <span>{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
          </span>
        </div>
        <h2 style={styles.title}>{quest.title}</h2>
        <p style={styles.desc}>{quest.description}</p>
        <div style={styles.reward}>
          奖励: {getRewardIcon()} +{quest.reward.amount} USDT
        </div>
        {renderSteps()}
        <div style={styles.buttons}>
          <AnimatedButton style={styles.cancelButton} onClick={onClose}>
            取消
          </AnimatedButton>
          {needsVerification && hasChannelId ? (
            <AnimatedButton style={styles.primaryButton} onClick={handleGoToTarget}>
              {typeInfo.actionText}
            </AnimatedButton>
          ) : (
            <AnimatedButton style={styles.submitButton} onClick={onSubmit}>
              完成
            </AnimatedButton>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.content} onClick={e => e.stopPropagation()}>
          <div style={styles.handle} />
          {renderContent()}
        </div>
      </div>

      {/* Twitter 绑定弹窗 */}
      {showTwitterBind && (
        <TwitterBindModal
          isOpen={showTwitterBind}
          onClose={() => setShowTwitterBind(false)}
          theme={theme}
          api={api}
          t={t}
          onBindSuccess={handleTwitterBindSuccess}
        />
      )}
    </>
  );
}
