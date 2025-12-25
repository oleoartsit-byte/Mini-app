import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, message, Segmented } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  GiftOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { statsApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuests: 0,
    totalRewards: 0,
    todayUsers: 0,
    recentQuests: [],
  });
  const [trends, setTrends] = useState({
    users: [],
    rewards: [],
    questCompletions: [],
    payouts: [],
  });
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTrends(trendDays);
  }, [trendDays]);

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

  const loadTrends = async (days) => {
    try {
      setTrendLoading(true);
      const data = await statsApi.getTrends(days);
      setTrends(data);
    } catch (error) {
      console.error('加载趋势数据失败:', error);
    } finally {
      setTrendLoading(false);
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

  // 格式化日期显示
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 合并用户和任务完成数据用于组合图表
  const combinedData = trends.users.map((item, index) => ({
    date: formatDate(item.date),
    users: item.count,
    completions: trends.questCompletions[index]?.count || 0,
  }));

  // 奖励和提现数据
  const rewardPayoutData = trends.rewards.map((item, index) => ({
    date: formatDate(item.date),
    rewards: item.amount,
    payouts: trends.payouts[index]?.amount || 0,
  }));

  return (
    <div>
      {/* 统计卡片 */}
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

      {/* 趋势图表 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title="数据趋势"
            loading={trendLoading}
            extra={
              <Segmented
                options={[
                  { label: '7天', value: 7 },
                  { label: '14天', value: 14 },
                  { label: '30天', value: 30 },
                ]}
                value={trendDays}
                onChange={setTrendDays}
              />
            }
          >
            <Row gutter={24}>
              {/* 用户增长和任务完成趋势 */}
              <Col span={12}>
                <div style={{ marginBottom: 8, fontWeight: 500, color: '#666' }}>
                  用户增长 & 任务完成
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="新增用户"
                      stroke="#1890ff"
                      fill="#1890ff"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="completions"
                      name="任务完成"
                      stroke="#52c41a"
                      fill="#52c41a"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Col>

              {/* 奖励发放和提现趋势 */}
              <Col span={12}>
                <div style={{ marginBottom: 8, fontWeight: 500, color: '#666' }}>
                  奖励发放 & 提现金额 (USDT)
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={rewardPayoutData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rewards" name="奖励发放" fill="#faad14" />
                    <Bar dataKey="payouts" name="提现金额" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 最近任务 */}
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
