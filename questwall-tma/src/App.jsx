import React, { useEffect, useState, useMemo } from 'react';
import { useTelegram, useTheme, useLocale } from './hooks';
import { createApiService } from './services/api';
import {
  Header,
  UserCard,
  QuestCard,
  QuestModal,
  Loading,
  EmptyState,
  CheckInCard,
  Toast,
  InviteCard,
  BottomNav,
  RewardsPage,
  ProfilePage,
  TutorialPage,
  HomePageSkeleton,
  QuestsPageSkeleton,
  PageTransition,
  StaggeredList,
  AnimatedButton,
  SuccessAnimation,
  PullToRefresh,
  QuestFilter,
  Leaderboard,
  TransactionHistory,
  WithdrawModal,
} from './components';
import { TwitterBindModal } from './components/TwitterBindModal';
import { IconQuest, IconFire, IconCheck } from './components/icons/CyberpunkIcons';
import { globalStyles, baseStyles } from './styles/globalStyles';

// 邀请奖励
const INVITE_REWARD = 10;

// Bot 用户名
const BOT_USERNAME = 'questwall_test_bot';

export function App() {
  const { tg, user, initData, startParam } = useTelegram();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeQuest, setActiveQuest] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authStatus, setAuthStatus] = useState('pending');
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');
  const theme = useTheme(tg);
  const { locale, setLocale, t, locales: supportedLocales } = useLocale();

  // 不覆盖 body 背景色，使用 globalStyles.js 中的渐变背景
  // useEffect(() => {
  //   document.body.style.backgroundColor = theme.secondaryBg;
  // }, [theme.secondaryBg]);

  // 计算页面切换动画方向
  const getTransitionType = () => {
    const tabOrder = ['home', 'quests', 'tutorials', 'rewards', 'profile'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const prevIndex = tabOrder.indexOf(previousTab);
    if (currentIndex > prevIndex) return 'slide-right';
    if (currentIndex < prevIndex) return 'slide-left';
    return 'fade';
  };

  // Tab 切换处理
  const handleTabChange = (newTab) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  // Toast 提示状态
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // 成功动画状态
  const [showSuccess, setShowSuccess] = useState(false);

  // 任务筛选状态
  const [questFilter, setQuestFilter] = useState(null);
  const [questSearch, setQuestSearch] = useState('');

  // 刷新状态
  const [refreshing, setRefreshing] = useState(false);

  // 提现弹窗状态
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Twitter 绑定弹窗状态
  const [showTwitterModal, setShowTwitterModal] = useState(false);
  const [twitterStatus, setTwitterStatus] = useState({ bound: false, twitterUsername: null });

  // 显示 Toast
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  // 虚拟钱包状态
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem('questwall_wallet');
    return saved ? JSON.parse(saved) : {
      connected: false,
      address: null,
      balances: { stars: 0, ton: 0, usdt: 0, points: 0 }
    };
  });

  // 已完成任务
  const [completedQuests, setCompletedQuests] = useState(() => {
    const saved = localStorage.getItem('questwall_completed');
    return saved ? JSON.parse(saved) : [];
  });

  // 待审核任务
  const [pendingQuests, setPendingQuests] = useState([]);

  // 签到数据（从后端获取）
  const [checkInData, setCheckInData] = useState({
    lastCheckIn: null,
    streak: 0,
    totalCheckIns: 0,
    todayChecked: false,
    checkInHistory: []
  });
  const [checkInLoading, setCheckInLoading] = useState(false);

  // 邀请数据
  const [inviteData, setInviteData] = useState(() => {
    const saved = localStorage.getItem('questwall_invite');
    return saved ? JSON.parse(saved) : {
      inviteCount: 0,
      totalBonus: 0,
      inviteBonus: 0,
      commissionBonus: 0,
      config: null,
      invitedUsers: []
    };
  });

  // 保存钱包状态到 localStorage
  useEffect(() => {
    localStorage.setItem('questwall_wallet', JSON.stringify(wallet));
  }, [wallet]);

  // 保存已完成任务到 localStorage
  useEffect(() => {
    localStorage.setItem('questwall_completed', JSON.stringify(completedQuests));
  }, [completedQuests]);

  // API 服务（当 authToken 变化时重新创建，确保 headers 包含最新 token）
  const api = useMemo(() => createApiService(authToken), [authToken]);

  // 从后端获取签到状态
  useEffect(() => {
    const fetchCheckInStatus = async () => {
      if (!authToken) return;
      setCheckInLoading(true);
      try {
        const status = await api.getCheckInStatus();
        if (status) {
          setCheckInData({
            lastCheckIn: status.lastCheckIn,
            streak: status.streak || 0,
            totalCheckIns: status.totalCheckIns || 0,
            todayChecked: status.todayChecked || false,
            checkInHistory: status.checkInHistory || []
          });
        }
      } catch (error) {
        console.error('获取签到状态失败:', error);
      } finally {
        setCheckInLoading(false);
      }
    };
    fetchCheckInStatus();
  }, [authToken]);

  // 从后端获取邀请状态
  useEffect(() => {
    const fetchInviteStatus = async () => {
      if (!authToken) return;
      try {
        const status = await api.getInviteStatus();
        if (status) {
          setInviteData({
            inviteCount: status.inviteCount || 0,
            totalBonus: status.totalBonus || 0,
            inviteBonus: status.inviteBonus || 0,
            commissionBonus: status.commissionBonus || 0,
            config: status.config || null,
            invitedUsers: status.invitedUsers || []
          });
        }
      } catch (error) {
        console.error('获取邀请状态失败:', error);
      }
    };
    fetchInviteStatus();
  }, [authToken]);

  // 保存邀请数据到 localStorage（作为缓存）
  useEffect(() => {
    localStorage.setItem('questwall_invite', JSON.stringify(inviteData));
  }, [inviteData]);

  // 获取 Twitter 绑定状态
  useEffect(() => {
    const fetchTwitterStatus = async () => {
      if (!authToken) return;
      try {
        const status = await api.getTwitterStatus();
        setTwitterStatus({
          bound: status.bound || false,
          twitterUsername: status.twitterUsername || null,
        });
      } catch (error) {
        console.error('获取 Twitter 状态失败:', error);
      }
    };
    fetchTwitterStatus();
  }, [authToken]);

  // 保存邀请码，等认证后处理
  const [pendingInviteCode, setPendingInviteCode] = useState(null);

  // 当 startParam 变化时更新 pendingInviteCode（优先从 Telegram startParam，其次从 URL 参数）
  useEffect(() => {
    // 1. 优先检查 Telegram 的 startParam
    if (startParam && startParam.startsWith('ref_')) {
      console.log('检测到邀请码 (Telegram startParam):', startParam);
      setPendingInviteCode(startParam);
      return;
    }

    // 2. 检查 URL 参数（从 Bot 深度链接跳转过来时）
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam && refParam.startsWith('ref_')) {
      console.log('检测到邀请码 (URL ref):', refParam);
      setPendingInviteCode(refParam);
    }
  }, [startParam]);

  // 处理邀请（需要认证后调用后端 API）
  useEffect(() => {
    const processInviteIfNeeded = async () => {
      // 需要有 token 和待处理的邀请码
      if (!authToken || !pendingInviteCode) return;

      // 检查是否已经处理过
      const processed = localStorage.getItem('questwall_invite_processed');
      if (processed) {
        setPendingInviteCode(null);
        return;
      }

      try {
        console.log('处理邀请码:', pendingInviteCode);
        const result = await api.processInvite(pendingInviteCode);

        if (result.success) {
          // 标记已处理
          localStorage.setItem('questwall_invite_processed', 'true');

          // 显示成功提示
          showToast(result.message || `欢迎！通过邀请链接获得 ${result.inviteeReward || INVITE_REWARD} Stars`, 'stars');

          // 刷新邀请数据
          const inviteStatus = await api.getInviteStatus();
          if (inviteStatus) {
            setInviteData({
              inviteCount: inviteStatus.inviteCount || 0,
              totalBonus: inviteStatus.totalBonus || 0,
              inviteBonus: inviteStatus.inviteBonus || 0,
              commissionBonus: inviteStatus.commissionBonus || 0,
              config: inviteStatus.config || null,
              invitedUsers: inviteStatus.invitedUsers || []
            });
          }
        } else {
          // 如果是"已被邀请过"的错误，也标记已处理
          if (result.message?.includes('已被邀请') || result.message?.includes('已邀请')) {
            localStorage.setItem('questwall_invite_processed', 'true');
          }
          console.log('邀请处理结果:', result.message);
        }
      } catch (error) {
        console.error('处理邀请失败:', error);
      }

      setPendingInviteCode(null);
    };

    processInviteIfNeeded();
  }, [authToken, pendingInviteCode]);

  // Telegram 认证
  useEffect(() => {
    const authenticate = async () => {
      console.log('🔐 开始认证, initData:', initData ? initData.substring(0, 50) + '...' : 'null');
      if (initData) {
        const result = await api.auth(initData);
        console.log('🔐 认证结果:', result);
        if (result.token) {
          setAuthToken(result.token);
          setAuthStatus('success');
        } else {
          console.error('🔐 认证失败:', result);
          setAuthStatus('failed');
        }
      } else {
        // 开发模式：自动调用 dev-login 获取测试 token
        console.log('🔐 无 initData，尝试开发模式登录');
        const devResult = await api.devLogin();
        if (devResult.token) {
          console.log('🔐 开发模式登录成功');
          setAuthToken(devResult.token);
          setAuthStatus('dev');
        } else {
          console.log('🔐 开发模式登录失败，无认证运行');
          setAuthStatus('dev');
        }
      }
    };
    const timer = setTimeout(authenticate, 500);
    return () => clearTimeout(timer);
  }, [initData]);

  // 获取任务列表（支持多语言）
  useEffect(() => {
    const fetchQuests = async () => {
      setLoading(true);
      try {
        const data = await api.getQuests(locale);
        setQuests(data.items);

        // 根据后端返回的 userStatus 设置已完成任务列表（以后端为准）
        const completedFromBackend = data.items
          .filter(q => q.userStatus === 'REWARDED')
          .map(q => q.id);
        setCompletedQuests(completedFromBackend);

        // 设置待审核任务列表
        const pendingFromBackend = data.items
          .filter(q => q.userStatus === 'SUBMITTED')
          .map(q => q.id);
        setPendingQuests(pendingFromBackend);
      } catch (error) {
        console.error('获取任务列表失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuests();
  }, [authToken, locale]);

  // 提现处理
  const handleWithdraw = async (asset, amount, toAddress) => {
    try {
      const result = await api.requestWithdraw(asset, amount, toAddress);
      if (result.success) {
        showToast(`提现申请已提交！${result.actualAmount} ${asset}`, 'success');
        // 本地更新余额（实际应从后端刷新）
        setWallet(prev => ({
          ...prev,
          balances: {
            ...prev.balances,
            [asset.toLowerCase()]: Math.max(0, (prev.balances[asset.toLowerCase()] || 0) - amount)
          }
        }));
        return { success: true };
      } else {
        return { success: false, message: result.message || '提现失败' };
      }
    } catch (error) {
      console.error('提现失败:', error);
      return { success: false, message: '网络错误' };
    }
  };

  // 签到
  const handleCheckIn = async () => {
    if (checkInData.todayChecked || checkInLoading) return;

    setCheckInLoading(true);
    try {
      const result = await api.checkIn();
      if (result.success) {
        const todayStr = new Date().toISOString().split('T')[0];
        setCheckInData(prev => ({
          lastCheckIn: new Date().toISOString(),
          streak: result.streak || prev.streak + 1,
          totalCheckIns: prev.totalCheckIns + 1,
          todayChecked: true,
          checkInHistory: [...(prev.checkInHistory || []), todayStr]
        }));

        // 更新钱包余额
        if (result.reward) {
          setWallet(prev => ({
            ...prev,
            balances: {
              ...prev.balances,
              stars: (prev.balances.stars || 0) + result.reward
            }
          }));
        }

        const successMsg = t ? t('checkIn.checkInSuccess', { streak: result.streak || checkInData.streak + 1, reward: result.reward || 10 }) : `Check-in success! ${result.streak || checkInData.streak + 1} days streak, +${result.reward || 10} Stars`;
        showToast(successMsg, 'stars');
      } else {
        showToast(result.message || (t ? t('error.unknown') : 'Check-in failed'), 'warning');
      }
    } catch (error) {
      console.error('签到失败:', error);
      showToast(t ? t('error.network') : 'Check-in failed, please retry', 'warning');
    } finally {
      setCheckInLoading(false);
    }
  };

  // 补签
  const handleMakeup = async (dateStr, cost) => {
    if (checkInLoading) return;

    // 检查是否有足够的 Stars
    if ((wallet.balances.stars || 0) < cost) {
      showToast(t ? t('rewards.insufficientBalance') : `Insufficient Stars! Need ${cost} Stars`, 'warning');
      return;
    }

    // 检查是否已经签到过
    if (checkInData.checkInHistory?.includes(dateStr)) {
      showToast(t ? t('checkIn.alreadyChecked') : 'Already checked in on this date', 'warning');
      return;
    }

    setCheckInLoading(true);
    try {
      const result = await api.makeupCheckIn(dateStr);
      if (result.success) {
        // 更新签到历史和累计天数
        setCheckInData(prev => ({
          ...prev,
          totalCheckIns: prev.totalCheckIns + 1,
          checkInHistory: [...(prev.checkInHistory || []), dateStr]
        }));

        // 更新钱包余额（扣除补签费用，加上奖励）
        const netChange = (result.reward || 10) - (result.cost || cost);
        setWallet(prev => ({
          ...prev,
          balances: {
            ...prev.balances,
            stars: (prev.balances.stars || 0) + netChange
          }
        }));

        const makeupMsg = t ? t('checkIn.makeupSuccess', { cost: result.cost || cost, reward: result.reward || 10 }) : `Make up success! Cost ${result.cost || cost} Stars, got ${result.reward || 10} Stars`;
        showToast(makeupMsg, 'stars');
      } else {
        showToast(result.message || (t ? t('error.unknown') : 'Make up failed'), 'warning');
      }
    } catch (error) {
      console.error('补签失败:', error);
      showToast(t ? t('error.network') : 'Make up failed, please retry', 'warning');
    } finally {
      setCheckInLoading(false);
    }
  };

  // 生成邀请链接（使用 Bot 深度链接格式）
  const getInviteLink = () => {
    const userId = user?.id || 'dev_user';
    return `https://t.me/${BOT_USERNAME}?start=ref_${userId}`;
  };

  // 复制邀请链接
  const handleCopyInviteLink = () => {
    const link = getInviteLink();
    navigator.clipboard.writeText(link).then(() => {
      showToast('链接已复制！', 'success');
    }).catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('链接已复制！', 'success');
    });
  };

  // 分享邀请链接
  const handleShareInvite = () => {
    const link = getInviteLink();
    const inviterReward = inviteData.config?.inviterReward || 1;
    const text = t ? t('invite.shareText').replace('{amount}', inviterReward) : `来 Quest Wall 做任务赚奖励！使用我的邀请链接注册，你我各得 ${inviterReward} USDT！`;

    if (tg?.openTelegramLink) {
      // 使用 Telegram 分享
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
    } else {
      // 降级：复制到剪贴板
      navigator.clipboard.writeText(`${text}\n${link}`);
      showToast('分享内容已复制！', 'success');
    }
  };

  const handleStartQuest = async (quest) => {
    if (completedQuests.includes(quest.id)) {
      showToast('你已经完成过这个任务了！', 'warning');
      return;
    }
    setActiveQuest(quest);
  };

  const handleSubmitQuest = async () => {
    if (!activeQuest) return;

    // 统一使用 USDT 奖励
    const rewardAmount = parseFloat(activeQuest.reward.amount);
    const questId = activeQuest.id;

    // 立即更新本地状态（乐观更新）
    setWallet(prev => ({
      ...prev,
      balances: {
        ...prev.balances,
        usdt: (prev.balances.usdt || 0) + rewardAmount
      }
    }));

    setCompletedQuests(prev => [...prev, questId]);
    setActiveQuest(null);

    // 显示成功动画
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);

    showToast(`任务完成！+${rewardAmount} USDT`, 'usdt');

    // 异步刷新任务列表，确保数据同步
    try {
      const data = await api.getQuests(locale);
      setQuests(data.items);
      // 从后端同步已完成任务列表
      const completedFromBackend = data.items
        .filter(q => q.userStatus === 'REWARDED')
        .map(q => q.id);
      setCompletedQuests(completedFromBackend);
      // 同步待审核任务列表
      const pendingFromBackend = data.items
        .filter(q => q.userStatus === 'SUBMITTED')
        .map(q => q.id);
      setPendingQuests(pendingFromBackend);
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    }
  };

  // 计算总积分
  const totalPoints = Math.floor(
    (wallet.balances.stars || 0) * 1 +
    (wallet.balances.ton || 0) * 100 +
    (wallet.balances.usdt || 0) * 10 +
    (wallet.balances.points || 0) * 1
  );

  // 过滤出未完成的任务（加入筛选和搜索）
  const availableQuests = quests.filter(q => {
    // 已完成的任务不显示
    if (completedQuests.includes(q.id)) return false;
    // 分类筛选
    if (questFilter) {
      const questType = q.type?.toUpperCase(); // 确保大写
      if (questFilter === 'telegram') {
        // TG任务：频道、群组
        if (!['JOIN_CHANNEL', 'JOIN_GROUP'].includes(questType)) return false;
      } else if (questFilter === 'twitter') {
        // 推特任务：关注、转发、点赞、评论
        if (!['FOLLOW_TWITTER', 'RETWEET_TWITTER', 'LIKE_TWITTER', 'COMMENT_TWITTER'].includes(questType)) return false;
      } else if (questType !== questFilter.toUpperCase()) {
        return false;
      }
    }
    if (questSearch && !q.title.toLowerCase().includes(questSearch.toLowerCase())) return false;
    return true;
  });

  // 刷新任务列表
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await api.getQuests(locale);
      setQuests(data.items);

      // 根据后端返回的 userStatus 更新已完成任务列表
      const completedFromBackend = data.items
        .filter(q => q.userStatus === 'REWARDED')
        .map(q => q.id);
      if (completedFromBackend.length > 0) {
        setCompletedQuests(prev => {
          const newCompleted = [...new Set([...prev, ...completedFromBackend])];
          return newCompleted;
        });
      }

      setToast({
        visible: true,
        message: t ? t('common.refreshSuccess') : '刷新成功',
        type: 'refresh',
        position: 'top'
      });
    } catch (error) {
      console.error('刷新失败:', error);
      setToast({
        visible: true,
        message: '刷新失败',
        type: 'error',
        position: 'top'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const containerStyle = {
    ...baseStyles.container,
    backgroundColor: 'transparent',
    // 为底部导航 + 安全区域留出空间
    paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
  };

  const sectionHeaderStyle = {
    padding: '8px 20px 12px',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: "'Orbitron', sans-serif",
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  // 统一的页面标题样式
  const pageHeaderStyle = {
    padding: '24px 18px 16px',
    position: 'relative',
  };

  const pageTitleStyle = {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: "'Orbitron', sans-serif",
    color: '#fff',
    margin: 0,
    marginBottom: 4,
    textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
  };

  const pageSubtitleStyle = {
    fontSize: 13,
    fontFamily: "'Rajdhani', sans-serif",
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
  };

  // 渲染首页内容
  const renderHomePage = () => (
    <>
      <UserCard user={user} authStatus={authStatus} completedCount={completedQuests.length} t={t} />
      <Header
        completedCount={completedQuests.length}
        totalPoints={totalPoints}
        t={t}
      />

      {/* 签到卡片 */}
      <CheckInCard
        checkInData={checkInData}
        onCheckIn={handleCheckIn}
        onMakeup={handleMakeup}
        t={t}
      />

      {/* 邀请卡片 */}
      <InviteCard
        inviteData={{
          inviteCount: inviteData.inviteCount,
          totalBonus: inviteData.totalBonus,
          inviteBonus: inviteData.inviteBonus,
          commissionBonus: inviteData.commissionBonus,
          config: inviteData.config,
          inviteLink: getInviteLink()
        }}
        onCopyLink={handleCopyInviteLink}
        onShare={handleShareInvite}
        t={t}
      />

      <div style={sectionHeaderStyle}>
        <IconFire size={18} color="#ff6b35" />
        <span>{t('home.hotQuests')}</span>
      </div>

      {loading ? (
        <Loading />
      ) : availableQuests.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <StaggeredList delay={50}>
          {availableQuests.slice(0, 3).map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onStart={handleStartQuest}
              isCompleted={completedQuests.includes(quest.id)}
              isPending={pendingQuests.includes(quest.id)}
              t={t}
            />
          ))}
        </StaggeredList>
      )}

      {availableQuests.length > 3 && (
        <div style={{
          textAlign: 'center',
          padding: '12px 16px 20px',
        }}>
          <AnimatedButton
            onClick={() => handleTabChange('quests')}
            style={{
              padding: '12px 28px',
              fontSize: 12,
              fontWeight: '700',
              fontFamily: "'Orbitron', sans-serif",
              borderRadius: 10,
              border: '1px solid rgba(0, 229, 255, 0.3)',
              background: 'rgba(0, 229, 255, 0.1)',
              color: '#00e5ff',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {t('home.viewAllQuests')}
          </AnimatedButton>
        </div>
      )}
    </>
  );

  // 渲染任务页面
  const renderQuestsPage = () => (
    <PullToRefresh onRefresh={handleRefresh}>
      <div style={pageHeaderStyle}>
        <h2 style={pageTitleStyle}>{t('quest.title')}</h2>
        <p style={pageSubtitleStyle}>{t('quest.subtitle')}</p>
      </div>

      {/* 筛选和搜索 */}
      <QuestFilter
        onFilterChange={setQuestFilter}
        onSearchChange={setQuestSearch}
        t={t}
      />

      <div style={sectionHeaderStyle}>
        <IconQuest size={18} color="#00e5ff" />
        <span>{t('quest.available')}</span>
        <span style={{
          marginLeft: 'auto',
          background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
          color: '#000',
          padding: '3px 10px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: '700',
        }}>
          {availableQuests.length}
        </span>
      </div>

      {loading ? (
        <Loading />
      ) : availableQuests.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <StaggeredList delay={60}>
          {availableQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onStart={handleStartQuest}
              isCompleted={completedQuests.includes(quest.id)}
              isPending={pendingQuests.includes(quest.id)}
              t={t}
            />
          ))}
        </StaggeredList>
      )}

      {completedQuests.length > 0 && (
        <>
          <div style={sectionHeaderStyle}>
            <IconCheck size={18} color="#39ff14" />
            <span>{t('quest.completed')}</span>
            <span style={{
              marginLeft: 'auto',
              background: 'linear-gradient(135deg, #39ff14, #00e5ff)',
              color: '#000',
              padding: '3px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: '700',
            }}>
              {completedQuests.length}
            </span>
          </div>
          <StaggeredList delay={60}>
            {quests.filter(q => completedQuests.includes(q.id)).map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStart={handleStartQuest}
                theme={theme}
                isCompleted={true}
                t={t}
              />
            ))}
          </StaggeredList>
        </>
      )}
    </PullToRefresh>
  );

  // 根据当前 tab 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomePage();
      case 'quests':
        return renderQuestsPage();
      case 'rewards':
        return (
          <>
            <div style={pageHeaderStyle}>
              <h2 style={pageTitleStyle}>{t('rewards.title')}</h2>
              <p style={pageSubtitleStyle}>{t('rewards.subtitle')}</p>
            </div>
            <RewardsPage wallet={wallet} t={t} onWithdraw={() => setShowWithdrawModal(true)} api={api} />

            {/* 排行榜 */}
            <div style={{ marginTop: 16 }}>
              <Leaderboard currentUser={user} wallet={wallet} api={api} t={t} />
            </div>

            {/* 交易历史（提现记录） */}
            <div style={{ marginTop: 16, paddingBottom: 20 }}>
              <TransactionHistory api={api} t={t} />
            </div>
          </>
        );
      case 'tutorials':
        return (
          <>
            <div style={pageHeaderStyle}>
              <h2 style={pageTitleStyle}>{t('tutorials.title')}</h2>
              <p style={pageSubtitleStyle}>{t('tutorials.subtitle')}</p>
            </div>
            <TutorialPage api={api} t={t} />
          </>
        );
      case 'profile':
        return (
          <>
            <div style={pageHeaderStyle}>
              <h2 style={pageTitleStyle}>{t('profile.title')}</h2>
              <p style={pageSubtitleStyle}>{t('profile.subtitle')}</p>
            </div>
            <ProfilePage
              user={user}
              authStatus={authStatus}
              wallet={wallet}
              completedQuests={completedQuests}
              checkInData={checkInData}
              inviteData={inviteData}
              token={authToken}
              t={t}
              locale={locale}
              setLocale={setLocale}
              supportedLocales={supportedLocales}
              onTwitterBind={() => setShowTwitterModal(true)}
              twitterBound={twitterStatus.bound}
              twitterUsername={twitterStatus.twitterUsername}
            />
          </>
        );
      default:
        return renderHomePage();
    }
  };

  return (
    <div style={containerStyle}>
      <style>{globalStyles}</style>

      {/* 霓虹背景效果 */}
      <div className="bg-grid" />

      {/* 动态光球 */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
        <div className="orb orb-6" />
        <div className="orb orb-7" />
        <div className="orb orb-8" />
      </div>

      {/* 12颗闪烁星星 */}
      <div className="stars">
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
        <div className="star" />
      </div>

      {/* 流星效果 */}
      <div className="meteors">
        <div className="meteor" />
        <div className="meteor" />
        <div className="meteor" />
        <div className="meteor" />
      </div>

      <PageTransition pageKey={activeTab} type={getTransitionType()}>
        {loading && activeTab === 'home' ? (
          <HomePageSkeleton />
        ) : loading && activeTab === 'quests' ? (
          <QuestsPageSkeleton />
        ) : (
          renderContent()
        )}
      </PageTransition>

      <QuestModal
        quest={activeQuest}
        onClose={() => setActiveQuest(null)}
        onSubmit={handleSubmitQuest}
        api={api}
        twitterBound={twitterStatus.bound}
        twitterUsername={twitterStatus.twitterUsername}
        onTwitterBindSuccess={() => {
          // 刷新 Twitter 状态
          api.getTwitterStatus().then(status => {
            setTwitterStatus({
              bound: status.bound || false,
              twitterUsername: status.twitterUsername || null,
            });
          });
        }}
      />

      {/* 底部导航 */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        t={t}
      />

      {/* 提现弹窗 */}
      <WithdrawModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        wallet={wallet}
        onWithdraw={handleWithdraw}
        t={t}
      />

      {/* Twitter 绑定弹窗 */}
      <TwitterBindModal
        isOpen={showTwitterModal}
        onClose={() => setShowTwitterModal(false)}
        api={api}
        t={t}
        onBindSuccess={() => {
          showToast(t ? t('twitter.bindSuccess') : 'Twitter 绑定成功！', 'success');
          // 刷新 Twitter 状态
          api.getTwitterStatus().then(status => {
            setTwitterStatus({
              bound: status.bound || false,
              twitterUsername: status.twitterUsername || null,
            });
          });
        }}
        onUnbindSuccess={() => {
          showToast(t ? t('twitter.unbindSuccess') : 'Twitter 已解绑', 'success');
          // 刷新 Twitter 状态
          setTwitterStatus({
            bound: false,
            twitterUsername: null,
          });
        }}
      />

      {/* Toast 提示 */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        position={toast.position || 'center'}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* 成功动画 */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 3000,
        }}>
          <SuccessAnimation show={showSuccess} size={80} />
        </div>
      )}
    </div>
  );
}
