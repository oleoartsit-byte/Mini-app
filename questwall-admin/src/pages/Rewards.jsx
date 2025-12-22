import { useState, useEffect } from 'react';
import { Table, Card, Tag, Input, DatePicker, Space, Select, Statistic, Row, Col } from 'antd';
import { GiftOutlined, DollarOutlined } from '@ant-design/icons';
import { rewardApi } from '../services/api';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 奖励类型颜色
const REWARD_TYPE_COLORS = {
  STARS: { color: '#667eea', text: 'Stars' },
  POINTS: { color: '#ff9500', text: '积分' },
  TON: { color: '#0088cc', text: 'TON' },
  USDT: { color: '#26a17b', text: 'USDT' },
  JETTON: { color: '#9b59b6', text: 'Jetton' },
  NFT: { color: '#e74c3c', text: 'NFT' },
};

// 状态颜色
const STATUS_COLORS = {
  PENDING: { color: 'orange', text: '待发放' },
  PROCESSING: { color: 'blue', text: '处理中' },
  COMPLETED: { color: 'green', text: '已完成' },
  FAILED: { color: 'red', text: '失败' },
};

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, totalAmount: 0 });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const loadRewards = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await rewardApi.getList({ page, pageSize });
      setRewards(res.items || []);
      setPagination({
        current: res.page,
        pageSize: res.pageSize,
        total: res.total,
      });
      // 计算统计
      setStats({
        total: res.total,
        totalAmount: res.items?.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0,
      });
    } catch (error) {
      console.error('加载奖励记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.username || '-'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>ID: {record.tgId}</div>
        </div>
      ),
    },
    {
      title: '任务',
      dataIndex: 'questTitle',
      width: 200,
      ellipsis: true,
    },
    {
      title: '奖励类型',
      dataIndex: 'type',
      width: 100,
      render: (type) => (
        <Tag color={REWARD_TYPE_COLORS[type]?.color || 'default'}>
          {REWARD_TYPE_COLORS[type]?.text || type}
        </Tag>
      ),
    },
    {
      title: '数量',
      dataIndex: 'amount',
      width: 100,
      render: (amount) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          +{parseFloat(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={STATUS_COLORS[status]?.color || 'default'}>
          {STATUS_COLORS[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '发放时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="奖励记录总数"
              value={stats.total}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本页奖励总额"
              value={stats.totalAmount.toFixed(2)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="今日发放"
              value={rewards.filter(r => {
                const today = new Date().toDateString();
                return new Date(r.createdAt).toDateString() === today;
              }).length}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 奖励列表 */}
      <Card
        title="奖励记录"
        extra={
          <Space>
            <Select defaultValue="" style={{ width: 120 }} placeholder="奖励类型">
              <Option value="">全部类型</Option>
              <Option value="STARS">Stars</Option>
              <Option value="POINTS">积分</Option>
              <Option value="TON">TON</Option>
              <Option value="USDT">USDT</Option>
            </Select>
            <Select defaultValue="" style={{ width: 120 }} placeholder="状态">
              <Option value="">全部状态</Option>
              <Option value="PENDING">待发放</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="FAILED">失败</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={rewards}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => loadRewards(page, pageSize),
          }}
        />
      </Card>
    </div>
  );
}
