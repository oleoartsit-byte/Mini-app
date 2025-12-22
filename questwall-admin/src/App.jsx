import { useState, useEffect } from 'react';
import { ConfigProvider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Users from './pages/Users';
import Rewards from './pages/Rewards';
import Payouts from './pages/Payouts';
import Settings from './pages/Settings';
import AdminLayout from './components/Layout';
import { authApi } from './services/api';

// 页面组件映射
const pages = {
  dashboard: Dashboard,
  quests: Quests,
  users: Users,
  rewards: Rewards,
  payouts: Payouts,
  settings: Settings,
};

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  // 登录成功
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // 退出登录
  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    message.success('已退出登录');
  };

  // 切换页面
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        加载中...
      </div>
    );
  }

  // 未登录显示登录页
  if (!user) {
    return (
      <ConfigProvider locale={zhCN}>
        <Login onLogin={handleLogin} />
      </ConfigProvider>
    );
  }

  // 渲染当前页面
  const PageComponent = pages[currentPage] || Dashboard;

  return (
    <ConfigProvider locale={zhCN}>
      <AdminLayout
        currentPage={currentPage}
        onPageChange={handlePageChange}
        user={user}
        onLogout={handleLogout}
      >
        <PageComponent />
      </AdminLayout>
    </ConfigProvider>
  );
}

export default App;
