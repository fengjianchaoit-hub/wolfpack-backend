import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Badge, Table, Button, Space, Tag, Progress, Avatar, Typography, Tooltip, Dropdown } from 'antd';
import {
  RobotOutlined,
  ReloadOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import styles from './index.module.css';

const { Title, Text } = Typography;

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastHeartbeat: string;
  cpuUsage: number;
  memoryUsage: number;
  taskCountTotal: number;
  taskCountSuccess: number;
  taskCountFailed: number;
  currentTask?: string;
  capabilities: string[];
  version: string;
  uptime: string;
}

const mockAgents: Agent[] = [
  {
    id: 'wolf-tooth-01',
    name: '狼牙01',
    role: '数据整理专员',
    status: 'online',
    lastHeartbeat: '2026-03-09 20:45:30',
    cpuUsage: 34,
    memoryUsage: 28,
    taskCountTotal: 156,
    taskCountSuccess: 149,
    taskCountFailed: 7,
    currentTask: 'AI热点日报生成中',
    capabilities: ['文案编辑', '数据整理', '日报生成'],
    version: 'v2.1.0',
    uptime: '14天3小时',
  },
  {
    id: 'wolf-tooth-02',
    name: '狼牙02',
    role: '数据分析专员',
    status: 'busy',
    lastHeartbeat: '2026-03-09 20:44:15',
    cpuUsage: 78,
    memoryUsage: 65,
    taskCountTotal: 203,
    taskCountSuccess: 195,
    taskCountFailed: 8,
    currentTask: '深度数据分析中...',
    capabilities: ['统计建模', '竞品分析', '预测分析'],
    version: 'v2.0.5',
    uptime: '12天8小时',
  },
  {
    id: 'wolf-tooth-03',
    name: '狼牙03',
    role: '可视化专员',
    status: 'online',
    lastHeartbeat: '2026-03-09 20:45:45',
    cpuUsage: 45,
    memoryUsage: 42,
    taskCountTotal: 178,
    taskCountSuccess: 172,
    taskCountFailed: 6,
    currentTask: '仪表盘图表渲染',
    capabilities: ['图表生成', '可视化', '仪表盘'],
    version: 'v2.1.2',
    uptime: '10天6小时',
  },
  {
    id: 'wolf-tooth-04',
    name: '狼牙04',
    role: '测试专员',
    status: 'offline',
    lastHeartbeat: '2026-03-09 18:30:00',
    cpuUsage: 0,
    memoryUsage: 0,
    taskCountTotal: 89,
    taskCountSuccess: 85,
    taskCountFailed: 4,
    currentTask: undefined,
    capabilities: ['E2E测试', '性能测试', '回归测试'],
    version: 'v1.9.0',
    uptime: '-',
  },
];

