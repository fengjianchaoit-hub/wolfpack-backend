import React, { useState } from 'react';
import { Card, Table, Tag, Button, Switch, Select, Form, Input, Modal, Tabs, Badge, Timeline, Row, Col, Statistic } from 'antd';
import { 
  BellOutlined, 
  SettingOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Alert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  source: string;
  status: 'new' | 'acked' | 'resolved';
  createdAt: string;
  ackedBy?: string;
  ackedAt?: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  notifyChannels: string[];
}

const mockAlerts: Alert[] = [
  { id: '1', level: 'critical', title: '服务器CPU使用率超过90%', message: '47.84.71.25 CPU使用率达到92%，持续5分钟', source: '狼牙02', status: 'new', createdAt: '2026-03-09 17:30:00' },
  { id: '2', level: 'warning', title: '磁盘空间不足', message: '磁盘使用率超过85%，剩余空间不足10GB', source: '狼牙03', status: 'acked', createdAt: '2026-03-09 16:20:00', ackedBy: '管理员', ackedAt: '2026-03-09 16:25:00' },
  { id: '3', level: 'info', title: '任务执行完成', message: '每日数据备份任务已成功完成', source: '狼牙01', status: 'resolved', createdAt: '2026-03-09 15:00:00' },
];

const mockRules: AlertRule[] = [
  { id: '1', name: 'CPU高负载告警', metric: 'cpu_percent', condition: '>', threshold: 80, enabled: true, notifyChannels: ['feishu', 'email'] },
  { id: '2', name: '内存不足告警', metric: 'memory_percent', condition: '>', threshold: 85, enabled: true, notifyChannels: ['feishu'] },
  { id: '3', name: '磁盘空间告警', metric: 'disk_percent', condition: '>', threshold: 90, enabled: false, notifyChannels: ['email'] },
];

const Alerts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const alertColumns: ColumnsType<Alert> = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          critical: { color: '#da3633', icon: <CloseCircleOutlined />, text: '严重' },
          warning: { color: '#d29922', icon: <WarningOutlined />, text: '警告' },
          info: { color: '#58a6ff', icon: <InfoCircleOutlined />, text: '提示' },
        };
        const { color, icon, text } = config[level];
        return <Tag style={{ borderColor: color, color }}>{icon} {text}</Tag>;
      },
    },
    {
      title: '告警标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => <Tag>{source}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config: Record<string, { color: string; text: string }> = {
          new: { color: '#f85149', text: '未处理' },
          acked: { color: '#d29922', text: '已确认' },
          resolved: { color: '#3fb950', text: '已解决' },
        };
        const { color, text } = config[status];
        return <Badge color={color} text={text} />;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small">
          {record.status === 'new' ? '确认' : '查看'}
        </Button>
      ),
    },
  ];

  const ruleColumns: ColumnsType<AlertRule> = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '指标', dataIndex: 'metric', key: 'metric' },
    { title: '条件', dataIndex: 'condition', key: 'condition', width: 80 },
    { title: '阈值', dataIndex: 'threshold', key: 'threshold', width: 100, render: (v) => `${v}%` },
    {
      title: '通知渠道',
      dataIndex: 'notifyChannels',
      key: 'notifyChannels',
      render: (channels) => (
        <>
          {channels.map((c: string) => <Tag key={c}>{c}</Tag>)}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled) => <Switch checked={enabled} size="small" />,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: () => <Button type="link" size="small">编辑</Button>,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="未处理告警"
              value={1}
              valueStyle={{ color: '#f85149' }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日告警"
              value={3}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已解决"
              value={1}
              valueStyle={{ color: '#3fb950' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="告警规则"
              value={3}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'list',
          label: '🔔 告警列表',
          children: (
            <Card extra={<Button icon={<PlusOutlined />}>标记全部已读</Button>}>
              <Table columns={alertColumns} dataSource={mockAlerts} rowKey="id" />
            </Card>
          ),
        },
        {
          key: 'rules',
          label: '⚙️ 告警规则',
          children: (
            <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>新增规则</Button>}>
              <Table columns={ruleColumns} dataSource={mockRules} rowKey="id" pagination={false} />
            </Card>
          ),
        },
        {
          key: 'history',
          label: '📜 告警历史',
          children: (
            <Card>
              <Timeline
                items={[
                  { color: 'red', children: '17:30 CPU告警触发' },
                  { color: 'orange', children: '16:20 磁盘告警已确认' },
                  { color: 'green', children: '15:00 备份任务完成' },
                  { color: 'gray', children: '14:00 系统启动' },
                ]}
              />
            </Card>
          ),
        },
      ]} />

      <Modal
        title="新增告警规则"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="如：CPU高负载告警" />
          </Form.Item>
          <Form.Item name="metric" label="监控指标" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="cpu_percent">CPU使用率</Select.Option>
              <Select.Option value="memory_percent">内存使用率</Select.Option>
              <Select.Option value="disk_percent">磁盘使用率</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="threshold" label="阈值" rules={[{ required: true }]}>
            <Input type="number" suffix="%" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Alerts;