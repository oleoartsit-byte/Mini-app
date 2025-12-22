// API 服务 - 连接后端
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api/v1'
  : 'https://chemistry-jason-undergraduate-herbs.trycloudflare.com/api/v1';

export function createApiService(token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  return {
    // Telegram 认证登录
    auth: async (initData) => {
      try {
        const response = await fetch(`${API_BASE}/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        });
        return await response.json();
      } catch (error) {
        console.error('认证失败:', error);
        return { success: false, message: '认证失败' };
      }
    },

    // 开发模式登录
    devLogin: async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/dev-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
      } catch (error) {
        console.error('开发登录失败:', error);
        return { success: false, message: '开发登录失败' };
      }
    },

    // 获取任务列表（支持多语言）
    getQuests: async (lang = 'zh') => {
      try {
        const response = await fetch(`${API_BASE}/quests?lang=${lang}`, { headers });
        const data = await response.json();
        return {
          items: data.items.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            type: q.type.toLowerCase(),
            reward: {
              type: q.reward.type.toLowerCase(),
              amount: q.reward.amount,
              assetAddr: q.reward.assetAddr || ''
            },
            // 任务验证相关字段
            channelId: q.channelId || null,
            targetUrl: q.targetUrl || null,
          })),
          total: data.total
        };
      } catch (error) {
        console.error('API 请求失败:', error);
        return { items: [], total: 0 };
      }
    },

    // 领取任务
    claimQuest: async (questId) => {
      try {
        const response = await fetch(`${API_BASE}/quests/${questId}/claim`, {
          method: 'POST',
          headers
        });
        return await response.json();
      } catch (error) {
        console.error('领取任务失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 提交任务证明
    submitQuest: async (questId, proof) => {
      try {
        const response = await fetch(`${API_BASE}/quests/${questId}/submit`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ proof })
        });
        return await response.json();
      } catch (error) {
        console.error('提交任务失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 验证用户是否加入频道/群组
    verifyMember: async (chatId) => {
      try {
        const response = await fetch(`${API_BASE}/notifications/verify-member`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ chatId })
        });
        return await response.json();
      } catch (error) {
        console.error('验证成员失败:', error);
        return { success: false, isMember: false, message: '网络错误' };
      }
    },

    // 获取频道/群组信息
    getChatInfo: async (chatId) => {
      try {
        const response = await fetch(`${API_BASE}/notifications/chat-info/${encodeURIComponent(chatId)}`, {
          headers
        });
        return await response.json();
      } catch (error) {
        console.error('获取频道信息失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // ==================== 签到相关 API ====================

    // 获取用户时区偏移（分钟）
    _getTimezoneOffset: () => {
      return new Date().getTimezoneOffset();
    },

    // 获取签到状态
    getCheckInStatus: async () => {
      try {
        const tz = new Date().getTimezoneOffset();
        const response = await fetch(`${API_BASE}/checkin/status?tz=${tz}`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取签到状态失败:', error);
        return null;
      }
    },

    // 每日签到
    checkIn: async () => {
      try {
        const timezoneOffset = new Date().getTimezoneOffset();
        const response = await fetch(`${API_BASE}/checkin`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ timezoneOffset })
        });
        return await response.json();
      } catch (error) {
        console.error('签到失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 补签
    makeupCheckIn: async (date) => {
      try {
        const timezoneOffset = new Date().getTimezoneOffset();
        const response = await fetch(`${API_BASE}/checkin/makeup`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ date, timezoneOffset })
        });
        return await response.json();
      } catch (error) {
        console.error('补签失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 获取签到配置
    getCheckInConfig: async () => {
      try {
        const response = await fetch(`${API_BASE}/checkin/config`);
        return await response.json();
      } catch (error) {
        console.error('获取签到配置失败:', error);
        return null;
      }
    },

    // 获取签到排行榜
    getCheckInLeaderboard: async (limit = 10) => {
      try {
        const response = await fetch(`${API_BASE}/checkin/leaderboard?limit=${limit}`);
        return await response.json();
      } catch (error) {
        console.error('获取签到排行榜失败:', error);
        return [];
      }
    },

    // ==================== 邀请相关 API ====================

    // 获取邀请状态
    getInviteStatus: async () => {
      try {
        const response = await fetch(`${API_BASE}/invite/status`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取邀请状态失败:', error);
        return null;
      }
    },

    // 处理邀请（被邀请人调用）
    processInvite: async (inviteCode) => {
      try {
        const response = await fetch(`${API_BASE}/invite/process`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ inviteCode })
        });
        return await response.json();
      } catch (error) {
        console.error('处理邀请失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 验证邀请码
    validateInviteCode: async (code) => {
      try {
        const response = await fetch(`${API_BASE}/invite/validate/${code}`);
        return await response.json();
      } catch (error) {
        console.error('验证邀请码失败:', error);
        return { valid: false, message: '网络错误' };
      }
    },

    // 获取邀请配置
    getInviteConfig: async () => {
      try {
        const response = await fetch(`${API_BASE}/invite/config`);
        return await response.json();
      } catch (error) {
        console.error('获取邀请配置失败:', error);
        return null;
      }
    },

    // 获取邀请排行榜
    getInviteLeaderboard: async (limit = 10) => {
      try {
        const response = await fetch(`${API_BASE}/invite/leaderboard?limit=${limit}`);
        return await response.json();
      } catch (error) {
        console.error('获取邀请排行榜失败:', error);
        return [];
      }
    },

    // ==================== 钱包/提现相关 API ====================

    // 获取用户余额
    getBalance: async () => {
      try {
        const response = await fetch(`${API_BASE}/payout/balance`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取余额失败:', error);
        return null;
      }
    },

    // 申请提现
    requestWithdraw: async (asset, amount, toAddress) => {
      try {
        const response = await fetch(`${API_BASE}/payout/withdraw`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ asset, amount, toAddress })
        });
        return await response.json();
      } catch (error) {
        console.error('申请提现失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 获取提现历史
    getPayoutHistory: async (page = 1, pageSize = 10) => {
      try {
        const response = await fetch(`${API_BASE}/payout/history?page=${page}&pageSize=${pageSize}`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取提现历史失败:', error);
        return { items: [], total: 0 };
      }
    },

    // 取消提现
    cancelWithdraw: async (payoutId) => {
      try {
        const response = await fetch(`${API_BASE}/payout/${payoutId}`, {
          method: 'DELETE',
          headers
        });
        return await response.json();
      } catch (error) {
        console.error('取消提现失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 获取交易历史
    getTransactionHistory: async (page = 1, pageSize = 20) => {
      try {
        const response = await fetch(`${API_BASE}/payout/transactions/all?page=${page}&pageSize=${pageSize}`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取交易历史失败:', error);
        return { items: [], total: 0 };
      }
    },

    // ==================== Twitter 绑定相关 API ====================

    // 获取 Twitter 绑定状态
    getTwitterStatus: async () => {
      try {
        const response = await fetch(`${API_BASE}/twitter/status`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取 Twitter 状态失败:', error);
        return { bound: false };
      }
    },

    // 获取 Twitter 验证码
    getTwitterVerificationCode: async () => {
      try {
        const response = await fetch(`${API_BASE}/twitter/verification-code`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取验证码失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 验证简介并绑定 Twitter
    verifyAndBindTwitter: async (username) => {
      try {
        const response = await fetch(`${API_BASE}/twitter/verify-and-bind`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ username })
        });
        return await response.json();
      } catch (error) {
        console.error('验证绑定失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 绑定 Twitter 账号（旧接口，保留兼容）
    bindTwitter: async (username) => {
      try {
        const response = await fetch(`${API_BASE}/twitter/bind`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ username })
        });
        return await response.json();
      } catch (error) {
        console.error('绑定 Twitter 失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 解绑 Twitter 账号
    unbindTwitter: async () => {
      try {
        const response = await fetch(`${API_BASE}/twitter/unbind`, {
          method: 'DELETE',
          headers
        });
        return await response.json();
      } catch (error) {
        console.error('解绑 Twitter 失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // 搜索 Twitter 用户
    searchTwitterUser: async (username) => {
      try {
        const response = await fetch(`${API_BASE}/twitter/search?username=${encodeURIComponent(username)}`, { headers });
        return await response.json();
      } catch (error) {
        console.error('搜索 Twitter 用户失败:', error);
        return { success: false, message: '网络错误' };
      }
    },

    // ==================== 排行榜和奖励相关 API ====================

    // 获取排行榜
    getLeaderboard: async (limit = 10) => {
      try {
        const response = await fetch(`${API_BASE}/rewards/leaderboard?limit=${limit}`);
        return await response.json();
      } catch (error) {
        console.error('获取排行榜失败:', error);
        return [];
      }
    },

    // 获取当前用户排名
    getMyRank: async () => {
      try {
        const response = await fetch(`${API_BASE}/rewards/my-rank`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取用户排名失败:', error);
        return { rank: 0, points: 0, quests: 0 };
      }
    },

    // 获取奖励历史
    getRewardHistory: async () => {
      try {
        const response = await fetch(`${API_BASE}/rewards`, { headers });
        return await response.json();
      } catch (error) {
        console.error('获取奖励历史失败:', error);
        return { items: [], total: 0 };
      }
    }
  };
}
