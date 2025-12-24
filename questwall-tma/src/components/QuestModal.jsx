import { useState, useCallback, useEffect } from 'react';
import { AnimatedButton } from './PageTransition';
import { TwitterBindModal } from './TwitterBindModal';
import { IconTelegram, IconUsers, IconLink, IconTwitter, IconShare, IconHeart, IconComment, IconTarget, IconCheck, IconClock, IconDollar, IconStar, IconInfo } from './icons/CyberpunkIcons';

// 获取奖励信息（USDT + 积分）
const getRewardDisplay = (reward) => {
  const usdt = Number(reward?.amount) || 0;
  // 优先使用后端返回的 points，否则按 1:10 计算
  const points = reward?.points !== undefined ? reward.points : Math.floor(usdt * 10);
  return { usdt, points };
};

// 获取任务类型信息（返回图标类型和样式，实际渲染在组件内）
const getQuestTypeInfo = (type) => {
  switch (type) {
    case 'join_channel':
      return { iconType: 'telegram', iconColor: '#00e5ff', label: '关注频道', actionText: '前往关注', verifyText: '验证关注' };
    case 'join_group':
      return { iconType: 'users', iconColor: '#bf5fff', label: '加入群组', actionText: '前往加入', verifyText: '验证加入' };
    case 'deep_link':
      return { iconType: 'link', iconColor: '#00e5ff', label: '访问链接', actionText: '前往访问', verifyText: '确认完成' };
    case 'follow_twitter':
      return { iconType: 'twitter', iconColor: '#1DA1F2', label: '关注推特', actionText: '前往关注', verifyText: '验证关注' };
    case 'retweet_twitter':
      return { iconType: 'share', iconColor: '#1DA1F2', label: '转发推文', actionText: '前往转发', verifyText: '验证转发' };
    case 'like_twitter':
      return { iconType: 'heart', iconColor: '#ff4da6', label: '点赞推文', actionText: '前往点赞', verifyText: '验证点赞' };
    case 'comment_twitter':
      return { iconType: 'comment', iconColor: '#1DA1F2', label: '评论推文', actionText: '前往评论', verifyText: '验证评论' };
    case 'like_post':
      return { iconType: 'heart', iconColor: '#ff4da6', label: '点赞帖子', actionText: '前往点赞', verifyText: '确认完成' };
    default:
      return { iconType: 'target', iconColor: '#00e5ff', label: '任务', actionText: '开始', verifyText: '完成' };
  }
};

// 检查是否是需要验证的任务类型
const isVerifiableQuest = (type) => {
  return ['join_channel', 'join_group', 'follow_twitter', 'retweet_twitter', 'like_twitter', 'comment_twitter'].includes(type);
};

