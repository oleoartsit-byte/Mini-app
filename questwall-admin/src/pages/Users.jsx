import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Input,
  Tag,
  Button,
  Modal,
  Descriptions,
  Timeline,
  Collapse,
  message,
  Tabs,
  Space,
  Form,
  Select,
  DatePicker,
  Popconfirm,
  Badge,
} from 'antd';
import {
  EyeOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  UserOutlined,
  DesktopOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { userApi, blacklistApi } from '../services/api';

const { Search } = Input;
const { Option } = Select;

// 黑名单类型映射
const BLACKLIST_TYPE_MAP = {
  USER: { label: '用户', color: 'red', icon: <UserOutlined /> },
  DEVICE: { label: '设备', color: 'orange', icon: <DesktopOutlined /> },
  IP: { label: 'IP', color: 'blue', icon: <GlobalOutlined /> },
};

export default function Users() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 黑名单相关状态
  const [blacklist, setBlacklist] = useState([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [blacklistModalVisible, setBlacklistModalVisible] = useState(false);
  const [blacklistForm] = Form.useForm();

  const loadUsers = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const res = await userApi.getList({ page, pageSize, search });
      setUsers(res.items || []);
      setPagination({
        current: res.page,
        pageSize: res.pageSize,
        total: res.total,
      });
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载黑名单列表
  const loadBlacklist = async () => {
    setBlacklistLoading(true);
    try {
      const res = await blacklistApi.getList();
      setBlacklist(res.items || []);
    } catch (error) {
      message.error('加载黑名单失败');
    } finally {
      setBlacklistLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadBlacklist();
    }
  }, [activeTab]);

  const handleSearch = (value) => {
    setSearchText(value);
    loadUsers(1, pagination.pageSize, value);
  };

  const showDetail = async (user) => {
    try {
      const detail = await userApi.getDetail(user.id);
      setSelectedUser(detail);
      setDetailVisible(true);
    } catch (error) {
      message.error('加载用户详情失败');
    }
  };

  // 添加用户到黑名单
  const handleAddUserToBlacklist = (user) => {
    blacklistForm.setFieldsValue({
      type: 'USER',
      value: user.tgId,
      reason: '',
    });
    setBlacklistModalVisible(true);
  };

  // 添加到黑名单
  const handleAddBlacklist = async () => {
    try {
      const values = await blacklistForm.validateFields();
      await blacklistApi.add(values);
      message.success('添加成功');
      setBlacklistModalVisible(false);
      blacklistForm.resetFields();
      loadBlacklist();
    } catch (error) {
      message.error(error.message || '添加失败');
    }
  };

  // 从黑名单移除
  const handleRemoveBlacklist = async (id) => {
    try {
      await blacklistApi.remove(id);
      message.success('移除成功');
      loadBlacklist();
    } catch (error) {
      message.error(error.message || '移除失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Telegram ID',
      dataIndex: 'tgId',
      width: 120,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      render: (text) => text || '-',
    },
    {
      title: '姓名',
      render: (_, record) =>
        [record.firstName, record.lastName].filter(Boolean).join(' ') || '-',
    },
    {
      title: '钱包地址',
      dataIndex: 'walletAddr',
      width: 150,
      render: (addr) =>
        addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '-',
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
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 150,
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
          <Button
            type="text"
            size="small"
            danger
            icon={<StopOutlined />}
            onClick={() => handleAddUserToBlacklist(record)}
          >
            拉黑
          </Button>
        </Space>
      ),
    },
  ];

  // 黑名单列表列配置
  const blacklistColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type) => (
        <Tag icon={BLACKLIST_TYPE_MAP[type]?.icon} color={BLACKLIST_TYPE_MAP[type]?.color}>
          {BLACKLIST_TYPE_MAP[type]?.label}
        </Tag>
      ),
    },
    {
      title: '值',
      dataIndex: 'value',
      width: 200,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      render: (text) => text || '-',
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      width: 160,
      render: (date, record) => {
        if (!date) return <Tag color="red">永久</Tag>;
        const isExpired = record.isExpired;
        return (
          <span style={{ color: isExpired ? '#999' : undefined }}>
            {new Date(date).toLocaleString('zh-CN')}
            {isExpired && <Tag color="default" style={{ marginLeft: 4 }}>已过期</Tag>}
          </span>
        );
      },
    },
    {
      title: '添加时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确认移除"
          description="确定要从黑名单移除吗？"
          onConfirm={() => handleRemoveBlacklist(record.id)}
          okText="确认"
          cancelText="取消"
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Tab 配置
  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          <span style={{ marginLeft: 8 }}>用户列表</span>
        </span>
      ),
    },
    {
      key: 'blacklist',
      label: (
        <span>
          <StopOutlined />
          <span style={{ marginLeft: 8 }}>黑名单</span>
          {blacklist.length > 0 && (
            <Badge count={blacklist.length} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card title="用户管理">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        {activeTab === 'users' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Search
                placeholder="搜索用户名或 Telegram ID"
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, pageSize) => loadUsers(page, pageSize, searchText),
              }}
            />
          </>
        )}

        {activeTab === 'blacklist' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<StopOutlined />}
                onClick={() => {
                  blacklistForm.resetFields();
                  setBlacklistModalVisible(true);
                }}
              >
                添加黑名单
              </Button>
            </div>
            <Table
              columns={blacklistColumns}
              dataSource={blacklist}
              rowKey="id"
              loading={blacklistLoading}
              pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
            />
          </>
        )}
      </Card>

      {/* 添加黑名单弹窗 */}
      <Modal
        title="添加到黑名单"
        open={blacklistModalVisible}
        onOk={handleAddBlacklist}
        onCancel={() => {
          setBlacklistModalVisible(false);
          blacklistForm.resetFields();
        }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={blacklistForm} layout="vertical">
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Option value="USER">用户 (Telegram ID)</Option>
              <Option value="DEVICE">设备 (Visitor ID)</Option>
              <Option value="IP">IP 地址</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="value"
            label="值"
            rules={[{ required: true, message: '请输入值' }]}
          >
            <Input placeholder="请输入要拉黑的值" />
          </Form.Item>
          <Form.Item name="reason" label="原因">
            <Input.TextArea placeholder="请输入拉黑原因（可选）" rows={3} />
          </Form.Item>
          <Form.Item name="expiresAt" label="过期时间">
            <DatePicker
              showTime
              placeholder="留空表示永久"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户详情弹窗 */}
      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Telegram ID">
                {selectedUser.tgId}
              </Descriptions.Item>
              <Descriptions.Item label="用户名">
                {selectedUser.username || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="姓名">
                {[selectedUser.firstName, selectedUser.lastName]
                  .filter(Boolean)
                  .join(' ') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="钱包地址" span={2}>
                {selectedUser.walletAddr || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="风险评估" span={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag
                    color={
                      selectedUser.riskScore > 50
                        ? 'red'
                        : selectedUser.riskScore > 20
                        ? 'orange'
                        : 'green'
                    }
                  >
                    {selectedUser.riskScore} 分
                  </Tag>
                  <Tag
                    color={
                      selectedUser.riskLevel === 'high'
                        ? 'red'
                        : selectedUser.riskLevel === 'medium'
                        ? 'orange'
                        : 'green'
                    }
                  >
                    {selectedUser.riskLevel === 'high'
                      ? '高风险'
                      : selectedUser.riskLevel === 'medium'
                      ? '中风险'
                      : '低风险'}
                  </Tag>
                </div>
              </Descriptions.Item>
              {selectedUser.riskFactors && selectedUser.riskFactors.length > 0 && (
                <Descriptions.Item label="风险因素" span={2}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedUser.riskFactors.map((factor, idx) => (
                      <Tag key={idx} color="warning" icon={<WarningOutlined />}>
                        {factor}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="语言">
                {selectedUser.locale}
              </Descriptions.Item>
              <Descriptions.Item label="完成任务数">
                {selectedUser.completedQuests || 0}
              </Descriptions.Item>
              <Descriptions.Item label="获得奖励">
                {selectedUser.totalRewards || 0} Stars
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {new Date(selectedUser.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            {/* 风控事件历史 */}
            {selectedUser.riskEvents && selectedUser.riskEvents.length > 0 && (
              <Collapse
                style={{ marginTop: 16 }}
                items={[
                  {
                    key: 'risk-events',
                    label: (
                      <span>
                        <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                        风控事件历史 ({selectedUser.riskEvents.length})
                      </span>
                    ),
                    children: (
                      <Timeline
                        items={selectedUser.riskEvents.map((event) => ({
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

            {/* 无风险事件提示 */}
            {(!selectedUser.riskEvents || selectedUser.riskEvents.length === 0) && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <InfoCircleOutlined style={{ color: '#52c41a' }} />
                <span>该用户暂无风控事件记录</span>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
