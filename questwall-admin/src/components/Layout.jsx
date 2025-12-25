import { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  GiftOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { reviewApi, payoutApi } from '../services/api';

const { Header, Sider, Content } = Layout;

// 轮询间隔（毫秒）
const POLL_INTERVAL = 30000; // 30秒

export default function AdminLayout({ children, currentPage, onPageChange, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [siteName, setSiteName] = useState('Quest Wall');
  const [pendingReviews, setPendingReviews] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);

  // 获取待审核数量
  const fetchPendingCounts = useCallback(async () => {
    try {
      const [reviewStats, payoutStats] = await Promise.all([
        reviewApi.getStats(),
        payoutApi.getStats(),
      ]);
      setPendingReviews(reviewStats.pending || 0);
      setPendingPayouts(payoutStats.pending?.count || 0);
    } catch (error) {
      // 静默失败，不影响用户体验
      console.error('获取待审核数量失败:', error);
    }
  }, []);

  // 轮询待审核数量
  useEffect(() => {
    // 初始加载
    fetchPendingCounts();

    // 设置轮询
    const interval = setInterval(fetchPendingCounts, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchPendingCounts]);

  // 动态生成菜单项（带 Badge）
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: 'quests', icon: <FileTextOutlined />, label: '任务管理' },
    {
      key: 'reviews',
      icon: <AuditOutlined />,
      label: (
        <span>
          截图审核
          {pendingReviews > 0 && (
            <Badge
              count={pendingReviews}
              size="small"
              style={{ marginLeft: 8 }}
            />
          )}
        </span>
      ),
    },
    { key: 'tutorials', icon: <ReadOutlined />, label: '教程管理' },
    { key: 'users', icon: <UserOutlined />, label: '用户管理' },
    { key: 'rewards', icon: <GiftOutlined />, label: '奖励记录' },
    {
      key: 'payouts',
      icon: <DollarOutlined />,
      label: (
        <span>
          提现审核
          {pendingPayouts > 0 && (
            <Badge
              count={pendingPayouts}
              size="small"
              style={{ marginLeft: 8 }}
            />
          )}
        </span>
      ),
    },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
  ];

  // 读取站点名称配置
  useEffect(() => {
    const loadSiteName = () => {
      const systemConfig = JSON.parse(localStorage.getItem('admin_system_config') || '{}');
      if (systemConfig.siteName) {
        setSiteName(systemConfig.siteName);
        document.title = `${systemConfig.siteName} - 管理后台`;
      }
    };

    // 初始加载
    loadSiteName();

    // 监听配置更新事件
    const handleConfigUpdate = (event) => {
      if (event.detail?.siteName) {
        setSiteName(event.detail.siteName);
      }
    };

    window.addEventListener('adminConfigUpdated', handleConfigUpdate);

    return () => {
      window.removeEventListener('adminConfigUpdated', handleConfigUpdate);
    };
  }, []);

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={styles.logo}>
          {collapsed ? siteName.substring(0, 2).toUpperCase() : siteName}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => onPageChange(key)}
        />
      </Sider>
      <Layout>
        <Header style={styles.header}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <div style={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={styles.userInfo}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>{user?.username || 'Admin'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

const styles = {
  logo: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    background: 'rgba(255,255,255,0.1)',
  },
  header: {
    background: '#fff',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0 12px',
  },
  content: {
    margin: 24,
    padding: 24,
    background: '#f0f2f5',
    minHeight: 280,
  },
};
