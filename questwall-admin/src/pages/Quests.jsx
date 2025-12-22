import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { questApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

// 任务类型
const QUEST_TYPES = [
  { value: 'JOIN_CHANNEL', label: '关注频道' },
  { value: 'JOIN_GROUP', label: '加入群组' },
  { value: 'DEEP_LINK', label: '深度链接' },
  { value: 'FOLLOW_TWITTER', label: '关注推特' },
  { value: 'RETWEET_TWITTER', label: '转发推特' },
  { value: 'LIKE_TWITTER', label: '点赞推特' },
  { value: 'COMMENT_TWITTER', label: '评论推特' },
  { value: 'ONCHAIN_TRANSFER', label: '链上转账' },
  { value: 'FORM', label: '表单任务' },
];

// 奖励类型
const REWARD_TYPES = [
  { value: 'USDT', label: 'USDT' },
];

// 任务状态
const STATUS_MAP = {
  DRAFT: { color: 'default', text: '草稿' },
  ACTIVE: { color: 'success', text: '活跃' },
  PAUSED: { color: 'warning', text: '暂停' },
  ENDED: { color: 'error', text: '结束' },
};

// 常用国家/地区列表
const COUNTRY_OPTIONS = [
  { value: 'CN', label: '🇨🇳 中国大陆' },
  { value: 'HK', label: '🇭🇰 香港' },
  { value: 'TW', label: '🇨🇳 台湾' },
  { value: 'US', label: '🇺🇸 美国' },
  { value: 'JP', label: '🇯🇵 日本' },
  { value: 'KR', label: '🇰🇷 韩国' },
  { value: 'SG', label: '🇸🇬 新加坡' },
  { value: 'MY', label: '🇲🇾 马来西亚' },
  { value: 'TH', label: '🇹🇭 泰国' },
  { value: 'VN', label: '🇻🇳 越南' },
  { value: 'ID', label: '🇮🇩 印尼' },
  { value: 'PH', label: '🇵🇭 菲律宾' },
  { value: 'IN', label: '🇮🇳 印度' },
  { value: 'RU', label: '🇷🇺 俄罗斯' },
  { value: 'GB', label: '🇬🇧 英国' },
  { value: 'DE', label: '🇩🇪 德国' },
  { value: 'FR', label: '🇫🇷 法国' },
  { value: 'AU', label: '🇦🇺 澳大利亚' },
  { value: 'CA', label: '🇨🇦 加拿大' },
  { value: 'BR', label: '🇧🇷 巴西' },
];

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [form] = Form.useForm();

  // 分页
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载任务列表
  const loadQuests = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await questApi.getList({ page, pageSize });
      setQuests(res.items || []);
      setPagination({
        current: res.page,
        pageSize: res.pageSize,
        total: res.total,
      });
    } catch (error) {
      message.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuests();
  }, []);

  // 打开创建/编辑弹窗
  const openModal = (quest = null) => {
    setEditingQuest(quest);
    if (quest) {
      form.setFieldsValue({
        ...quest,
        rewardAmount: quest.reward?.amount,
        rewardType: quest.reward?.type,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        type: values.type,
        title: values.title,
        titleEn: values.titleEn,
        description: values.description,
        descriptionEn: values.descriptionEn,
        reward: {
          type: values.rewardType,
          amount: String(values.rewardAmount),
        },
        targetUrl: values.targetUrl,
        channelId: values.channelId,
        targetCountries: values.targetCountries || [],
        limits: {
          dailyCap: values.dailyCap || 100,
          perUserCap: values.perUserCap || 1,
        },
      };

      if (editingQuest) {
        await questApi.update(editingQuest.id, data);
        message.success('更新成功');
      } else {
        await questApi.create(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadQuests(pagination.current);
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  // 删除任务
  const handleDelete = async (id) => {
    try {
      await questApi.delete(id);
      message.success('删除成功');
      loadQuests(pagination.current);
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新状态
  const handleStatusChange = async (id, status) => {
    try {
      await questApi.updateStatus(id, status);
      message.success('状态更新成功');
      loadQuests(pagination.current);
    } catch (error) {
      message.error('状态更新失败');
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
      title: '标题',
      dataIndex: 'title',
      width: 200,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.titleEn && (
            <div style={{ color: '#999', fontSize: 12 }}>{record.titleEn}</div>
          )}
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type) => QUEST_TYPES.find((t) => t.value === type)?.label || type,
    },
    {
      title: '奖励',
      dataIndex: 'reward',
      width: 120,
      render: (reward) => (
        <span>
          {reward?.amount} {reward?.type}
        </span>
      ),
    },
    {
      title: '目标地区',
      dataIndex: 'targetCountries',
      width: 120,
      render: (countries) => {
        if (!countries || countries.length === 0) {
          return <Tag color="blue">全球</Tag>;
        }
        return (
          <span>
            {countries.slice(0, 2).map((c) => (
              <Tag key={c}>{COUNTRY_OPTIONS.find((o) => o.value === c)?.label || c}</Tag>
            ))}
            {countries.length > 2 && <Tag>+{countries.length - 2}</Tag>}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => (
        <Tag color={STATUS_MAP[status]?.color}>{STATUS_MAP[status]?.text}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(status) => handleStatusChange(record.id, status)}
          >
            <Option value="DRAFT">草稿</Option>
            <Option value="ACTIVE">活跃</Option>
            <Option value="PAUSED">暂停</Option>
            <Option value="ENDED">结束</Option>
          </Select>
          <Popconfirm
            title="确定删除此任务？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="任务管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            创建任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={quests}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => loadQuests(page, pageSize),
          }}
        />
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingQuest ? '编辑任务' : '创建任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select placeholder="选择任务类型">
              {QUEST_TYPES.map((t) => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题（中文）"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="任务标题" />
          </Form.Item>

          <Form.Item name="titleEn" label="标题（英文）">
            <Input placeholder="Task title in English" />
          </Form.Item>

          <Form.Item name="description" label="描述（中文）">
            <TextArea rows={3} placeholder="任务描述" />
          </Form.Item>

          <Form.Item name="descriptionEn" label="描述（英文）">
            <TextArea rows={3} placeholder="Task description in English" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="rewardType"
              label="奖励类型"
              rules={[{ required: true }]}
            >
              <Select style={{ width: 150 }}>
                {REWARD_TYPES.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="rewardAmount"
              label="奖励数量"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: 150 }} />
            </Form.Item>
          </Space>

          <Form.Item name="targetUrl" label="目标链接">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="channelId" label="频道/群组 ID">
            <Input placeholder="@channel 或 -100xxxxxx" />
          </Form.Item>

          <Form.Item
            name="targetCountries"
            label="目标地区"
            tooltip="留空表示全球可见，选择国家后只对这些地区的用户显示"
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="全球（留空）或选择特定国家"
              style={{ width: '100%' }}
              options={COUNTRY_OPTIONS}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="dailyCap" label="每日上限">
              <InputNumber min={1} defaultValue={100} />
            </Form.Item>

            <Form.Item name="perUserCap" label="每人上限">
              <InputNumber min={1} defaultValue={1} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
