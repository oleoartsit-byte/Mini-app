import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, message } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  GiftOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { statsApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuests: 0,
    totalRewards: 0,
    todayUsers: 0,
    recentQuests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsApi.getDashboard();
      setStats(data);
    } catch (error) {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const recentQuestColumns = [
    { title: '任务', dataIndex: 'title' },
    { title: '类型', dataIndex: 'type' },
    { title: '完成数', dataIndex: 'completedCount' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <span style={{ color: status === 'ACTIVE' ? '#52c41a' : '#999' }}>
          {status === 'ACTIVE' ? '活跃' : status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="任务总数"
              value={stats.totalQuests}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="奖励发放"
              value={stats.totalRewards}
              prefix={<GiftOutlined />}
              suffix="Stars"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="今日新增用户"
              value={stats.todayUsers}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近任务" loading={loading}>
        <Table
          columns={recentQuestColumns}
          dataSource={stats.recentQuests}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
