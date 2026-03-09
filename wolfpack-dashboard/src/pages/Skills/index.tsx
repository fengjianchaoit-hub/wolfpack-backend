import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Badge, Typography, Tooltip } from 'antd';
import {
  GithubOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'testing' | 'monitoring' | 'automation' | 'integration';
  status: 'active' | 'inactive' | 'development';
  version: string;
  codeUrl: string;
  lastUpdated: string;
  author: string;
  usageCount: number;
  tags: string[];
}

const mockSkills: Skill[] = [
  {
    id: 'wolfpack-e2e-test',
    name: 'Wolfpack E2E 测试',
    description: '基于 Playwright 的全自动化测试技能，覆盖元素/流程/数据/异常四大校验维度',
    category: 'testing',
    status: 'active',
    version: '1.0.0',
    codeUrl: 'https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/wolfpack-e2e-test',
    lastUpdated: '2026-03-09',
    author: '狼头',
    usageCount: 15,
    tags: ['playwright', 'e2e', 'automation', 'testing'],
  },
  {
    id: 'feishu-sync',
    name: '飞书IM同步',
    description: '将Kimi对话记录自动同步到飞书群，支持定时推送和手动触发',
    category: 'integration',
    status: 'active',
    version: '1.2.0',
    codeUrl: 'https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/feishu-sync',
    lastUpdated: '2026-03-03',
    author: '狼牙01',
    usageCount: 128,
    tags: ['feishu', 'webhook', 'sync', 'integration'],
  },
  {
    id: 'douyin-live-grabber',
    name: '抖音直播数据抓取',
    description: '自动化抓取抖音直播间数据，支持多直播间监控和数据存储',
    category: 'automation',
    status: 'active',
    version: '2.1.0',
    codeUrl: 'https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/douyin-live-grabber',
    lastUpdated: '2026-03-02',
    author: '狼头',
    usageCount: 342,
    tags: ['douyin', 'crawler', 'livestream', 'data'],
  },
  {
    id: 'task-scheduler',
    name: '狼牙任务调度器',
    description: '定时任务调度与监控，支持失败重试和告警通知',
    category: 'automation',
    status: 'active',
    version: '1.5.0',
    codeUrl: 'https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/task-scheduler',
    lastUpdated: '2026-03-08',
    author: '狼牙02',
    usageCount: 567,
    tags: ['scheduler', 'cron', 'monitoring', 'automation'],
  },
  {
    id: 'wecom-adapter',
    name: '企业微信适配器',
    description: '企业微信IM集成，支持多租户和权限控制（开发中）',
    category: 'integration',
    status: 'development',
    version: '0.3.0',
    codeUrl: 'https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/wecom-adapter',
    lastUpdated: '2026-03-09',
    author: '狼头',
    usageCount: 0,
    tags: ['wecom', 'enterprise', 'im', 'integration'],
  },
];

const SkillManagement: React.FC = () => {
  const [skills] = useState(mockSkills);

  const columns: ColumnsType<Skill> = [
    {
      title: '技能名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Skill) => (
        <div>
          <div style={{ color: '#f0f6fc', fontWeight: 600 }}>{name}</div>
          <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version: string) => (
        <Tag style={{ background: '#238636', color: '#fff', border: 'none' }}>v{version}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          active: { color: '#3fb950', icon: <CheckCircleOutlined />, text: '生产中' },
          inactive: { color: '#8b949e', icon: <PauseCircleOutlined />, text: '已停用' },
          development: { color: '#d29922', icon: <CodeOutlined />, text: '开发中' },
        };
        const { color, icon, text } = config[status];
        return (
          <Tag icon={icon} style={{ background: 'transparent', color, border: `1px solid ${color}` }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => {
        const labels: Record<string, string> = {
          testing: '测试',
          monitoring: '监控',
          automation: '自动化',
          integration: '集成',
        };
        return <Tag style={{ background: '#1f6feb', color: '#fff', border: 'none' }}>{labels[category] || category}</Tag>;
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100,
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      sorter: (a, b) => a.usageCount - b.usageCount,
      render: (count: number) => (
        <Badge
          count={count}
          style={{ backgroundColor: count > 100 ? '#238636' : '#8b949e' }}
        />
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: Skill) => (
        <Space size="small">
          <Tooltip title="查看代码">
            <Button
              icon={<GithubOutlined />}
              size="small"
              onClick={() => window.open(record.codeUrl, '_blank')}
            >
              代码
            </Button>
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '停用' : '启用'}>
            <Button
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              size="small"
              type={record.status === 'active' ? 'default' : 'primary'}
              danger={record.status === 'active'}
            >
              {record.status === 'active' ? '停用' : '启用'}
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button icon={<EditOutlined />} size="small">编辑</Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const activeCount = skills.filter(s => s.status === 'active').length;
  const devCount = skills.filter(s => s.status === 'development').length;
  const totalUsage = skills.reduce((sum, s) => sum + s.usageCount, 0);

  return (
    <div>
      <Title level={4} style={{ color: '#f0f6fc', marginBottom: 24 }}>
        <ToolOutlined /> 技能管理
      </Title>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#3fb950', fontWeight: 'bold' }}>{activeCount}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>生产中技能</div>
          </div>
        </Card>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#d29922', fontWeight: 'bold' }}>{devCount}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>开发中</div>
          </div>
        </Card>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#58a6ff', fontWeight: 'bold' }}>{totalUsage}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>总调用次数</div>
          </div>
        </Card>
        <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#a371f7', fontWeight: 'bold' }}>{skills.length}</div>
            <div style={{ color: '#8b949e', marginTop: 8 }}>技能总数</div>
          </div>
        </Card>
      </div>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>技能列表</span>
            <Space>
              <Button type="primary" icon={<ToolOutlined />}>新增技能</Button>
              <Button icon={<GithubOutlined />}>同步仓库</Button>
            </Space>
          </div>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
          body: { background: '#161b22' }
        }}
      >
        <Table
          columns={columns}
          dataSource={skills}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <div style={{ marginTop: 24, padding: 16, background: '#161b22', borderRadius: 8, border: '1px solid #30363d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#d29922' }} />
          <Text style={{ color: '#d29922', fontWeight: 600 }}>生产环境技能管理规范</Text>
        </div>
        <ul style={{ color: '#8b949e', margin: 0, paddingLeft: 24 }}>
          <li>所有生产技能必须在 GitHub 有对应仓库，代码需经过 Review</li>
          <li>技能发布前需通过 E2E 自动化测试</li>
          <li>生产技能版本号遵循 Semver 规范</li>
          <li>停用技能需提前通知使用方，保留至少 7 天过渡期</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillManagement;