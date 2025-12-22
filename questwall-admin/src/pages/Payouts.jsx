import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Tabs,
  Badge,
  message,
  Descriptions,
  Typography,
  Collapse,
  Timeline,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { payoutApi, userApi } from '../services/api';

const { Text, Paragraph } = Typography;

// 提现状态
const STATUS_MAP = {
  PENDING: { color: 'orange', text: '待审核' },
  PROCESSING: { color: 'blue', text: '处理中' },
  COMPLETED: { color: 'success', text: '已完成' },
  FAILED: { color: 'error', text: '已拒绝' },
};

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [detailVisible, setDetailVisible] = useState(false);
  const [approveVisible, setApproveVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [currentPayout, setCurrentPayout] = useState(null);
  const [userQuestsVisible, setUserQuestsVisible] = useState(false);
  const [userQuestsData, setUserQuestsData] = useState(null);
  const [userQuestsLoading, setUserQuestsLoading] = useState(false);
  const [form] = Form.useForm();

  // 分页
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载提现列表
  const loadPayouts = async (page = 1, pageSize = 10, status = activeTab) => {
    setLoading(true);
    try {
      const params = { page, pageSize, status };
      const res = await payoutApi.getList(params);
      setPayouts(res.items || []);
      setPagination({
        current: res.page,
        pageSize: res.pageSize,
        total: res.total,
      });
    } catch (error) {
      message.error('加载提现列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const res = await payoutApi.getStats();
      setStats(res);
    } catch (error) {
      console.error('加载统计失败', error);
    }
  };

  useEffect(() => {
    loadPayouts(1, pagination.pageSize, activeTab);
    loadStats();
  }, [activeTab]);

  // 切换 Tab
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination({ ...pagination, current: 1 });
  };

  // 查看详情
  const showDetail = async (payout) => {
    try {
      const detail = await payoutApi.getDetail(payout.id);
      setCurrentPayout(detail);
      setDetailVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  // 查看用户已完成的任务
  const showUserQuests = async (userId) => {
    setUserQuestsLoading(true);
    setUserQuestsVisible(true);
    try {
      const data = await userApi.getCompletedQuests(userId);
      setUserQuestsData(data);
    } catch (error) {
      message.error('获取用户任务失败');
    } finally {
      setUserQuestsLoading(false);
    }
  };

  // 打开审核通过弹窗
  const showApprove = (payout) => {
    setCurrentPayout(payout);
    form.resetFields();
    setApproveVisible(true);
  };

  // 打开拒绝弹窗
  const showReject = (payout) => {
    setCurrentPayout(payout);
    form.resetFields();
    setRejectVisible(true);
  };

  // 审核通过
  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      await payoutApi.approve(currentPayout.id, values.txHash);
      message.success(values.txHash ? '提现已完成' : '审核通过，等待转账');
      setApproveVisible(false);
      loadPayouts(pagination.current);
      loadStats();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  // 拒绝提现
  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      await payoutApi.reject(currentPayout.id, values.reason);
      message.success('已拒绝提现');
      setRejectVisible(false);
      loadPayouts(pagination.current);
      loadStats();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  // 打开完成提现弹窗
  const showComplete = (payout) => {
    setCurrentPayout(payout);
    setProofImageUrl('');
    form.resetFields();
    setCompleteVisible(true);
  };

  // 完成提现
  const handleComplete = async () => {
    try {
      const values = await form.validateFields();
      const txHash = values.txHash?.trim() || null;

      await payoutApi.complete(currentPayout.id, txHash, null);
      message.success('提现已完成');
      setCompleteVisible(false);
      loadPayouts(pagination.current);
      loadStats();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: 'username',
      width: 120,
      render: (text, record) => (
        <div>
          <div
            style={{ color: '#1890ff', cursor: 'pointer' }}
            onClick={() => showUserQuests(record.beneficiaryId)}
          >
            {text || '-'}
          </div>
          <div style={{ color: '#999', fontSize: 12 }}>TG: {record.tgId}</div>
        </div>
      ),
    },
    {
      title: '风险分',
      dataIndex: 'riskScore',
      width: 80,
      render: (score) => (
        <Tag color={score > 50 ? 'red' : score > 20 ? 'orange' : 'green'}>
          {score}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {amount} USDT
        </span>
      ),
    },
    {
      title: '提现地址',
      dataIndex: 'toAddress',
      width: 200,
      render: (addr) => (
        <Paragraph
          copyable={{ text: addr }}
          style={{ margin: 0, maxWidth: 180 }}
          ellipsis={{ rows: 1 }}
        >
          {addr}
        </Paragraph>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={STATUS_MAP[status]?.color}>{STATUS_MAP[status]?.text}</Tag>
      ),
    },
    {
      title: '转账凭证',
      dataIndex: 'txHash',
      width: 150,
      render: (hash, record) => {
        if (record.proofImage) {
          return (
            <Image
              src={record.proofImage}
              width={60}
              style={{ borderRadius: 4, cursor: 'pointer' }}
              preview={{ mask: '查看' }}
            />
          );
        }
        if (hash) {
          return (
            <Paragraph
              copyable={{ text: hash }}
              style={{ margin: 0, maxWidth: 130 }}
              ellipsis={{ rows: 1 }}
            >
              {hash}
            </Paragraph>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => showApprove(record)}
              >
                通过
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                style={{ color: '#ff4d4f' }}
                onClick={() => showReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'PROCESSING' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => showComplete(record)}
            >
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Tab 配置
  const tabItems = [
    {
      key: 'PENDING',
      label: (
        <span>
          <ClockCircleOutlined style={{ color: '#faad14' }} />
          <span style={{ marginLeft: 8 }}>待审核</span>
          {stats?.pending?.count > 0 && (
            <Badge
              count={stats.pending.count}
              style={{ marginLeft: 8, backgroundColor: '#faad14' }}
            />
          )}
        </span>
      ),
    },
    {
      key: 'PROCESSING',
      label: (
        <span>
          <SyncOutlined spin={activeTab === 'PROCESSING'} style={{ color: '#1890ff' }} />
          <span style={{ marginLeft: 8 }}>处理中</span>
          {stats?.processing?.count > 0 && (
            <Badge
              count={stats.processing.count}
              style={{ marginLeft: 8, backgroundColor: '#1890ff' }}
            />
          )}
        </span>
      ),
    },
    {
      key: 'COMPLETED',
      label: (
        <span>
          <CheckOutlined style={{ color: '#52c41a' }} />
          <span style={{ marginLeft: 8 }}>已完成</span>
        </span>
      ),
    },
    {
      key: 'FAILED',
      label: (
        <span>
          <CloseOutlined style={{ color: '#ff4d4f' }} />
          <span style={{ marginLeft: 8 }}>已拒绝</span>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card title="提现管理">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        {/* 当前分类统计 */}
        {stats && activeTab === 'PENDING' && stats.pending?.amount > 0 && (
          <Alert
            type="warning"
            showIcon
            message={`待审核金额: ${stats.pending.amount} USDT`}
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={payouts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => loadPayouts(page, pageSize, activeTab),
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="提现详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentPayout && (
          <>
            {/* 风险警告 */}
            {currentPayout.riskScore > 50 && (
              <Alert
                type="error"
                icon={<WarningOutlined />}
                message="高风险用户"
                description={`该用户风险分为 ${currentPayout.riskScore}，建议谨慎审核！`}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            {currentPayout.riskScore > 20 && currentPayout.riskScore <= 50 && (
              <Alert
                type="warning"
                icon={<ExclamationCircleOutlined />}
                message="中风险用户"
                description={`该用户风险分为 ${currentPayout.riskScore}，请注意审核。`}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="提现ID">{currentPayout.id}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={STATUS_MAP[currentPayout.status]?.color}>
                  {STATUS_MAP[currentPayout.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用户名">{currentPayout.user?.username || '-'}</Descriptions.Item>
              <Descriptions.Item label="Telegram ID">{currentPayout.user?.tgId}</Descriptions.Item>
              <Descriptions.Item label="风险评估" span={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag
                    color={
                      currentPayout.riskScore > 50
                        ? 'red'
                        : currentPayout.riskScore > 20
                        ? 'orange'
                        : 'green'
                    }
                  >
                    {currentPayout.riskScore} 分
                  </Tag>
                  <Tag
                    color={
                      currentPayout.riskLevel === 'high'
                        ? 'red'
                        : currentPayout.riskLevel === 'medium'
                        ? 'orange'
                        : 'green'
                    }
                  >
                    {currentPayout.riskLevel === 'high'
                      ? '高风险'
                      : currentPayout.riskLevel === 'medium'
                      ? '中风险'
                      : '低风险'}
                  </Tag>
                </div>
              </Descriptions.Item>
              {currentPayout.riskFactors && currentPayout.riskFactors.length > 0 && (
                <Descriptions.Item label="风险因素" span={2}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {currentPayout.riskFactors.map((factor, idx) => (
                      <Tag key={idx} color="warning" icon={<WarningOutlined />}>
                        {factor}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="提现金额" span={2}>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                  {currentPayout.amount} {currentPayout.asset}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="提现地址" span={2}>
                <Paragraph copyable style={{ margin: 0 }}>
                  {currentPayout.toAddress}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="用户总收益">{currentPayout.totalEarned} USDT</Descriptions.Item>
              <Descriptions.Item label="已提现金额">{currentPayout.totalWithdrawn} USDT</Descriptions.Item>
              {currentPayout.txHash && (
                <Descriptions.Item label="交易哈希" span={2}>
                  <Paragraph copyable style={{ margin: 0 }}>
                    {currentPayout.txHash}
                  </Paragraph>
                </Descriptions.Item>
              )}
              {currentPayout.proofImage && (
                <Descriptions.Item label="转账截图" span={2}>
                  <Image
                    src={currentPayout.proofImage}
                    width={200}
                    style={{ borderRadius: 4 }}
                  />
                </Descriptions.Item>
              )}
              <Descriptions.Item label="申请时间">
                {new Date(currentPayout.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              {currentPayout.processedAt && (
                <Descriptions.Item label="处理时间">
                  {new Date(currentPayout.processedAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 风控事件历史 */}
            {currentPayout.riskEvents && currentPayout.riskEvents.length > 0 && (
              <Collapse
                style={{ marginTop: 16 }}
                items={[
                  {
                    key: 'risk-events',
                    label: (
                      <span>
                        <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                        风控事件历史 ({currentPayout.riskEvents.length})
                      </span>
                    ),
                    children: (
                      <Timeline
                        items={currentPayout.riskEvents.map((event) => ({
                          color:
                            event.severity === 'high' || event.severity === 'critical'
                              ? 'red'
                              : event.severity === 'medium'
                              ? 'orange'
                              : 'blue',
                          children: (
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                <Tag
                                  color={
                                    event.severity === 'high' || event.severity === 'critical'
                                      ? 'red'
                                      : event.severity === 'medium'
                                      ? 'orange'
                                      : 'blue'
                                  }
                                  size="small"
                                >
                                  {event.severity}
                                </Tag>
                                {event.eventType}
                              </div>
                              <div style={{ fontSize: 12, color: '#888' }}>
                                {new Date(event.createdAt).toLocaleString('zh-CN')}
                              </div>
                              {event.details && (
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                  {typeof event.details === 'object'
                                    ? JSON.stringify(event.details)
                                    : event.details}
                                </div>
                              )}
                            </div>
                          ),
                        }))}
                      />
                    ),
                  },
                ]}
              />
            )}
          </>
        )}
      </Modal>

      {/* 审核通过弹窗 */}
      <Modal
        title="审核通过"
        open={approveVisible}
        onOk={handleApprove}
        onCancel={() => setApproveVisible(false)}
      >
        <p>
          确认通过用户 <strong>{currentPayout?.username}</strong> 的提现申请？
        </p>
        <p>
          金额: <strong>{currentPayout?.amount} {currentPayout?.asset}</strong>
        </p>
        <Form form={form} layout="vertical">
          <Form.Item
            name="txHash"
            label="转账凭证（可选）"
            extra="如果已完成转账，请填写交易ID；否则留空，稍后填写"
          >
            <Input placeholder="输入转账成功后的交易ID" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 拒绝弹窗 */}
      <Modal
        title="拒绝提现"
        open={rejectVisible}
        onOk={handleReject}
        onCancel={() => setRejectVisible(false)}
        okButtonProps={{ danger: true }}
        okText="确认拒绝"
      >
        <p>
          确认拒绝用户 <strong>{currentPayout?.username}</strong> 的提现申请？
        </p>
        <p>
          金额: <strong>{currentPayout?.amount} {currentPayout?.asset}</strong>
        </p>
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="拒绝原因">
            <Input.TextArea rows={3} placeholder="请输入拒绝原因（可选）" />
          </Form.Item>
        </Form>
        <p style={{ color: '#999' }}>拒绝后，金额将返还用户余额</p>
      </Modal>

      {/* 完成提现弹窗 */}
      <Modal
        title="完成提现"
        open={completeVisible}
        onOk={handleComplete}
        onCancel={() => setCompleteVisible(false)}
        okText="确认完成"
      >
        <p>
          完成用户 <strong>{currentPayout?.username}</strong> 的提现
        </p>
        <p>
          金额: <strong>{currentPayout?.amount} USDT</strong>
        </p>
        <p>
          提现地址: <Text copyable>{currentPayout?.toAddress}</Text>
        </p>

        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="txHash"
            label="交易哈希（可选）"
          >
            <Input placeholder="输入转账成功后的交易哈希" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户已完成任务弹窗 */}
      <Modal
        title={
          userQuestsData ? (
            <span>
              用户任务记录 - {userQuestsData.user?.username || '-'}
              {userQuestsData.user?.twitterUsername && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  @{userQuestsData.user.twitterUsername}
                </Tag>
              )}
            </span>
          ) : '用户任务记录'
        }
        open={userQuestsVisible}
        onCancel={() => {
          setUserQuestsVisible(false);
          setUserQuestsData(null);
        }}
        footer={null}
        width={800}
      >
        {userQuestsLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>加载中...</div>
        ) : userQuestsData ? (
          <>
            {/* 统计摘要 */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 24 }}>
              <div>
                <Text type="secondary">完成任务数：</Text>
                <Text strong>{userQuestsData.summary?.totalCompleted || 0}</Text>
              </div>
              <div>
                <Text type="secondary">总奖励：</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {userQuestsData.summary?.totalReward || '0'} USDT
                </Text>
              </div>
              <div>
                <Text type="secondary">TG ID：</Text>
                <Text copyable>{userQuestsData.user?.tgId}</Text>
              </div>
            </div>

            {/* 任务列表 */}
            <Table
              dataSource={userQuestsData.completedQuests || []}
              rowKey="questId"
              size="small"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: '任务ID',
                  dataIndex: 'questId',
                  width: 80,
                },
                {
                  title: '任务类型',
                  dataIndex: 'questType',
                  width: 120,
                  render: (type) => {
                    const typeColors = {
                      JOIN_CHANNEL: 'blue',
                      JOIN_GROUP: 'cyan',
                      FOLLOW_TWITTER: 'geekblue',
                      LIKE_TWITTER: 'purple',
                      RETWEET_TWITTER: 'magenta',
                      COMMENT_TWITTER: 'volcano',
                    };
                    return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
                  },
                },
                {
                  title: '任务名称',
                  dataIndex: 'questTitle',
                  ellipsis: true,
                },
                {
                  title: '奖励',
                  dataIndex: 'rewardAmount',
                  width: 100,
                  render: (amount, record) => (
                    <span style={{ color: '#52c41a' }}>
                      +{amount} {record.rewardAsset || 'USDT'}
                    </span>
                  ),
                },
                {
                  title: '完成时间',
                  dataIndex: 'completedAt',
                  width: 160,
                  render: (date) => date ? new Date(date).toLocaleString('zh-CN') : '-',
                },
                {
                  title: 'Twitter ID',
                  dataIndex: 'twitterId',
                  width: 120,
                  render: (id) => id ? <Text copyable={{ text: id }}>{id.slice(0, 10)}...</Text> : '-',
                },
              ]}
            />
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
            暂无数据
          </div>
        )}
      </Modal>
    </div>
  );
}
