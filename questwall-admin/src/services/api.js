// 管理后台 API 服务
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// 获取存储的 token
const getToken = () => localStorage.getItem('admin_token');

// 通用请求方法
async function request(url, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// 管理员认证
export const authApi = {
  login: (username, password) =>
    request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: () => request('/admin/auth/me'),
};

// 任务管理
export const questApi = {
  // 获取任务列表（包含所有状态）
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/quests?${query}`);
  },

  // 获取任务详情
  getDetail: (id) => request(`/admin/quests/${id}`),

  // 创建任务
  create: (data) =>
    request('/admin/quests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新任务
  update: (id, data) =>
    request(`/admin/quests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除任务
  delete: (id) =>
    request(`/admin/quests/${id}`, {
      method: 'DELETE',
    }),

  // 更新任务状态
  updateStatus: (id, status) =>
    request(`/admin/quests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// 用户管理
export const userApi = {
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users?${query}`);
  },

  getDetail: (id) => request(`/admin/users/${id}`),

  // 获取用户已完成的任务列表
  getCompletedQuests: (id) => request(`/admin/users/${id}/completed-quests`),
};

// 黑名单管理
export const blacklistApi = {
  // 获取黑名单列表
  getList: (type) => {
    const query = type ? `?type=${type}` : '';
    return request(`/admin/blacklist${query}`);
  },

  // 添加到黑名单
  add: (data) =>
    request('/admin/blacklist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 移除黑名单
  remove: (id) =>
    request(`/admin/blacklist/${id}`, {
      method: 'DELETE',
    }),
};

// 统计数据
export const statsApi = {
  getDashboard: () => request('/admin/stats/dashboard'),
  getQuestStats: (questId) => request(`/admin/stats/quests/${questId}`),
};

// 奖励管理
export const rewardApi = {
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/rewards?${query}`);
  },
};

// 提现管理
export const payoutApi = {
  // 获取提现列表
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/payouts?${query}`);
  },

  // 获取提现统计
  getStats: () => request('/admin/payouts/stats'),

  // 获取提现详情
  getDetail: (id) => request(`/admin/payouts/${id}`),

  // 审核通过
  approve: (id, txHash) =>
    request(`/admin/payouts/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    }),

  // 拒绝提现
  reject: (id, reason) =>
    request(`/admin/payouts/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 完成提现（填写交易哈希或上传截图）
  complete: (id, txHash, proofImage) =>
    request(`/admin/payouts/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ txHash, proofImage }),
    }),
};

// 上传
export const uploadApi = {
  // 上传图片
  uploadImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || '上传失败');
    }
    return data;
  },
};

// 风控管理
export const riskApi = {
  // 获取风控事件列表
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/risk/events?${query}`);
  },

  // 获取风控统计
  getStats: () => request('/admin/risk/stats'),

  // 获取用户风控历史
  getUserHistory: (userId) => request(`/admin/risk/user/${userId}`),
};

export default {
  auth: authApi,
  quest: questApi,
  user: userApi,
  blacklist: blacklistApi,
  stats: statsApi,
  reward: rewardApi,
  payout: payoutApi,
  risk: riskApi,
  upload: uploadApi,
};