export function QuestModal({ quest, onClose, onSubmit, api, twitterBound, twitterUsername, onTwitterBindSuccess, t }) {
  const [step, setStep] = useState('intro'); // intro | need_bind | upload_proof | verifying | success | error | pending_review
  const [verifyMessage, setVerifyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTwitterBind, setShowTwitterBind] = useState(false);
  const [localTwitterBound, setLocalTwitterBound] = useState(twitterBound);
  const [localTwitterUsername, setLocalTwitterUsername] = useState(twitterUsername);
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
      setProofImage(null);
      setProofImagePreview(null);
    }
  }, [quest?.id]);

  // 检查是否是需要截图的任务类型
  const isProofImageQuest = (type) => {
    return type === 'like_twitter';
  };

  // 处理图片选择
  const handleImageSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      setProofImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // 上传图片
    setIsUploading(true);
    try {
      const result = await api.uploadImage(file);
      if (result.success && result.url) {
        setProofImage(result.url);
      } else {
        setVerifyMessage(result.message || '图片上传失败');
        setProofImagePreview(null);
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      setVerifyMessage('图片上传失败');
      setProofImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [api]);

  // 构建频道/群组链接
  const getTargetLink = useCallback(() => {
    if (!quest) return null;
    // 点赞任务使用固定的推文链接（测试用，后续换成官方账号推文）
    if (quest.type === 'like_twitter') {
      return 'https://x.com/MoSalah/status/2003237101740130408';
    }
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

    // 所有 Twitter 任务：先检查是否绑定
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

      // 点赞任务：跳转到截图上传步骤
      if (isProofImageQuest(quest.type)) {
        setStep('upload_proof');
      } else {
        // 其他任务：跳转到待验证步骤
        setStep('ready_verify');
      }
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
            // 点赞任务跳转到上传截图，其他任务跳转到验证
            if (isProofImageQuest(quest.type)) {
              setStep('upload_proof');
            } else {
              setStep('ready_verify');
            }
          }
        }
      });
    }
    setShowTwitterBind(false);
  }, [api, quest, getTargetLink, onTwitterBindSuccess]);

  // 提交截图证明（点赞任务专用）
  const handleSubmitProof = useCallback(async () => {
    if (!quest || !proofImage) return;
    setIsLoading(true);
    setStep('verifying');
    setVerifyMessage('正在提交...');

    try {
      const result = await api.submitQuest(quest.id, { type: 'twitter_like' }, proofImage);

      if (result.pendingReview) {
        // 等待人工审核
        setStep('pending_review');
        setVerifyMessage(result.message || '截图已提交，等待审核');
      } else if (result.success || result.verified || result.status === 'REWARDED') {
        setStep('success');
        setVerifyMessage(result.message || '验证成功！奖励已发放！');
        setTimeout(() => {
          onSubmit?.();
        }, 800);
      } else {
        setStep('error');
        setVerifyMessage(result.message || '提交失败');
      }
    } catch (error) {
      setStep('error');
      setVerifyMessage('提交失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [api, quest, proofImage, onSubmit]);

  // 验证是否完成任务
  const handleVerify = useCallback(async () => {
    if (!quest) return;
    setIsLoading(true);
    setStep('verifying');
    setVerifyMessage('正在验证...');

    try {
      // Twitter 任务验证（关注/转发/评论，点赞走截图流程）
      if (isTwitterQuest(quest.type) && !isProofImageQuest(quest.type)) {
        const typeMap = {
          'follow_twitter': 'twitter_follow',
          'retweet_twitter': 'twitter_retweet',
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

  // 根据 iconType 渲染对应的图标
  const renderTypeIcon = (size = 16) => {
    const color = typeInfo.iconColor;
    switch (typeInfo.iconType) {
      case 'telegram': return <IconTelegram size={size} color={color} />;
      case 'users': return <IconUsers size={size} color={color} />;
      case 'link': return <IconLink size={size} color={color} />;
      case 'twitter': return <IconTwitter size={size} color={color} />;
      case 'share': return <IconShare size={size} color={color} />;
      case 'heart': return <IconHeart size={size} color={color} />;
      case 'comment': return <IconComment size={size} color={color} />;
      case 'target': return <IconTarget size={size} color={color} />;
      default: return <IconTarget size={size} color={color} />;
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
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
    },
    content: {
      background: 'linear-gradient(145deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
      borderRadius: '20px 20px 0 0',
      padding: '20px 20px 40px 20px',
      paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 20px))',
      width: '100%',
      maxHeight: '80vh',
      animation: 'slideUp 0.3s ease-out',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderBottom: 'none',
      position: 'relative',
      overflow: 'hidden',
    },
    glowEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100px',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 229, 255, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    handle: {
      width: 40,
      height: 4,
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      borderRadius: 2,
      margin: '0 auto 18px',
      boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
    },
    typeTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      background: 'rgba(0, 229, 255, 0.1)',
      border: '1px solid rgba(0, 229, 255, 0.3)',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: '#00e5ff',
      margin: '0 auto 14px',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 10,
      textAlign: 'center',
      textShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
    },
    desc: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 1.6,
    },
    reward: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#ffc107',
      marginBottom: 20,
      textShadow: '0 0 10px rgba(255, 193, 7, 0.4)',
    },
    buttons: {
      display: 'flex',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      padding: '14px',
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 12,
      border: '1px solid rgba(0, 229, 255, 0.2)',
      backgroundColor: 'rgba(40, 40, 70, 0.8)',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    primaryButton: {
      flex: 1,
      padding: '14px',
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
      transition: 'all 0.3s ease',
    },
    submitButton: {
      flex: 1,
      padding: '14px',
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #39ff14, #00e5ff)',
      color: '#000',
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(57, 255, 20, 0.4)',
      transition: 'all 0.3s ease',
    },
    verifyButton: {
      flex: 1,
      padding: '14px',
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #39ff14, #00e5ff)',
      color: '#000',
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(57, 255, 20, 0.4)',
      transition: 'all 0.3s ease',
    },
    statusContainer: {
      textAlign: 'center',
      padding: '24px 0',
    },
    statusIcon: {
      fontSize: 56,
      marginBottom: 16,
    },
    statusText: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      marginBottom: 10,
    },
    statusHint: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    spinner: {
      width: 44,
      height: 44,
      border: '3px solid rgba(0, 229, 255, 0.2)',
      borderTopColor: '#00e5ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 14px',
      boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
    },
    stepsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20,
      padding: '14px 18px',
      background: 'rgba(30, 30, 55, 0.8)',
      borderRadius: 14,
      border: '1px solid rgba(0, 229, 255, 0.15)',
    },
    stepItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontFamily: "'Orbitron', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
    },
    stepItemActive: {
      color: '#00e5ff',
      fontWeight: '700',
      textShadow: '0 0 8px rgba(0, 229, 255, 0.6)',
    },
    stepItemDone: {
      color: '#39ff14',
      textShadow: '0 0 8px rgba(57, 255, 20, 0.6)',
    },
    stepArrow: {
      fontSize: 12,
      color: '#00e5ff',
      opacity: 0.5,
    },
    secondaryBg: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      border: '1px solid rgba(0, 229, 255, 0.1)',
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
          <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {idx > 0 && <span style={styles.stepArrow}>→</span>}
            <span style={{
              ...styles.stepItem,
              ...(idx === currentStepIndex ? styles.stepItemActive : {}),
              ...(idx < currentStepIndex ? styles.stepItemDone : {}),
            }}>
              {idx < currentStepIndex ? '✓' : `${idx + 1}.`} {s.label}
            </span>
          </span>
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
              <IconTwitter size={16} color="#1DA1F2" />
              <span>需要绑定 Twitter</span>
            </span>
          </div>
          <h2 style={styles.title}>{quest.title}</h2>
          <p style={styles.desc}>
            完成此任务需要先绑定您的 Twitter 账号，以便验证您的任务完成状态。
          </p>
          <div style={styles.secondaryBg}>
            <div style={{ marginBottom: 8, textAlign: 'center' }}><IconLink size={32} color="#00e5ff" /></div>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', margin: 0, textAlign: 'center' }}>
              绑定后我们将验证您的{getBindHint()}，确保奖励发放给真实用户
            </p>
          </div>
          <div style={styles.reward}>
            奖励: <IconDollar size={14} color="#39ff14" /> +{quest.reward.amount} USDT <IconStar size={14} color="#ffc107" /> +{getRewardDisplay(quest.reward).points} 积分
          </div>
          <div style={styles.buttons}>
            <AnimatedButton style={styles.cancelButton} onClick={onClose}>
              取消
            </AnimatedButton>
            <AnimatedButton
              style={{...styles.primaryButton, background: '#1DA1F2'}}
              onClick={() => setShowTwitterBind(true)}
            >
              <IconTwitter size={14} color="#fff" /> 绑定 Twitter
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
          <div style={styles.statusIcon}><IconCheck size={56} color="#39ff14" /></div>
          <p style={styles.statusText}>验证成功！</p>
          <p style={styles.statusHint}>任务即将完成</p>
        </div>
      );
    }

    // 等待审核状态
    if (step === 'pending_review') {
      return (
        <>
          <div style={styles.statusContainer}>
            <div style={styles.statusIcon}><IconClock size={56} color="#ffc107" /></div>
            <p style={styles.statusText}>截图已提交</p>
            <p style={styles.statusHint}>{verifyMessage || '等待人工审核，审核通过后将自动发放奖励'}</p>
          </div>
          <div style={styles.reward}>
            奖励: <IconDollar size={14} color="#39ff14" /> +{quest.reward.amount} USDT <IconStar size={14} color="#ffc107" /> +{getRewardDisplay(quest.reward).points} 积分
          </div>
          <div style={styles.buttons}>
            <AnimatedButton style={styles.primaryButton} onClick={onClose}>
              我知道了
            </AnimatedButton>
          </div>
        </>
      );
    }

    // 上传截图状态（点赞任务专用）
    if (step === 'upload_proof') {
      return (
        <>
          <div style={{ textAlign: 'center' }}>
            <span style={styles.typeTag}>
              <IconInfo size={16} color="#00e5ff" />
              <span>上传截图</span>
            </span>
          </div>
          <h2 style={styles.title}>{quest.title}</h2>
          <p style={styles.desc}>请上传点赞成功的截图，审核通过后将发放奖励</p>

          {/* 截图提示 */}
          <div style={{
            backgroundColor: 'rgba(29, 161, 242, 0.1)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
            color: '#fff',
            lineHeight: 1.5,
            border: '1px solid rgba(29, 161, 242, 0.2)',
          }}>
            <div style={{ fontWeight: '600', marginBottom: 6, color: '#1DA1F2', display: 'flex', alignItems: 'center', gap: 6 }}><IconInfo size={14} color="#1DA1F2" /> 截图要求：</div>
            <div>1. 截图需显示<strong>点赞按钮已点亮</strong>（红色心形）</div>
            <div>2. 截图需显示<strong>推文作者</strong>（确认是指定推文）</div>
            <div>3. 截图需显示<strong>您的登录账号</strong>（侧边栏或顶部）</div>
            <div style={{ marginTop: 8, color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconInfo size={12} color="rgba(255, 255, 255, 0.5)" /> 推文太长？请使用手机的「长截图」或「滚动截图」功能
            </div>
          </div>

          {/* 图片上传区域 */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            textAlign: 'center',
            border: `2px dashed ${proofImagePreview ? '#39ff14' : 'rgba(255, 255, 255, 0.2)'}`,
            cursor: 'pointer',
            position: 'relative',
            minHeight: 120,
          }} onClick={() => document.getElementById('proof-image-input').click()}>
            <input
              id="proof-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            {isUploading ? (
              <>
                <div style={styles.spinner} />
                <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>上传中...</p>
              </>
            ) : proofImagePreview ? (
              <>
                <img
                  src={proofImagePreview}
                  alt="截图预览"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
                <p style={{ fontSize: 12, color: '#39ff14', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <IconCheck size={12} color="#39ff14" /> 点击更换图片
                </p>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}><IconInfo size={40} color="rgba(255, 255, 255, 0.4)" /></div>
                <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                  点击选择截图
                </p>
              </>
            )}
          </div>

          <div style={styles.reward}>
            奖励: <IconDollar size={14} color="#39ff14" /> +{quest.reward.amount} USDT <IconStar size={14} color="#ffc107" /> +{getRewardDisplay(quest.reward).points} 积分
          </div>
          <div style={styles.buttons}>
            <AnimatedButton style={styles.cancelButton} onClick={handleGoToTarget}>
              重新点赞
            </AnimatedButton>
            <AnimatedButton
              style={{
                ...styles.verifyButton,
                opacity: (proofImage && !isUploading) ? 1 : 0.5,
              }}
              onClick={handleSubmitProof}
              disabled={!proofImage || isUploading || isLoading}
            >
              {isLoading ? '提交中...' : '提交审核'}
            </AnimatedButton>
          </div>
        </>
      );
    }

    // 验证失败状态
    if (step === 'error') {
      return (
        <>
          <div style={styles.statusContainer}>
            <div style={styles.statusIcon}><IconInfo size={56} color="#ff4da6" /></div>
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
              {renderTypeIcon(16)}
              <span>{typeInfo.label}</span>
            </span>
          </div>
          <h2 style={styles.title}>{quest.title}</h2>
          <p style={styles.desc}>{getReadyVerifyHint()}</p>
          <div style={styles.reward}>
            奖励: <IconDollar size={14} color="#39ff14" /> +{quest.reward.amount} USDT <IconStar size={14} color="#ffc107" /> +{getRewardDisplay(quest.reward).points} 积分
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
          奖励: 💵 +{quest.reward.amount} USDT ⭐ +{getRewardDisplay(quest.reward).points} 积分
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
          <div style={styles.glowEffect} />
          <div style={styles.handle} />
          {renderContent()}
        </div>
      </div>

      {/* Twitter 绑定弹窗 */}
      {showTwitterBind && (
        <TwitterBindModal
          isOpen={showTwitterBind}
          onClose={() => setShowTwitterBind(false)}
          api={api}
          t={t}
          onBindSuccess={handleTwitterBindSuccess}
        />
      )}
    </>
  );
}
