import React, { useState } from 'react';
import { Row, Col, Card, Button, Space, Radio, Typography } from 'antd';
import { ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import KpiCard from '@/components/KpiCard';
import TrendChart from '@/components/TrendChart';
import TaskTable from '@/components/TaskTable';
import AgentDrawer from '@/components/AgentDrawer';
import type { Task, TrendData, Agent } from '@/types';
import styles from './index.module.css';

const { Title, Text } = Typography;

// 模拟数据
const mockTasks: Task[] = [
  { id: '1', agentId: 'wolf-tooth-01', agentName: '狼牙01', name: 'AI热点日报', scheduledTime: '2026-03-09T09:00:00', actualStart: '2026-03-09T09:00:00', actualEnd: '2026-03-09T09:04:32', status: 'SUCCESS', priority: 'HIGH', duration: 272000 },
  { id: '2', agentId: 'wolf-tooth-02', agentName: '狼牙02', name: '数据分析', scheduledTime: '2026-03-09T10:00:00', actualStart: '2026-03-09T10:00:00', actualEnd: '2026-03-09T10:12:18', status: 'SUCCESS', priority: 'HIGH', duration: 738000 },
  { id: '3', agentId: 'wolf-tooth-03', agentName: '狼牙03', name: '数据看板', scheduledTime: '2026-03-09T11:00:00', actualStart: '2026-03-09T11:00:00', actualEnd: '2026-03-09T11:06:45', status: 'SUCCESS', priority: 'MEDIUM', duration: 405000 },
  { id: '4', agentId: 'wolf-tooth-02', agentName: '狼牙02', name: '备份校验', scheduledTime: '2026-03-09T10:30:00', status: 'TIMEOUT', priority: 'LOW' },
];

const mockTrendData: TrendData = {
  dates: ['03-03', '03-04', '03-05', '03-06', '03-07', '03-08', '03-09'],
  success: [28, 30, 27, 32, 29, 31, 3],
  failed: [2, 1, 3, 0, 1, 0, 0],
  retry: [1, 0, 2, 0, 1, 0, 0],
};

const mockAgent: Agent = {
  id: 'wolf-tooth-01',
  name: '狼牙01',
  role: 'AI热点日报',
  status: 'ONLINE',
  lastHeartbeat: '2026-03-09T12:06:00',
  taskCountTotal: 156,
  taskCountSuccess: 149,
  taskCountFailed: 7,
  cpuUsage: 34,
  memoryUsage: 28,
};

const Dashboard: React.FC = () => {
  const [loading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const kpiData = {
    activeAgents: { value: 3, total: 3, trend: 100, subtitle: '全部代理在线运行中' },
    todayTasks: { value: 3, total: 3, trend: 100, subtitle: '09:00/10:00/11:00已完成' },
    successRate: { value: 100, suffix: '%', trend: 94.6, trendLabel: '近7天平均', subtitle: '成功率保持稳定' },
    systemHealth: { value: 87.5, suffix: '%', trend: -2, subtitle: '狼牙02备份超时', status: 'warning' as const },
  };

  const handleViewDetail = (_task: Task) => {
    setSelectedAgent(mockAgent);
    setDrawerOpen(true);
  };

  const handleKpiClick = () => {
    setSelectedAgent(mockAgent);
    setDrawerOpen(true);
  };

  const filteredTasks = filter === 'abnormal' 
    ? mockTasks.filter(t => t.status === 'FAILED' || t.status === 'TIMEOUT')
    : mockTasks;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={3} style={{ color: '#f0f6fc', margin: 0 }}>仪表盘概览</Title>
          <Text type="secondary">实时监控狼牙团队任务执行状态与系统健康度</Text>
        </div>
        <Space>
          <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)}>
            <Radio.Button value="abnormal" className={filter === 'abnormal' ? styles.abnormalBtn : ''}>
              <ExclamationCircleOutlined /> 仅看异常
            </Radio.Button>
            <Radio.Button value="all">全部</Radio.Button>
          </Radio.Group>
          <Button icon={<ReloadOutlined />}>30s自动刷新</Button>
        </Space>
      </div>

      <Row gutter={[20, 20]} className={styles.kpiRow}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="活跃代理"
            value={kpiData.activeAgents.value}
            suffix={`/ ${kpiData.activeAgents.total}`}
            trend={kpiData.activeAgents.trend}
            subtitle={kpiData.activeAgents.subtitle}
            status="success"
            onClick={handleKpiClick}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="今日任务"
            value={kpiData.todayTasks.value}
            suffix={`/ ${kpiData.todayTasks.total}`}
            trend={kpiData.todayTasks.trend}
            subtitle={kpiData.todayTasks.subtitle}
            status="success"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="任务成功率"
            value={kpiData.successRate.value}
            suffix={kpiData.successRate.suffix}
            trend={kpiData.successRate.trend}
            trendLabel={kpiData.successRate.trendLabel}
            subtitle={kpiData.successRate.subtitle}
            status="success"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="系统健康度"
            value={kpiData.systemHealth.value}
            suffix={kpiData.systemHealth.suffix}
            trend={kpiData.systemHealth.trend}
            subtitle={kpiData.systemHealth.subtitle}
            status={kpiData.systemHealth.status}
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]} className={styles.chartRow}>
        <Col xs={24} lg={16}>
          <TrendChart title="📈 任务执行趋势（近7天）" data={mockTrendData} />
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="🥧 代理任务分布"
            styles={{
              header: { color: '#f0f6fc', borderBottom: '1px solid #30363d' },
              body: { background: '#161b22', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
          >
            <div style={{ textAlign: 'center', color: '#8b949e' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🍩</div>
              <div>狼牙01: 40%</div>
              <div>狼牙02: 35%</div>
              <div>狼牙03: 25%</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="📋 今日任务执行记录"
        extra={<Button type="link">查看全部 →</Button>}
        styles={{
          header: { color: '#f0f6fc', borderBottom: '1px solid #30363d' },
          body: { background: '#161b22' },
        }}
      >
        <TaskTable data={filteredTasks} loading={loading} onViewDetail={handleViewDetail} />
      </Card>

      <AgentDrawer 
        agent={selectedAgent}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default Dashboard;