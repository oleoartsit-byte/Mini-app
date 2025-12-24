// 多语言配置文件

export const locales = {
  zh: {
    // 语言标识
    locale: 'zh',

    // 通用
    common: {
      confirm: '确认',
      cancel: '取消',
      back: '返回',
      close: '关闭',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      retry: '重试',
      refresh: '刷新',
      refreshSuccess: '刷新成功',
      success: '成功',
      error: '错误',
      warning: '警告',
      copy: '复制',
      share: '分享',
      viewAll: '查看全部',
      more: '更多',
      today: '今天',
      yesterday: '昨天',
    },

    // 底部导航
    nav: {
      home: '首页',
      quests: '任务',
      tutorials: '教程',
      rewards: '奖励',
      profile: '我的',
    },

    // 教程
    tutorials: {
      title: '官方教程',
      subtitle: '学习如何完成各类任务',
      searchPlaceholder: '搜索教程...',
      empty: '暂无教程',
      watchVideo: '观看视频',
      images: '张图片',
      category: {
        all: '全部',
        telegram: 'Telegram',
        twitter: 'Twitter',
        wallet: '钱包',
        invite: '邀请',
        other: '其他',
      },
      type: {
        article: '文章',
        video: '视频',
        imageText: '图文',
      },
    },

    // 首页
    home: {
      appName: '任务墙',
      slogan: '完成任务，赚取奖励',
      hotQuests: '热门任务',
      viewAllQuests: '查看全部任务 →',
      completed: '已完成',
      points: '积分',
      rank: '排名',
    },

    // 用户卡片
    user: {
      welcome: '欢迎回来',
      guest: '游客',
      authSuccess: '已认证',
      authFailed: '认证失败',
      authPending: '认证中...',
      devMode: '开发模式',
      // 等级称号
      newbie: '新手玩家',
      advanced: '进阶玩家',
      elite: '精英玩家',
      master: '大师玩家',
      legendary: '传奇玩家',
    },

    // 签到
    checkIn: {
      title: '每日签到',
      todayReward: '今日奖励',
      streak: '连续签到',
      day: '天',
      days: '天',
      checkInBtn: '签到',
      checkedIn: '已签到',
      makeup: '补签',
      makeupCost: '消耗 {cost} 积分',
      makeupSuccess: '补签成功！消耗 {cost} 积分，获得 {reward} 积分',
      checkInSuccess: '签到成功！连续 {streak} 天，+{reward} 积分',
      selectDate: '选择要补签的日期',
      today: '今',
      missed: '漏',
      missedHint: '您有 {count} 天漏签，点击日期即可补签',
      weekDays: {
        0: '周日',
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六',
      },
    },

    // 邀请
    invite: {
      title: '邀请好友',
      subtitle: '邀请得 {amount} USDT 💵',
      inviteCount: '已邀请',
      totalBonus: '总奖励',
      inviteBonus: '邀请奖励',
      commissionBonus: '返佣',
      people: '人',
      copyLink: '复制链接',
      shareToTg: '分享到 Telegram',
      linkCopied: '链接已复制！',
      shareText: '来 Quest Wall 做任务赚奖励！使用我的邀请链接注册，你我各得 {amount} USDT！',
    },

    // 钱包
    wallet: {
      title: '我的钱包',
      connect: '连接钱包',
      disconnect: '断开',
      connected: '钱包连接成功！',
      disconnected: '钱包已断开',
      balance: '余额',
      withdraw: '提现',
      withdrawNote: '提现申请将在 1-3 个工作日内处理',
    },

    // 提现
    withdraw: {
      title: '提现',
      usdtTitle: 'USDT 提现',
      amount: '提现金额',
      address: '提现地址',
      recipientAddress: '收款地址',
      addressPlaceholder: '输入钱包地址',
      addressPlaceholderFull: '输入 TRC20 或 ERC20 钱包地址',
      addressHint: '支持 TRC20 (T开头) 和 ERC20 (0x开头) 地址',
      available: '可用余额',
      withdrawableBalance: '可提现余额',
      minAmount: '最低提现',
      fee: '手续费',
      feeAmount: '免费',
      estimatedArrival: '预计到账',
      min: '最低',
      max: '全部',
      submit: '确认提现',
      submitWithdraw: '提交提现申请',
      submitting: '提交中...',
      errorAmount: '请输入有效金额',
      errorMinAmount: '最低提现金额为 {min} {asset}',
      errorBalance: '余额不足',
      errorAddress: '请输入收款地址',
      errorAddressFormat: '请输入有效的 TRC20 或 ERC20 地址',
      errorFailed: '提现申请失败',
      errorNetwork: '网络错误，请重试',
      starsNote: 'Stars 将直接发送到您的 Telegram 账户',
      note: '提现申请将在 24 小时内处理',
      noteFull: '提现申请提交后，将由客服人员审核并手动转账，预计 1-3 个工作日内处理',
      // 成功页面
      successTitle: '提现申请已提交',
      successMessage: '您的提现申请已成功提交，正在等待审核。审核通过后，客服将在 1-3 个工作日内为您转账。',
      requestedAmount: '申请金额',
      viewHistory: '查看提现记录',
      close: '关闭',
      // 历史记录
      history: '提现记录',
      historyTitle: '提现记录',
      submitSuccess: '提交成功',
      noHistory: '暂无提现记录',
      loading: '加载中...',
      backToWithdraw: '返回提现',
      toAddress: '收款地址',
      applyTime: '申请时间',
      processTime: '处理时间',
      // Tab
      tabWithdraw: '提现',
      tabHistory: '记录',
    },

    // 奖励
    reward: {
      points: '积分',
      usdt: 'USDT',
    },

    // 任务
    quest: {
      title: '任务中心',
      subtitle: '完成任务，获取奖励',
      available: '可用任务',
      completed: '已完成',
      reward: '奖励',
      start: '开始',
      complete: '完成',
      verify: '验证',
      alreadyCompleted: '你已经完成过这个任务了！',
      completedSuccess: '任务完成！+{amount} USDT +{points} 积分',
      participants: '{count} 人已参与',
      // 任务类型
      types: {
        join_channel: '关注频道',
        join_group: '加入群组',
        deep_link: '访问链接',
        follow_twitter: '关注推特',
        retweet_twitter: '转发推特',
        like_twitter: '点赞推特',
        comment_twitter: '评论推特',
        like_post: '点赞帖子',
        onchain_transfer: '链上转账',
        mint_nft: '铸造 NFT',
        wallet_bind: '绑定钱包',
        form: '填写表单',
        custom: '自定义任务',
        default: '任务',
      },
      // 任务操作
      actions: {
        goFollow: '前往关注',
        goJoin: '前往加入',
        goVisit: '前往访问',
        verifyFollow: '验证关注',
        verifyJoin: '验证加入',
        confirmComplete: '确认完成',
      },
      // 验证状态
      verify: {
        verifying: '正在验证...',
        pleaseWait: '请稍候',
        success: '验证成功！',
        completing: '任务即将完成',
        failed: '验证未通过',
        followFirst: '请先关注频道后再验证',
        joinFirst: '请先加入群组后再验证',
        retryLater: '验证失败，请稍后重试',
      },
      // 步骤
      steps: {
        follow: '关注',
        join: '加入',
        verify: '验证',
        done: '完成',
      },
      // 验证提示
      verifyHint: {
        channel: '已关注频道？点击验证完成任务',
        group: '已加入群组？点击验证完成任务',
      },
    },

    // 筛选
    filter: {
      all: '全部',
      telegram: 'TG任务',
      twitter: '推特任务',
      searchPlaceholder: '搜索任务...',
    },

    // Twitter 绑定
    twitter: {
      title: 'Twitter 绑定',
      bindTitle: '绑定 Twitter 账号',
      bindDesc: '绑定后可以验证您是否完成了 Twitter 任务，确保奖励发放',
      placeholder: '输入您的 Twitter 用户名',
      enterUsername: '请输入 Twitter 用户名',
      next: '下一步',
      verifyTitle: '验证账号所有权',
      step1: '复制下方验证码',
      step2: '引用转发官方推文并附上验证码',
      step3: '发布后点击验证',
      postTweet: '引用转发',
      codeExpiry: '验证码 10 分钟内有效，验证后可删除推文',
      verifyAndBind: '验证并绑定',
      gettingCode: '正在获取验证码...',
      getCodeFailed: '获取验证码失败',
      verifying: '正在验证推文...',
      success: '绑定成功',
      bindSuccess: '成功绑定 Twitter 账号',
      bindFailed: '绑定失败',
      bound: 'Twitter 已绑定',
      boundDesc: '您可以参与 Twitter 任务并获得真实验证',
      verified: '已验证绑定',
      unbind: '解除绑定',
      unbinding: '正在解绑...',
      unbindFailed: '解绑失败',
      alreadyOwned: '该 Twitter 账号已被其他用户绑定过，无法绑定到您的账号',
    },

    // 奖励页面
    rewards: {
      title: '我的奖励',
      subtitle: '查看和管理您的奖励',
      totalValue: '总价值',
      convert: '兑换',
      convertTitle: '兑换 Stars',
      convertHint: '选择兑换目标',
      convertTo: '兑换为 {target}',
      rate: '汇率',
      insufficientBalance: 'Stars 余额不足',
      convertSuccess: '兑换成功！',
      history: '奖励记录',
    },

    // 排行榜
    leaderboard: {
      title: '排行榜',
      rank: '排名',
      points: '积分',
      you: '你',
      questsCompleted: '{count} 任务完成',
      myRank: '我的排名',
      tasksTab: '任务榜',
      invitesTab: '邀请榜',
      invites: '邀请人数',
      inviteCount: '{count} 人邀请',
    },

    // 交易历史
    history: {
      title: '交易历史',
      noRecords: '暂无交易记录',
      income: '收入',
      expense: '支出',
    },

    // 个人中心
    profile: {
      title: '个人中心',
      subtitle: '管理您的账户设置',
      stats: '统计数据',
      completedQuests: '完成任务',
      checkInDays: '签到天数',
      invitedFriends: '邀请好友',
      settings: '设置',
      language: '语言',
      theme: '主题',
      notifications: '通知设置',
    },

    // 通知设置
    notifications: {
      title: '通知设置',
      questComplete: '任务完成通知',
      reward: '奖励到账通知',
      newQuest: '新任务通知',
      checkIn: '签到提醒',
      invite: '邀请成功通知',
      testNotification: '发送测试通知',
      testSent: '测试通知已发送！',
    },

    // 主题
    theme: {
      title: '主题设置',
      dark: '深色模式',
      light: '浅色模式',
      system: '跟随系统',
    },

    // 语言
    language: {
      title: '语言设置',
      zh: '简体中文',
      en: 'English',
    },

    // 空状态
    empty: {
      noQuests: '暂无可用任务',
      noQuestsDesc: '休息一下，稍后再来看看吧',
      noRewards: '还没有奖励记录',
      noRewardsDesc: '完成任务即可获得奖励',
      noHistory: '暂无交易记录',
      noHistoryDesc: '您的交易记录将显示在这里',
      noResults: '未找到相关任务',
      noResultsDesc: '试试其他搜索词或筛选条件',
      noInvites: '暂无邀请数据',
    },

    // 错误状态
    error: {
      network: '网络连接失败',
      networkDesc: '请检查网络连接后重试',
      server: '服务器开小差了',
      serverDesc: '工程师正在紧急修复中',
      timeout: '请求超时',
      timeoutDesc: '服务器响应时间过长，请稍后重试',
      unknown: '出错了',
      unknownDesc: '发生了未知错误，请稍后重试',
    },

    // 离线
    offline: {
      message: '网络已断开，请检查连接',
    },
  },

  en: {
    // Locale identifier
    locale: 'en',

    // Common
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      back: 'Back',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      retry: 'Retry',
      refresh: 'Refresh',
      refreshSuccess: 'Refreshed',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      copy: 'Copy',
      share: 'Share',
      viewAll: 'View All',
      more: 'More',
      today: 'Today',
      yesterday: 'Yesterday',
    },

    // Bottom Navigation
    nav: {
      home: 'Home',
      quests: 'Quests',
      tutorials: 'Guide',
      rewards: 'Rewards',
      profile: 'Profile',
    },

    // Tutorials
    tutorials: {
      title: 'Official Guide',
      subtitle: 'Learn how to complete various tasks',
      searchPlaceholder: 'Search tutorials...',
      empty: 'No tutorials yet',
      watchVideo: 'Watch Video',
      images: 'images',
      category: {
        all: 'All',
        telegram: 'Telegram',
        twitter: 'Twitter',
        wallet: 'Wallet',
        invite: 'Invite',
        other: 'Other',
      },
      type: {
        article: 'Article',
        video: 'Video',
        imageText: 'Gallery',
      },
    },

    // Home
    home: {
      appName: 'Quest Wall',
      slogan: 'Complete quests, earn rewards',
      hotQuests: 'Hot Quests',
      viewAllQuests: 'View All Quests →',
      completed: 'Completed',
      points: 'Points',
      rank: 'Rank',
    },

    // User Card
    user: {
      welcome: 'Welcome back',
      guest: 'Guest',
      authSuccess: 'Verified',
      authFailed: 'Auth Failed',
      authPending: 'Verifying...',
      devMode: 'Dev Mode',
      // Level Titles
      newbie: 'Newbie',
      advanced: 'Advanced',
      elite: 'Elite',
      master: 'Master',
      legendary: 'Legendary',
    },

    // Check-in
    checkIn: {
      title: 'Daily Check-in',
      todayReward: "Today's Reward",
      streak: 'Streak',
      day: 'day',
      days: 'days',
      checkInBtn: 'Check In',
      checkedIn: 'Checked In',
      makeup: 'Make Up',
      makeupCost: 'Cost {cost} Points',
      makeupSuccess: 'Make up success! Cost {cost} Points, got {reward} Points',
      checkInSuccess: 'Check-in success! {streak} days streak, +{reward} Points',
      selectDate: 'Select date to make up',
      today: 'Today',
      missed: 'Miss',
      missedHint: 'You missed {count} days, tap to make up',
      weekDays: {
        0: 'Sun',
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat',
      },
    },

    // Invite
    invite: {
      title: 'Invite Friends',
      subtitle: 'Earn {amount} USDT per invite 💵',
      inviteCount: 'Invited',
      totalBonus: 'Total Bonus',
      inviteBonus: 'Invite Bonus',
      commissionBonus: 'Commission',
      people: '',
      copyLink: 'Copy Link',
      shareToTg: 'Share to Telegram',
      linkCopied: 'Link copied!',
      shareText: 'Join Quest Wall to complete tasks and earn rewards! Use my invite link to register, we both get {amount} USDT!',
    },

    // Wallet
    wallet: {
      title: 'My Wallet',
      connect: 'Connect Wallet',
      disconnect: 'Disconnect',
      connected: 'Wallet connected!',
      disconnected: 'Wallet disconnected',
      balance: 'Balance',
      withdraw: 'Withdraw',
      withdrawNote: 'Withdraw requests will be processed within 1-3 business days',
    },

    // Withdraw
    withdraw: {
      title: 'Withdraw',
      usdtTitle: 'USDT Withdraw',
      amount: 'Amount',
      address: 'Withdraw Address',
      recipientAddress: 'Recipient Address',
      addressPlaceholder: 'Enter wallet address',
      addressPlaceholderFull: 'Enter TRC20 or ERC20 wallet address',
      addressHint: 'Supports TRC20 (starts with T) and ERC20 (starts with 0x) addresses',
      available: 'Available',
      withdrawableBalance: 'Withdrawable Balance',
      minAmount: 'Minimum',
      fee: 'Fee',
      feeAmount: 'Free',
      estimatedArrival: 'Est. Arrival',
      min: 'Min',
      max: 'MAX',
      submit: 'Confirm Withdraw',
      submitWithdraw: 'Submit Withdraw',
      submitting: 'Submitting...',
      errorAmount: 'Please enter a valid amount',
      errorMinAmount: 'Minimum withdraw is {min} {asset}',
      errorBalance: 'Insufficient balance',
      errorAddress: 'Please enter recipient address',
      errorAddressFormat: 'Please enter a valid TRC20 or ERC20 address',
      errorFailed: 'Withdraw request failed',
      errorNetwork: 'Network error, please try again',
      starsNote: 'Stars will be sent to your Telegram account',
      note: 'Withdraw request will be processed within 24 hours',
      noteFull: 'After submission, our team will review and process the transfer within 1-3 business days',
      // Success page
      successTitle: 'Withdraw Submitted',
      successMessage: 'Your withdraw request has been submitted. After approval, we will process the transfer within 1-3 business days.',
      requestedAmount: 'Requested',
      viewHistory: 'View History',
      close: 'Close',
      // History
      history: 'History',
      historyTitle: 'Withdraw History',
      submitSuccess: 'Submitted',
      noHistory: 'No withdraw history',
      loading: 'Loading...',
      backToWithdraw: 'Back to Withdraw',
      toAddress: 'To Address',
      applyTime: 'Applied',
      processTime: 'Processed',
      // Tab
      tabWithdraw: 'Withdraw',
      tabHistory: 'History',
    },

    // Reward
    reward: {
      points: 'Points',
      usdt: 'USDT',
    },

    // Quest
    quest: {
      title: 'Quest Center',
      subtitle: 'Complete quests, earn rewards',
      available: 'Available',
      completed: 'Completed',
      reward: 'Reward',
      start: 'Start',
      complete: 'Complete',
      verify: 'Verify',
      alreadyCompleted: 'You have already completed this quest!',
      completedSuccess: 'Quest completed! +{amount} USDT +{points} Points',
      participants: '{count} participants',
      // Quest Types
      types: {
        join_channel: 'Join Channel',
        join_group: 'Join Group',
        deep_link: 'Visit Link',
        follow_twitter: 'Follow Twitter',
        retweet_twitter: 'Retweet',
        like_twitter: 'Like Tweet',
        comment_twitter: 'Comment Tweet',
        like_post: 'Like Post',
        onchain_transfer: 'On-chain Transfer',
        mint_nft: 'Mint NFT',
        wallet_bind: 'Bind Wallet',
        form: 'Fill Form',
        custom: 'Custom Quest',
        default: 'Quest',
      },
      // Quest Actions
      actions: {
        goFollow: 'Go Follow',
        goJoin: 'Go Join',
        goVisit: 'Go Visit',
        verifyFollow: 'Verify Follow',
        verifyJoin: 'Verify Join',
        confirmComplete: 'Confirm',
      },
      // Verify Status
      verify: {
        verifying: 'Verifying...',
        pleaseWait: 'Please wait',
        success: 'Verified!',
        completing: 'Quest completing',
        failed: 'Verification failed',
        followFirst: 'Please follow the channel first',
        joinFirst: 'Please join the group first',
        retryLater: 'Verification failed, please try again',
      },
      // Steps
      steps: {
        follow: 'Follow',
        join: 'Join',
        verify: 'Verify',
        done: 'Done',
      },
      // Verify Hints
      verifyHint: {
        channel: 'Already followed? Click verify to complete',
        group: 'Already joined? Click verify to complete',
      },
    },

    // Filter
    filter: {
      all: 'All',
      telegram: 'TG Quests',
      twitter: 'Twitter Quests',
      searchPlaceholder: 'Search quests...',
    },

    // Twitter Binding
    twitter: {
      title: 'Twitter Binding',
      bindTitle: 'Bind Twitter Account',
      bindDesc: 'Bind to verify your Twitter quest completion and ensure reward distribution',
      placeholder: 'Enter your Twitter username',
      enterUsername: 'Please enter Twitter username',
      next: 'Next',
      verifyTitle: 'Verify Account Ownership',
      step1: 'Copy the verification code below',
      step2: 'Quote tweet the official post with code',
      step3: 'Click verify after posting',
      postTweet: 'Quote Tweet',
      codeExpiry: 'Code valid for 10 minutes, tweet can be deleted after verification',
      verifyAndBind: 'Verify & Bind',
      gettingCode: 'Getting verification code...',
      getCodeFailed: 'Failed to get verification code',
      verifying: 'Verifying tweet...',
      success: 'Binding Successful',
      bindSuccess: 'Successfully bound Twitter account',
      bindFailed: 'Binding failed',
      bound: 'Twitter Bound',
      boundDesc: 'You can participate in Twitter quests with verified completion',
      verified: 'Verified',
      unbind: 'Unbind',
      unbinding: 'Unbinding...',
      unbindFailed: 'Unbind failed',
      alreadyOwned: 'This Twitter account has been bound by another user and cannot be linked to your account',
    },

    // Rewards Page
    rewards: {
      title: 'My Rewards',
      subtitle: 'View and manage your rewards',
      totalValue: 'Total Value',
      convert: 'Convert',
      convertTitle: 'Convert Stars',
      convertHint: 'Select target',
      convertTo: 'Convert to {target}',
      rate: 'Rate',
      insufficientBalance: 'Insufficient Stars balance',
      convertSuccess: 'Conversion successful!',
      history: 'Reward History',
    },

    // Leaderboard
    leaderboard: {
      title: 'Leaderboard',
      rank: 'Rank',
      points: 'Points',
      you: 'You',
      questsCompleted: '{count} quests completed',
      myRank: 'My Rank',
      tasksTab: 'Tasks',
      invitesTab: 'Invites',
      invites: 'Invites',
      inviteCount: '{count} invited',
    },

    // Transaction History
    history: {
      title: 'Transaction History',
      noRecords: 'No transaction records',
      income: 'Income',
      expense: 'Expense',
    },

    // Profile
    profile: {
      title: 'Profile',
      subtitle: 'Manage your account settings',
      stats: 'Statistics',
      completedQuests: 'Completed',
      checkInDays: 'Check-in Days',
      invitedFriends: 'Invited',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
    },

    // Notification Settings
    notifications: {
      title: 'Notification Settings',
      questComplete: 'Quest Complete',
      reward: 'Reward Received',
      newQuest: 'New Quest',
      checkIn: 'Check-in Reminder',
      invite: 'Invite Success',
      testNotification: 'Send Test',
      testSent: 'Test notification sent!',
    },

    // Theme
    theme: {
      title: 'Theme Settings',
      dark: 'Dark Mode',
      light: 'Light Mode',
      system: 'System',
    },

    // Language
    language: {
      title: 'Language Settings',
      zh: '简体中文',
      en: 'English',
    },

    // Empty States
    empty: {
      noQuests: 'No available quests',
      noQuestsDesc: 'Take a break, come back later',
      noRewards: 'No reward records',
      noRewardsDesc: 'Complete quests to earn rewards',
      noHistory: 'No transaction records',
      noHistoryDesc: 'Your transactions will appear here',
      noResults: 'No quests found',
      noResultsDesc: 'Try different keywords or filters',
      noInvites: 'No invite data yet',
    },

    // Error States
    error: {
      network: 'Network Error',
      networkDesc: 'Please check your connection',
      server: 'Server Error',
      serverDesc: 'Engineers are working on it',
      timeout: 'Request Timeout',
      timeoutDesc: 'Server response too slow, please retry',
      unknown: 'Something went wrong',
      unknownDesc: 'Unknown error, please retry',
    },

    // Offline
    offline: {
      message: 'Network disconnected',
    },
  },
};

export default locales;
