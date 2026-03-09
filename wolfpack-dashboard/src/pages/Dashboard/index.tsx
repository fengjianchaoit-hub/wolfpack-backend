import React, { useState } from 'react';
import { Row, Col, Card, Button, Space, Radio, Typography, Drawer } from 'antd';
import { ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import KpiCard from '@/components/KpiCard';
import TrendChart from '@/components/TrendChart';
import TaskTable from '@/components/TaskTable';
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
  const [, setSelectedTask] = useState<Task | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const kpiData = {
    activeAgents: { value: 3, total: 3, trend: 100, subtitle: '全部代理在线运行中' },
    todayTasks: { value: 3, total: 3, trend: 100, subtitle: '09:00/10:00/11:00已完成' },
    successRate: { value: 100, suffix: '%', trend: 94.6, trendLabel: '近7天平均', subtitle: '成功率保持稳定' },
    systemHealth: { value: 87.5, suffix: '%', trend: -2, subtitle: '狼牙02备份超时', status: 'warning' as const },
  };

  const handleViewDetail = (task: Task) => {
    setSelectedTask(task);
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
            onClick={() => setDrawerOpen(true)}
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

      <Drawer
        title={
          <div>
            <div style={{ color: '#f0f6fc', fontSize: 18, fontWeight: 600 }}>
              🤖 {selectedAgent?.name || '代理详情'}
            </div>
            <div style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>
              ID: {selectedAgent?.id} | 状态: 在线
            </div>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d' },
          body: { background: '#0f1419' },
        }}
      >
        <div className={styles.drawerTabs}>
          <div className={`${styles.tab} ${styles.activeTab}`}>任务活动</div>
          <div className={styles.tab}>资源趋势</div>
          <div className={styles.tab}>异常日志</div>
          <div className={styles.tab}>配置管理</div>
        </div>
        
        <div className={styles.drawerContent}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>今日任务</span>
            <span className={styles.infoValue}>4个（成功3个，失败1个已重试）</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>当前任务</span>
            <span className={styles.infoValue} style={{ color: '#58a6ff' }}>AI热点日报生成中... (75%)</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>CPU使用率</span>
            <span className={styles.infoValue}>34% (正常)</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>内存占用</span>
            <span className={styles.infoValue}>1.2GB / 4GB</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>最后心跳</span>
            <span className={styles.infoValue}>2秒前</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>运行时长</span>
            <span className={styles.infoValue}>45天3小时12分</span>
          </div>
          
          <hr style={{ borderColor: '#30363d', margin: '20px 0' }} />
          
          <div style={{ fontSize: 14, color: '#8b949e', marginBottom: 12 }}>近5次任务执行</div>
          <div style={{ background: '#161b22', borderRadius: 8, padding: 12, fontSize: 13, fontFamily: 'monospace' }}>
            <div style={{ color: '#3fb950' }}>✓ 09:00 AI热点日报 (4分32秒)</div>
            <div style={{ color: '#3fb950', marginTop: 4 }}>✓ 08:00 数据同步 (2分15秒)</div>
            <div style={{ color: '#3fb950', marginTop: 4 }}>✓ 07:00 日志归档 (45秒)</div>
            <div style={{ color: '#f85149', marginTop: 4 }}>✗ 06:30 报表生成 (失败-已重试)</div>
            <div style={{ color: '#3fb950', marginTop: 4 }}>✓ 06:00 健康检查 (12秒)</div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Dashboard;