import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
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
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: 'quests', icon: <FileTextOutlined />, label: '任务管理' },
  { key: 'tutorials', icon: <ReadOutlined />, label: '教程管理' },
  { key: 'users', icon: <UserOutlined />, label: '用户管理' },
  { key: 'rewards', icon: <GiftOutlined />, label: '奖励记录' },
  { key: 'payouts', icon: <DollarOutlined />, label: '提现审核' },
  { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
];

export default function AdminLayout({ children, currentPage, onPageChange, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

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
          {collapsed ? 'QW' : 'Quest Wall'}
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