const AgentMonitor: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const onlineCount = agents.filter(a => a.status === 'online').length;
  const busyCount = agents.filter(a => a.status === 'busy').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.taskCountTotal, 0);
  const successRate = Math.round(
    agents.reduce((sum, a) => sum + a.taskCountSuccess, 0) / 
    agents.reduce((sum, a) => sum + a.taskCountTotal, 0) * 100
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      online: { color: '#3fb950', icon: <CheckCircleOutlined />, text: '在线' },
      busy: { color: '#d29922', icon: <ThunderboltOutlined />, text: '忙碌' },
      offline: { color: '#8b949e', icon: <CloseCircleOutlined />, text: '离线' },
      error: { color: '#f85149', icon: <WarningOutlined />, text: '异常' },
    };
    return configs[status] || configs.offline;
  };

  const columns: ColumnsType<Agent> = [
    {
      title: '代理信息',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: Agent) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            icon={<RobotOutlined />}
            style={{
              background: record.status === 'online' 
                ? 'linear-gradient(135deg, #238636, #2ea043)'
                : record.status === 'busy'
                ? 'linear-gradient(135deg, #d29922, #f0883e)'
                : '#30363d',
            }}
          />
          <div>
            <div style={{ color: '#f0f6fc', fontWeight: 600, fontSize: 15 }}>
              {name}
              <Tag style={{ marginLeft: 8, fontSize: 11 }} color="processing">{record.version}</Tag>
            </div>
            <div style={{ color: '#8b949e', fontSize: 12 }}>{record.role}</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            icon={config.icon}
            style={{
              background: 'transparent',
              border: `1px solid ${config.color}`,
              color: config.color,
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '当前任务',
      dataIndex: 'currentTask',
      key: 'currentTask',
      render: (task: string, record: Agent) => (
        task ? (
          <div>
            <div style={{ color: '#58a6ff' }}>{task}</div>
            <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>
              <ClockCircleOutlined /> 运行中 - 最近心跳: {record.lastHeartbeat.split(' ')[1]}
            </div>
          </div>
        ) : (
          <span style={{ color: '#8b949e' }}>空闲</span>
        )
      ),
    },
    {
      title: '资源使用',
      key: 'resource',
      width: 200,
      render: (_, record: Agent) => (
        record.status !== 'offline' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#8b949e', width: 40, fontSize: 12 }}>CPU</span>
              <Progress
                percent={record.cpuUsage}
                size="small"
                strokeColor={record.cpuUsage > 70 ? '#f85149' : '#238636'}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#8b949e', width: 40, fontSize: 12 }}>内存</span>
              <Progress
                percent={record.memoryUsage}
                size="small"
                strokeColor={record.memoryUsage > 70 ? '#f85149' : '#58a6ff'}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        ) : (
          <span style={{ color: '#8b949e' }}>-</span>
        )
      ),
    },
    {
      title: '任务统计',
      key: 'tasks',
      width: 180,
      render: (_, record: Agent) => (
        <div>
          <div style={{ color: '#f0f6fc' }}>
            总计: <strong>{record.taskCountTotal}</strong>
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            <span style={{ color: '#3fb950' }}>✓ {record.taskCountSuccess}</span>
            <span style={{ color: '#8b949e', margin: '0 8px' }}>|</span>
            <span style={{ color: '#f85149' }}>✗ {record.taskCountFailed}</span>
            <span style={{ color: '#8b949e', margin: '0 8px' }}>|</span>
            <span style={{ color: '#58a6ff' }}>成功率 {Math.round(record.taskCountSuccess / record.taskCountTotal * 100)}%</span>
          </div>
        </div>
      ),
    },
    {
      title: '运行时间',
      dataIndex: 'uptime',
      key: 'uptime',
      width: 120,
      render: (uptime: string) => (
        <span style={{ color: '#8b949e' }}>{uptime}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: Agent) => {
        const items: MenuProps['items'] = [
          {
            key: '1',
            label: '查看详情',
            icon: <RobotOutlined />,
          },
          {
            key: '2',
            label: '查看日志',
            icon: <MessageOutlined />,
          },
          {
            key: '3',
            label: '配置管理',
            icon: <SettingOutlined />,
          },
          {
            type: 'divider',
          },
          {
            key: '4',
            label: record.status === 'offline' ? '启动代理' : '停止代理',
            icon: record.status === 'offline' ? <PlayCircleOutlined /> : <PauseCircleOutlined />,
            danger: record.status !== 'offline',
          },
        ];

        return (
          <Space size="small">
            <Tooltip title={record.status === 'offline' ? '启动' : '停止'}>
              <Button
                icon={record.status === 'offline' ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                type={record.status === 'offline' ? 'primary' : 'default'}
                size="small"
                danger={record.status !== 'offline'}
              >
                {record.status === 'offline' ? '启动' : '停止'}
              </Button>
            </Tooltip>
            <Dropdown menu={{ items }} placement="bottomRight">
              <Button icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ color: '#f0f6fc', margin: 0 }}>
          <RobotOutlined /> 代理监控
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>刷新</Button>
          <Button type="primary" icon={<SettingOutlined />}>批量操作</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
            <Statistic
              title={<span style={{ color: '#8b949e' }}>在线代理</span>}
              value={onlineCount}
              suffix={`/ ${agents.length}`}
              valueStyle={{ color: '#3fb950' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
            <Statistic
              title={<span style={{ color: '#8b949e' }}>忙碌中</span>}
              value={busyCount}
              valueStyle={{ color: '#d29922' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
            <Statistic
              title={<span style={{ color: '#8b949e' }}>总任务数</span>}
              value={totalTasks}
              valueStyle={{ color: '#58a6ff' }}
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
            <Statistic
              title={<span style={{ color: '#8b949e' }}>成功率</span>}
              value={successRate}
              suffix="%"
              valueStyle={{ color: '#a371f7' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div>
            <span style={{ color: '#f0f6fc' }}>代理列表</span>
            {offlineCount > 0 && (
              <Badge
                count={offlineCount}
                style={{ backgroundColor: '#f85149', marginLeft: 8 }}
              />
            )}
          </div>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d' },
          body: { background: '#161b22', padding: 0 }
        }}
      >
        <Table
          columns={columns}
          dataSource={agents}
          rowKey="id"
          pagination={false}
          rowClassName={(record) => record.status === 'offline' ? styles.offlineRow : ''}
        />
      </Card>

      <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {agents.map(agent => (
          agent.status !== 'offline' && (
            <Card
              key={agent.id}
              size="small"
              style={{
                width: 280,
                background: '#161b22',
                borderColor: agent.status === 'busy' ? '#d29922' : '#30363d',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Badge
                  dot
                  color={getStatusConfig(agent.status).color}
                  offset={[-5, 35]}
                >
                  <Avatar
                    size={48}
                    icon={<RobotOutlined />}
                    style={{
                      background: agent.status === 'online'
                        ? 'linear-gradient(135deg, #238636, #2ea043)'
                        : 'linear-gradient(135deg, #d29922, #f0883e)',
                    }}
                  />
                </Badge>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f0f6fc', fontWeight: 600 }}>{agent.name}</div>
                  <div style={{ color: '#8b949e', fontSize: 12 }}>{agent.currentTask || '空闲'}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {agent.capabilities.map(cap => (
                  <Tag key={cap} size="small" style={{ background: '#21262d', border: 'none', color: '#8b949e' }}>
                    {cap}
                  </Tag>
                ))}
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
};

export default AgentMonitor;