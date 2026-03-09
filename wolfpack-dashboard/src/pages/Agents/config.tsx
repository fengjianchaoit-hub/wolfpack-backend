import React, { useState } from 'react';
import { Card, Form, Input, Select, Switch, Slider, Button, Space, Tag, message, Tabs, Divider, Alert, Typography } from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  capabilities: string[];
  autoRetry: boolean;
  retryCount: number;
  timeout: number;
  memoryEnabled: boolean;
  logLevel: string;
  webhook?: string;
}

const defaultConfigs: Record<string, AgentConfig> = {
  'wolf-tooth-01': {
    id: 'wolf-tooth-01',
    name: '狼牙01',
    role: '数据整理专员',
    model: 'kimi-coding/k2p5',
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: '你是一位专业的数据整理专员，擅长文案编辑、数据清洗和报告生成。工作标准：文案不堆砌，有结论、有洞察。',
    capabilities: ['文案编辑', '数据整理', '日报生成', '格式规范'],
    autoRetry: true,
    retryCount: 3,
    timeout: 300,
    memoryEnabled: true,
    logLevel: 'info',
  },
  'wolf-tooth-02': {
    id: 'wolf-tooth-02',
    name: '狼牙02',
    role: '数据分析专员',
    model: 'kimi-coding/k2p5',
    temperature: 0.5,
    maxTokens: 8192,
    systemPrompt: '你是一位专业的数据分析专员，擅长统计建模、竞品对比和预测分析。工作标准：分析不罗列，有模型、有预测。',
    capabilities: ['统计建模', '竞品分析', '预测分析', '数据可视化'],
    autoRetry: true,
    retryCount: 3,
    timeout: 600,
    memoryEnabled: true,
    logLevel: 'info',
  },
  'wolf-tooth-03': {
    id: 'wolf-tooth-03',
    name: '狼牙03',
    role: '可视化专员',
    model: 'kimi-coding/k2p5',
    temperature: 0.6,
    maxTokens: 4096,
    systemPrompt: '你是一位专业的可视化专员，擅长图表生成、仪表盘搭建和交互组件开发。工作标准：图表不花哨，有逻辑、有重点。',
    capabilities: ['图表生成', '可视化', '仪表盘', 'UI设计'],
    autoRetry: true,
    retryCount: 2,
    timeout: 300,
    memoryEnabled: false,
    logLevel: 'warn',
  },
};

const AgentConfigPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState('wolf-tooth-01');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const currentConfig = defaultConfigs[selectedAgent];

  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      // 模拟保存
      setTimeout(() => {
        setLoading(false);
        message.success(`已保存 ${currentConfig.name} 的配置`);
      }, 1000);
    } catch (error) {
      message.error('配置验证失败，请检查表单');
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('已重置为默认配置');
  };

  const tabItems = [
    {
      key: 'basic',
      label: (
        <span>
          <RobotOutlined /> 基础配置
        </span>
      ),
      children: (
        <div>
          <Alert
            message="基础配置影响代理的核心行为和响应方式"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Form.Item
            name="name"
            label="代理名称"
            rules={[{ required: true, message: '请输入代理名称' }]}
          >
            <Input placeholder="如: 狼牙01" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色定位"
            rules={[{ required: true, message: '请输入角色定位' }]}
          >
            <Input placeholder="如: 数据整理专员" />
          </Form.Item>

          <Form.Item
            name="model"
            label="AI模型"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="kimi-coding/k2p5">Kimi K2.5 (Coding)</Select.Option>
              <Select.Option value="kimi/k2p5">Kimi K2.5 (General)</Select.Option>
              <Select.Option value="kimi/k1.5">Kimi K1.5</Select.Option>
              <Select.Option value="claude-3-opus">Claude 3 Opus</Select.Option>
              <Select.Option value="gpt-4-turbo">GPT-4 Turbo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="systemPrompt"
            label="系统提示词 (System Prompt)"
            rules={[{ required: true, message: '请输入系统提示词' }]}
          >
            <TextArea
              rows={6}
              placeholder="定义代理的核心身份、工作标准和行为准则..."
            />
          </Form.Item>

          <Form.Item name="capabilities" label="能力标签">
            <Select mode="tags" placeholder="输入能力标签，按回车确认">
              <Select.Option value="文案编辑">文案编辑</Select.Option>
              <Select.Option value="数据分析">数据分析</Select.Option>
              <Select.Option value="图表生成">图表生成</Select.Option>
              <Select.Option value="代码开发">代码开发</Select.Option>
            </Select>
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'model',
      label: (
        <span>
          <ThunderboltOutlined /> 模型参数
        </span>
      ),
      children: (
        <div>
          <Alert
            message="模型参数影响输出的创造性和长度"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item name="temperature" label="Temperature (创造性)">
            <div>
              <Slider
                min={0}
                max={2}
                step={0.1}
                marks={{
                  0: '精确',
                  0.5: '平衡',
                  1: '创造',
                  2: '随机',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: 12 }}>
                <span>低: 更确定的回答</span>
                <span>高: 更有创意的回答</span>
              </div>
            </div>
          </Form.Item>

          <Form.Item name="maxTokens" label="Max Tokens (最大输出长度)">
            <Slider
              min={512}
              max={16384}
              step={512}
              marks={{
                512: '512',
                4096: '4K',
                8192: '8K',
                16384: '16K',
              }}
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'execution',
      label: (
        <span>
          <ClockCircleOutlined /> 执行策略
        </span>
      ),
      children: (
        <div>
          <Alert
            message="执行策略控制任务的超时、重试和失败处理"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item name="autoRetry" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            <span style={{ marginLeft: 8, color: '#f0f6fc' }}>自动重试失败任务</span>
          </Form.Item>

          <Form.Item name="retryCount" label="最大重试次数">
            <Slider min={1} max={5} marks={{ 1: '1次', 3: '3次', 5: '5次' }} />
          </Form.Item>

          <Form.Item name="timeout" label="任务超时时间 (秒)">
            <Slider
              min={60}
              max={3600}
              step={60}
              marks={{
                60: '1分',
                300: '5分',
                600: '10分',
                1800: '30分',
                3600: '1小时',
              }}
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'advanced',
      label: (
        <span>
          <SafetyCertificateOutlined /> 高级设置
        </span>
      ),
      children: (
        <div>
          <Form.Item name="memoryEnabled" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            <span style={{ marginLeft: 8, color: '#f0f6fc' }}>启用长期记忆 (MEMORY.md)</span>
          </Form.Item>

          <Form.Item name="logLevel" label="日志级别">
            <Select>
              <Select.Option value="debug">Debug - 详细调试信息</Select.Option>
              <Select.Option value="info">Info - 常规运行信息</Select.Option>
              <Select.Option value="warn">Warn - 仅警告和错误</Select.Option>
              <Select.Option value="error">Error - 仅错误</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="webhook" label="回调 Webhook">
            <Input placeholder="https://..." />
          </Form.Item>

          <Divider />

          <Alert
            message="危险区域: 以下操作可能导致数据丢失"
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space>
            <Button danger>重置为默认配置</Button>
            <Button danger>清除所有记忆</Button>
            <Button danger>停用代理</Button>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ color: '#f0f6fc', margin: 0 }}>
          <SettingOutlined /> 代理配置
        </Title>
        <Space>
          <Select
            value={selectedAgent}
            onChange={setSelectedAgent}
            style={{ width: 200 }}
            options={[
              { label: '🤖 狼牙01 - 数据整理', value: 'wolf-tooth-01' },
              { label: '🤖 狼牙02 - 数据分析', value: 'wolf-tooth-02' },
              { label: '🤖 狼牙03 - 可视化', value: 'wolf-tooth-03' },
            ]}
          />
        </Space>
      </div>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #238636, #2ea043)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RobotOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: '#f0f6fc', fontWeight: 600, fontSize: 16 }}>
                {currentConfig.name}
              </div>
              <div style={{ color: '#8b949e', fontSize: 13 }}>{currentConfig.role}
              </div>
            </div>
            <Tag color="processing" style={{ marginLeft: 'auto' }}>{currentConfig.model}</Tag>
          </div>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>保存配置</Button>
          </Space>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d' },
          body: { background: '#161b22' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={currentConfig}
          key={selectedAgent}
        >
          <Tabs items={tabItems} />
        </Form>
      </Card>
    </div>
  );
};

export default AgentConfigPage;