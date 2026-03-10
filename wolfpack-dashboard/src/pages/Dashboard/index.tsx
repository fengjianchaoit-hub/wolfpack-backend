import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Space, Radio, Typography, Tag } from 'antd';
import { ReloadOutlined, ExclamationCircleOutlined, ToolOutlined, GithubOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import KpiCard from '@/components/KpiCard';
import TrendChart from '@/components/TrendChart';
import TaskTable from '@/components/TaskTable';
import AgentDrawer from '@/components/AgentDrawer';
import type { Task, TrendData, Agent } from '@/types';
import styles from './index.module.css';

const { Title, Text } = Typography;

interface Skill {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEVELOPMENT';
  usageCount: number;
}

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // 技能管理数据
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // 获取技能数据
  const fetchSkills = async () => {
    setSkillsLoading(true);
    try {
      const response = await fetch('/api/v1/skills');
      const result = await response.json();
      if (result.code === 200) {
        setSkills(result.data || []);
      }
    } catch (error) {
      console.error('获取技能数据失败:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    // 每30秒刷新一次技能数据
    const timer = setInterval(fetchSkills, 30000);
    return () => clearInterval(timer);
  }, []);

  // 技能统计数据
  const activeSkillsCount = skills.filter(s => s.status === 'ACTIVE').length;
  const devSkillsCount = skills.filter(s => s.status === 'DEVELOPMENT').length;
  const totalUsage = skills.reduce((sum, s) => sum + (s.usageCount || 0), 0);

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

      {/* 技能管理概览卡片 - 新增 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToolOutlined style={{ color: '#58a6ff' }} />
            <span style={{ color: '#f0f6fc' }}>技能管理概览</span>
            <Tag style={{ background: '#238636', color: '#fff', border: 'none' }}>实时</Tag>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/skills')}
          >
            进入技能管理
          </Button>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d' },
          body: { background: '#161b22' },
        }}
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 36, color: '#3fb950', fontWeight: 'bold' }}>
                {skillsLoading ? '-' : activeSkillsCount}
              </div>
              <div style={{ color: '#8b949e', marginTop: 8 }}>生产中技能</div>
              <div style={{ color: '#3fb950', fontSize: 12, marginTop: 4 }}>● 运行正常</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 36, color: '#d29922', fontWeight: 'bold' }}>
                {skillsLoading ? '-' : devSkillsCount}
              </div>
              <div style={{ color: '#8b949e', marginTop: 8 }}>开发中</div>
              <div style={{ color: '#d29922', fontSize: 12, marginTop: 4 }}>⚡ 待上线</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 36, color: '#58a6ff', fontWeight: 'bold' }}>
                {skillsLoading ? '-' : totalUsage.toLocaleString()}
              </div>
              <div style={{ color: '#8b949e', marginTop: 8 }}>总调用次数</div>
              <div style={{ color: '#58a6ff', fontSize: 12, marginTop: 4 }}>📈 累计</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 36, color: '#a371f7', fontWeight: 'bold' }}>
                {skillsLoading ? '-' : skills.length}
              </div>
              <div style={{ color: '#8b949e', marginTop: 8 }}>技能总数</div>
              <Button 
                type="link" 
                size="small"
                icon={<GithubOutlined />}
                onClick={() => window.open('https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/.openclaw/skills', '_blank')}
              >
                查看仓库
              </Button>
            </div>
          </Col>
        </Row>
        
        {/* 快速操作按钮 */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #30363d', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<ToolOutlined />} onClick={() => navigate('/skills')}>
            管理技能
          </Button>
          <Button icon={<GithubOutlined />} onClick={() => window.open('https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/.openclaw/skills', '_blank')}>
            技能仓库
          </Button>
          <Button type="primary" onClick={() => navigate('/skills')}>
            新增技能
          </Button>
        </div>
      </Card>

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
