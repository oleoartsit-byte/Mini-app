import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Image,
  Modal,
  Input,
  message,
  Statistic,
  Row,
  Col,
  Typography,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  LinkOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { reviewApi } from '../services/api';

const { Text, Link } = Typography;
const { TextArea } = Input;

export default function Reviews() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState('SUBMITTED'); // 默认显示待审核
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 加载数据
  const fetchData = async (page = 1, pageSize = 10, status = statusFilter) => {
    setLoading(true);
    try {
      const result = await reviewApi.getList({
        page,
        pageSize,
        status,
      });
      setData(result.items || []);
      setPagination({
        current: result.page || page,
        pageSize: result.pageSize || pageSize,
        total: result.total || 0,
      });
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const fetchStats = async () => {
    try {
      const result = await reviewApi.getStats();
      setStats(result);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  // 状态筛选变化
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    fetchData(1, pagination.pageSize, status);
  };

  // 表格分页变化
  const handleTableChange = (paginationConfig) => {
    fetchData(paginationConfig.current, paginationConfig.pageSize);
  };

  // 查看详情
  const handleViewDetail = async (record) => {
    try {
      const detail = await reviewApi.getDetail(record.id);
      setCurrentReview(detail);
      setDetailVisible(true);
    } catch (error) {
      message.error('加载详情失败');
    }
  };

  // 审核通过
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await reviewApi.approve(id);
      message.success('审核通过，奖励已发放');
      fetchData(pagination.current, pagination.pageSize);
      fetchStats();
      setDetailVisible(false);
    } catch (error) {
      message.error(error.message || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 打开拒绝弹窗
  const handleOpenReject = (record) => {
    setCurrentReview(record);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // 确认拒绝
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('请输入拒绝原因');
      return;
    }
    setActionLoading(true);
    try {
      await reviewApi.reject(currentReview.id, rejectReason);
      message.success('已拒绝');
      setRejectModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
      fetchStats();
      setDetailVisible(false);
    } catch (error) {
      message.error(error.message || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 状态标签
  const renderStatus = (status) => {
    const statusConfig = {
      SUBMITTED: { color: 'orange', text: '待审核' },
      VERIFIED: { color: 'green', text: '已通过' },
      REWARDED: { color: 'blue', text: '已发奖' },
      REJECTED: { color: 'red', text: '已拒绝' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
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
      dataIndex: 'user',
      width: 150,
      render: (user) => (
        <Space>
          <UserOutlined />
          <span>{user?.username || user?.tgId || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Twitter',
      dataIndex: ['user', 'twitterUsername'],
      width: 130,
      render: (username) =>
        username ? (
          <Link href={`https://x.com/${username}`} target="_blank">
            @{username}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      title: '任务',
      dataIndex: 'quest',
      width: 200,
      ellipsis: true,
      render: (quest) => quest?.title || '-',
    },
    {
      title: '截图',
      dataIndex: 'proofImages',
      width: 120,
      render: (images, record) => {
        // 兼容单图和多图
        const imgList = images || (record.proofImage ? [record.proofImage] : []);
        if (imgList.length === 0) return '-';
        return (
          <Image.PreviewGroup>
            <Space>
              {imgList.slice(0, 3).map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
              {imgList.length > 3 && <Text type="secondary">+{imgList.length - 3}</Text>}
            </Space>
          </Image.PreviewGroup>
        );
      },
    },
    {
      title: '推文链接',
      dataIndex: 'tweetLink',
      width: 100,
      render: (link) =>
        link ? (
          <Tooltip title={link}>
            <Link href={link} target="_blank">
              <LinkOutlined /> 查看
            </Link>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 160,
      render: (date) => (date ? new Date(date).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'SUBMITTED' && (
            <>
              <Popconfirm
                title="确认通过审核并发放奖励？"
                onConfirm={() => handleApprove(record.id)}
              >
                <Button type="link" size="small" style={{ color: '#52c41a' }}>
                  通过
                </Button>
              </Popconfirm>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleOpenReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="待审核"
                value={stats.pending || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日通过"
                value={stats.todayApproved || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日拒绝"
                value={stats.todayRejected || 0}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="累计审核" value={stats.total || 0} />
            </Card>
          </Col>
        </Row>
      )}

      {/* 主表格 */}
      <Card
        title="截图审核"
        extra={
          <Space>
            <Button.Group>
              <Button
                type={statusFilter === 'SUBMITTED' ? 'primary' : 'default'}
                onClick={() => handleStatusChange('SUBMITTED')}
              >
                待审核
              </Button>
              <Button
                type={statusFilter === 'VERIFIED' ? 'primary' : 'default'}
                onClick={() => handleStatusChange('VERIFIED')}
              >
                已通过
              </Button>
              <Button
                type={statusFilter === 'REJECTED' ? 'primary' : 'default'}
                onClick={() => handleStatusChange('REJECTED')}
              >
                已拒绝
              </Button>
              <Button
                type={statusFilter === '' ? 'primary' : 'default'}
                onClick={() => handleStatusChange('')}
              >
                全部
              </Button>
            </Button.Group>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="审核详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={
          currentReview?.status === 'SUBMITTED' ? (
            <Space>
              <Button onClick={() => setDetailVisible(false)}>取消</Button>
              <Button danger onClick={() => handleOpenReject(currentReview)}>
                拒绝
              </Button>
              <Popconfirm
                title="确认通过审核并发放奖励？"
                onConfirm={() => handleApprove(currentReview.id)}
              >
                <Button type="primary" loading={actionLoading}>
                  通过并发奖
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Button onClick={() => setDetailVisible(false)}>关闭</Button>
          )
        }
      >
        {currentReview && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>用户：</Text>
                <Text>{currentReview.user?.username || currentReview.user?.tgId || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Twitter：</Text>
                {currentReview.user?.twitterUsername ? (
                  <Link href={`https://x.com/${currentReview.user.twitterUsername}`} target="_blank">
                    @{currentReview.user.twitterUsername}
                  </Link>
                ) : (
                  '-'
                )}
              </Col>
              <Col span={12}>
                <Text strong>任务：</Text>
                <Text>{currentReview.quest?.title || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>奖励：</Text>
                <Text>
                  {currentReview.quest?.rewardAmount} {currentReview.quest?.rewardType}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>状态：</Text>
                {renderStatus(currentReview.status)}
              </Col>
              <Col span={12}>
                <Text strong>提交时间：</Text>
                <Text>
                  {currentReview.submittedAt
                    ? new Date(currentReview.submittedAt).toLocaleString('zh-CN')
                    : '-'}
                </Text>
              </Col>
              {currentReview.tweetLink && (
                <Col span={24}>
                  <Text strong>推文链接：</Text>
                  <Link href={currentReview.tweetLink} target="_blank">
                    {currentReview.tweetLink}
                  </Link>
                </Col>
              )}
              {currentReview.rejectReason && (
                <Col span={24}>
                  <Text strong>拒绝原因：</Text>
                  <Text type="danger">{currentReview.rejectReason}</Text>
                </Col>
              )}
            </Row>

            <div style={{ marginTop: 16 }}>
              <Text strong>截图证明：</Text>
              <div style={{ marginTop: 8 }}>
                <Image.PreviewGroup>
                  <Space wrap>
                    {(currentReview.proofImages || (currentReview.proofImage ? [currentReview.proofImage] : [])).map(
                      (url, idx) => (
                        <Image
                          key={idx}
                          src={url}
                          width={200}
                          style={{ borderRadius: 8 }}
                        />
                      )
                    )}
                  </Space>
                </Image.PreviewGroup>
              </div>
            </div>

            {currentReview.proof?.aiVerification && (
              <div style={{ marginTop: 16 }}>
                <Text strong>AI 验证结果：</Text>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {JSON.stringify(currentReview.proof.aiVerification, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 拒绝原因弹窗 */}
      <Modal
        title="拒绝原因"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleConfirmReject}
        confirmLoading={actionLoading}
      >
        <TextArea
          rows={4}
          placeholder="请输入拒绝原因..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
