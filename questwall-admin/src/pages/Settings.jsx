import { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, message, Tabs, Switch, Input, Divider, Space, Alert, Spin } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { configApi } from '../services/api';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [checkInForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [systemForm] = Form.useForm();

  // 加载配置
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setInitialLoading(true);
      const configs = await configApi.getAll();

      checkInForm.setFieldsValue({
        day1: configs.checkin?.day1 ?? 10,
        day2: configs.checkin?.day2 ?? 20,
        day3: configs.checkin?.day3 ?? 30,
        day4: configs.checkin?.day4 ?? 40,
        day5: configs.checkin?.day5 ?? 50,
        day6: configs.checkin?.day6 ?? 60,
        day7: configs.checkin?.day7 ?? 100,
        makeupCost: configs.checkin?.makeupCost ?? 20,
      });

      inviteForm.setFieldsValue({
        inviterReward: configs.invite?.inviterReward ?? 1,
        inviteeReward: configs.invite?.inviteeReward ?? 1,
        maxInvites: configs.invite?.maxInvites ?? 100,
      });

      systemForm.setFieldsValue({
        siteName: configs.system?.siteName ?? 'Quest Wall',
        maintenanceMode: configs.system?.maintenanceMode ?? false,
        telegramBotToken: configs.system?.telegramBotToken ?? '',
      });

      // 更新浏览器标题和侧边栏
      if (configs.system?.siteName) {
        document.title = `${configs.system.siteName} - 管理后台`;
        window.dispatchEvent(new CustomEvent('adminConfigUpdated', {
          detail: { siteName: configs.system.siteName }
        }));
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      message.error('加载配置失败');
    } finally {
      setInitialLoading(false);
    }
  };

  // 保存签到配置
  const saveCheckInConfig = async (values) => {
    setLoading(true);
    try {
      await configApi.saveCheckIn(values);
      message.success('签到配置保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存邀请配置
  const saveInviteConfig = async (values) => {
    setLoading(true);
    try {
      await configApi.saveInvite(values);
      message.success('邀请配置保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存系统配置
  const saveSystemConfig = async (values) => {
    setLoading(true);
    try {
      await configApi.saveSystem(values);

      // 更新浏览器标签页标题
      if (values.siteName) {
        document.title = `${values.siteName} - 管理后台`;
      }

      // 触发自定义事件，通知其他组件配置已更新
      window.dispatchEvent(new CustomEvent('adminConfigUpdated', {
        detail: { siteName: values.siteName }
      }));

      message.success('系统配置保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'checkin',
      label: '签到奖励',
      children: (
        <Card>
          <Alert
            message="签到奖励配置"
            description="设置用户连续签到每天可获得的积分奖励"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Form
            form={checkInForm}
            layout="vertical"
            onFinish={saveCheckInConfig}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <Form.Item name="day1" label="第1天">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
              <Form.Item name="day2" label="第2天">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
              <Form.Item name="day3" label="第3天">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
              <Form.Item name="day4" label="第4天">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
              <Form.Item name="day5" label="第5天">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
              <Form.Item name="day6" label="第6天">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
              <Form.Item name="day7" label="第7天（满周）">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
              <Form.Item name="makeupCost" label="补签费用">
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="积分" />
              </Form.Item>
            </div>
            <Divider />
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                保存签到配置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'invite',
      label: '邀请奖励',
      children: (
        <Card>
          <Alert
            message="邀请奖励配置"
            description="设置用户邀请好友注册时双方获得的奖励"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Form
            form={inviteForm}
            layout="vertical"
            onFinish={saveInviteConfig}
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              name="inviterReward"
              label="邀请人奖励"
              tooltip="成功邀请一个用户后，邀请人获得的 USDT"
            >
              <InputNumber min={0} style={{ width: '100%' }} addonAfter="USDT" />
            </Form.Item>
            <Form.Item
              name="inviteeReward"
              label="被邀请人奖励"
              tooltip="通过邀请链接注册的新用户获得的 USDT"
            >
              <InputNumber min={0} style={{ width: '100%' }} addonAfter="USDT" />
            </Form.Item>
            <Form.Item
              name="maxInvites"
              label="最大邀请数"
              tooltip="每个用户最多可邀请多少人"
            >
              <InputNumber min={1} style={{ width: '100%' }} addonAfter="人" />
            </Form.Item>
            <Divider />
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                保存邀请配置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'system',
      label: '系统设置',
      children: (
        <Card>
          <Alert
            message="系统配置"
            description="全局系统设置，请谨慎修改"
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Form
            form={systemForm}
            layout="vertical"
            onFinish={saveSystemConfig}
            style={{ maxWidth: 500 }}
          >
            <Form.Item name="siteName" label="站点名称">
              <Input placeholder="Quest Wall" />
            </Form.Item>
            <Form.Item
              name="maintenanceMode"
              label="维护模式"
              valuePropName="checked"
              tooltip="开启后用户端将显示维护提示"
            >
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item
              name="telegramBotToken"
              label="Telegram Bot Token"
              tooltip="用于发送通知的 Bot Token"
            >
              <Input.Password placeholder="输入 Bot Token" />
            </Form.Item>
            <Divider />
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  保存系统配置
                </Button>
                <Button icon={<ReloadOutlined />} onClick={loadConfigs}>
                  重新加载
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载配置中..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>系统设置</h2>
        <p style={{ color: '#666', margin: '8px 0 0' }}>配置签到奖励、邀请奖励和系统参数</p>
      </div>
      <Tabs items={items} />
    </div>
  );
}
