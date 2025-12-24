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
  Tabs,
  Upload,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { tutorialApi, uploadApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

// 教程类型
const TUTORIAL_TYPES = [
  { value: 'ARTICLE', label: '文章', icon: <FileTextOutlined /> },
  { value: 'VIDEO', label: '视频', icon: <PlayCircleOutlined /> },
  { value: 'IMAGE_TEXT', label: '图文', icon: <PictureOutlined /> },
];

// 教程分类
const TUTORIAL_CATEGORIES = [
  { value: 'telegram', label: 'Telegram 教程', icon: '📱' },
  { value: 'twitter', label: 'Twitter 教程', icon: '🐦' },
  { value: 'wallet', label: '钱包教程', icon: '💰' },
  { value: 'invite', label: '邀请教程', icon: '👥' },
  { value: 'other', label: '其他教程', icon: '📚' },
];

// 教程状态
const STATUS_MAP = {
  DRAFT: { color: 'default', text: '草稿' },
  PUBLISHED: { color: 'success', text: '已发布' },
  ARCHIVED: { color: 'warning', text: '已归档' },
};

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [previewTutorial, setPreviewTutorial] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('zh');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // 分页
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载教程列表
  const loadTutorials = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await tutorialApi.getList({ page, pageSize });
      setTutorials(res.items || []);
      setPagination({
        current: res.page,
        pageSize: res.pageSize,
        total: res.total,
      });
    } catch (error) {
      message.error('加载教程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutorials();
  }, []);

  // 打开创建/编辑弹窗
  const openModal = (tutorial = null) => {
    setEditingTutorial(tutorial);
    setActiveTab('zh');
    if (tutorial) {
      form.setFieldsValue({
        ...tutorial,
        images: tutorial.images || [],
      });
      setCoverImageUrl(tutorial.coverImage || '');
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: 'ARTICLE',
        category: 'other',
        icon: '📖',
        sortOrder: 0,
      });
      setCoverImageUrl('');
    }
    setModalVisible(true);
  };

  // 预览教程
  const openPreview = (tutorial) => {
    setPreviewTutorial(tutorial);
    setPreviewVisible(true);
  };

  // 上传封面图
  const handleCoverUpload = async (file) => {
    setUploadingCover(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res.url || res.path;
      setCoverImageUrl(url);
      form.setFieldValue('coverImage', url);
      message.success('封面上传成功');
    } catch (error) {
      message.error('封面上传失败');
    } finally {
      setUploadingCover(false);
    }
    return false; // 阻止默认上传
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        type: values.type,
        category: values.category,
        title: values.title,
        titleEn: values.titleEn,
        description: values.description,
        descriptionEn: values.descriptionEn,
        content: values.content,
        contentEn: values.contentEn,
        coverImage: values.coverImage || coverImageUrl,
        videoUrl: values.videoUrl,
        images: values.images || [],
        icon: values.icon,
        sortOrder: values.sortOrder || 0,
      };

      if (editingTutorial) {
        await tutorialApi.update(editingTutorial.id, data);
        message.success('更新成功');
      } else {
        await tutorialApi.create(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadTutorials(pagination.current);
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  // 删除教程
  const handleDelete = async (id) => {
    try {
      await tutorialApi.delete(id);
      message.success('删除成功');
      loadTutorials(pagination.current);
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新状态
  const handleStatusChange = async (id, status) => {
    try {
      await tutorialApi.updateStatus(id, status);
      message.success('状态更新成功');
      loadTutorials(pagination.current);
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
      title: '封面',
      dataIndex: 'coverImage',
      width: 80,
      render: (url, record) => (
        url ? (
          <Image
            src={url}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={false}
          />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            {record.icon}
          </div>
        )
      ),
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
      render: (type) => {
        const t = TUTORIAL_TYPES.find((t) => t.value === type);
        return t ? (
          <Tag icon={t.icon}>{t.label}</Tag>
        ) : type;
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (category) => {
        const c = TUTORIAL_CATEGORIES.find((c) => c.value === category);
        return c ? `${c.icon} ${c.label}` : category;
      },
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      width: 80,
      render: (count) => count || 0,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 60,
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
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openPreview(record)}
          >
            预览
          </Button>
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
            style={{ width: 90 }}
            onChange={(status) => handleStatusChange(record.id, status)}
          >
            <Option value="DRAFT">草稿</Option>
            <Option value="PUBLISHED">发布</Option>
            <Option value="ARCHIVED">归档</Option>
          </Select>
          <Popconfirm
            title="确定删除此教程？"
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

  // 根据类型渲染不同的表单字段
  const renderTypeSpecificFields = () => {
    const type = Form.useWatch('type', form);

    return (
      <>
        {/* 视频类型 - 显示视频链接 */}
        {type === 'VIDEO' && (
          <Form.Item
            name="videoUrl"
            label="视频链接"
            rules={[{ required: true, message: '请输入视频链接' }]}
          >
            <Input placeholder="YouTube / Bilibili / 其他视频链接" />
          </Form.Item>
        )}

        {/* 图文类型 - 显示图片上传 */}
        {type === 'IMAGE_TEXT' && (
          <Form.Item
            name="images"
            label="图片列表"
            tooltip="支持上传多张图片，将按顺序显示"
          >
            <Input.TextArea
              rows={3}
              placeholder="每行一个图片URL，支持多张图片"
            />
          </Form.Item>
        )}
      </>
    );
  };

  return (
    <div>
      <Card
        title="教程管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            创建教程
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tutorials}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => loadTutorials(page, pageSize),
          }}
        />
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingTutorial ? '编辑教程' : '创建教程'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%', marginBottom: 16 }} size="large">
            <Form.Item
              name="type"
              label="教程类型"
              rules={[{ required: true, message: '请选择教程类型' }]}
              style={{ marginBottom: 0 }}
            >
              <Select style={{ width: 150 }}>
                {TUTORIAL_TYPES.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label="教程分类"
              rules={[{ required: true, message: '请选择教程分类' }]}
              style={{ marginBottom: 0 }}
            >
              <Select style={{ width: 180 }}>
                {TUTORIAL_CATEGORIES.map((c) => (
                  <Option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="icon" label="图标" style={{ marginBottom: 0 }}>
              <Input style={{ width: 80 }} placeholder="📖" />
            </Form.Item>

            <Form.Item name="sortOrder" label="排序" style={{ marginBottom: 0 }}>
              <InputNumber min={0} style={{ width: 80 }} />
            </Form.Item>
          </Space>

          {/* 封面图上传 */}
          <Form.Item name="coverImage" label="封面图">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                showUploadList={false}
                beforeUpload={handleCoverUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploadingCover}>
                  上传封面
                </Button>
              </Upload>
              {coverImageUrl && (
                <Image
                  src={coverImageUrl}
                  width={200}
                  style={{ marginTop: 8, borderRadius: 8 }}
                />
              )}
              <Input
                placeholder="或直接输入图片URL"
                value={coverImageUrl}
                onChange={(e) => {
                  setCoverImageUrl(e.target.value);
                  form.setFieldValue('coverImage', e.target.value);
                }}
              />
            </Space>
          </Form.Item>

          {/* 多语言标签页 */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'zh',
                label: '🇨🇳 中文',
                children: (
                  <>
                    <Form.Item
                      name="title"
                      label="标题"
                      rules={[{ required: true, message: '请输入中文标题' }]}
                    >
                      <Input placeholder="教程标题" />
                    </Form.Item>

                    <Form.Item name="description" label="简介">
                      <TextArea rows={2} placeholder="简短描述" />
                    </Form.Item>

                    <Form.Item name="content" label="内容">
                      <TextArea rows={8} placeholder="教程正文内容（支持 Markdown）" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'en',
                label: '🇺🇸 English',
                children: (
                  <>
                    <Form.Item name="titleEn" label="Title">
                      <Input placeholder="Tutorial title in English" />
                    </Form.Item>

                    <Form.Item name="descriptionEn" label="Description">
                      <TextArea rows={2} placeholder="Short description" />
                    </Form.Item>

                    <Form.Item name="contentEn" label="Content">
                      <TextArea rows={8} placeholder="Tutorial content (Markdown supported)" />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />

          {/* 类型特定字段 */}
          {renderTypeSpecificFields()}
        </Form>
      </Modal>

      {/* 预览弹窗 */}
      <Modal
        title="教程预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={600}
      >
        {previewTutorial && (
          <div style={{ padding: 16 }}>
            {previewTutorial.coverImage && (
              <Image
                src={previewTutorial.coverImage}
                width="100%"
                style={{ borderRadius: 12, marginBottom: 16 }}
              />
            )}
            <h2 style={{ marginBottom: 8 }}>
              {previewTutorial.icon} {previewTutorial.title}
            </h2>
            {previewTutorial.titleEn && (
              <h4 style={{ color: '#666', marginBottom: 16 }}>{previewTutorial.titleEn}</h4>
            )}
            <p style={{ color: '#666', marginBottom: 16 }}>{previewTutorial.description}</p>

            {previewTutorial.type === 'VIDEO' && previewTutorial.videoUrl && (
              <div style={{ marginBottom: 16 }}>
                <Tag color="blue" icon={<PlayCircleOutlined />}>视频链接</Tag>
                <a href={previewTutorial.videoUrl} target="_blank" rel="noopener noreferrer">
                  {previewTutorial.videoUrl}
                </a>
              </div>
            )}

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {previewTutorial.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
