import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Card, Statistic, Timeline, Tag, Button, Space, Progress } from 'antd';
import { ReloadOutlined, PauseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import type { Agent, Task } from '@/types';
import styles from './index.module.css';

interface AgentDrawerProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

const mockTasks: Task[] = [
  { id: '1', agentId: 'wolf-tooth-01', agentName: '狼牙01', name: 'AI热点日报', scheduledTime: '2026-03-09T09:00:00', actualStart: '2026-03-09T09:00:00', actualEnd: '2026-03-09T09:04:32', status: 'SUCCESS', priority: 'HIGH', duration: 272000 },
  { id: '2', agentId: 'wolf-tooth-01', agentName: '狼牙01', name: '数据同步', scheduledTime: '2026-03-09T08:00:00', actualStart: '2026-03-09T08:00:00', actualEnd: '2026-03-09T08:02:15', status: 'SUCCESS', priority: 'HIGH', duration: 135000 },
  { id: '3', agentId: 'wolf-tooth-01', agentName: '狼牙01', name: '日志归档', scheduledTime: '2026-03-09T07:00:00', actualStart: '2026-03-09T07:00:00', actualEnd: '2026-03-09T07:00:45', status: 'SUCCESS', priority: 'LOW', duration: 45000 },
  { id: '4', agentId: 'wolf-tooth-01', agentName: '狼牙01', name: '报表生成', scheduledTime: '2026-03-09T06:30:00', status: 'FAILED', priority: 'MEDIUM' },
  { id: '5', agentId: 'wolf-tooth-01', agentName: '狼牙01', name: '健康检查', scheduledTime: '2026-03-09T06:00:00', actualStart: '2026-03-09T06:00:00', actualEnd: '2026-03-09T06:00:12', status: 'SUCCESS', priority: 'HIGH', duration: 12000 },
];

const AgentDrawer: React.FC<AgentDrawerProps> = ({ agent, open, onClose }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (activeTab === 'resource' && chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { data: ['CPU', '内存'], textStyle: { color: '#8b949e' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'],
          axisLine: { lineStyle: { color: '#30363d' } },
          axisLabel: { color: '#8b949e' },
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#21262d' } },
          axisLabel: { color: '#8b949e', formatter: '{value}%' },
        },
        series: [
          {
            name: 'CPU',
            type: 'line',
            smooth: true,
            data: [28, 32, 45, 38, 52, 41, 35, 29, 34],
            lineStyle: { color: '#58a6ff', width: 2 },
            itemStyle: { color: '#58a6ff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(88, 166, 255, 0.3)' },
                { offset: 1, color: 'rgba(88, 166, 255, 0)' },
              ]),
            },
          },
          {
            name: '内存',
            type: 'line',
            smooth: true,
            data: [35, 38, 42, 40, 45, 43, 41, 39, 40],
            lineStyle: { color: '#a371f7', width: 2 },
            itemStyle: { color: '#a371f7' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(163, 113, 247, 0.3)' },
                { offset: 1, color: 'rgba(163, 113, 247, 0)' },
              ]),
            },
          },
        ],
      };

      chartInstance.current.setOption(option);
      
      return () => {
        chartInstance.current?.dispose();
      };
    }
  }, [activeTab]);

  if (!agent) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUCCESS: '#3fb950',
      FAILED: '#f85149',
      RUNNING: '#58a6ff',
      PENDING: '#8b949e',
    };
    return colors[status] || '#8b949e';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      SUCCESS: '✓',
      FAILED: '✗',
      RUNNING: '◐',
      PENDING: '○',
    };
    return icons[status] || '○';
  };

  return (
    <Drawer
      title={
        <div>
          <div style={{ color: '#f0f6fc', fontSize: 18, fontWeight: 600 }}>
            🤖 {agent.name}
          </div>
          <div style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>
            ID: {agent.id} | 角色: {agent.role} | 
            <Tag color={agent.status === 'ONLINE' ? 'success' : 'error'} style={{ marginLeft: 8 }}>
              {agent.status === 'ONLINE' ? '● 在线' : '● 离线'}
            </Tag>
          </div>
        </div>
      }
      placement="right"
      width={700}
      onClose={onClose}
      open={open}
      styles={{
        header: { background: '#161b22', borderBottom: '1px solid #30363d' },
        body: { background: '#0f1419', padding: 0 },
      }}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />}>重启</Button>
          <Button icon={<PauseCircleOutlined />}>暂停</Button>
          <Button type="primary" icon={<SettingOutlined />}>配置</Button>
        </Space>
      }
    >
      <div className={styles.drawerTabs}>
        <div 
          className={`${styles.tab} ${activeTab === 'tasks' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          任务活动
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'resource' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('resource')}
        >
          资源趋势
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'logs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          异常日志
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'config' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('config')}
        >
          配置管理
        </div>
      </div>

      <div className={styles.drawerContent}>
        {activeTab === 'tasks' && (
          <>
            <Card style={{ marginBottom: 16, background: '#161b22', borderColor: '#30363d' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <Statistic title="今日任务" value={5} suffix="个" valueStyle={{ color: '#f0f6fc' }} />
                <Statistic title="成功" value={4} valueStyle={{ color: '#3fb950' }} />
                <Statistic title="失败" value={1} valueStyle={{ color: '#f85149' }} />
                <Statistic title="成功率" value={80} suffix="%" valueStyle={{ color: '#58a6ff' }} />
              </div>
            </Card>

            <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
              <Timeline mode="left">
                {mockTasks.map((task) => (
                  <Timeline.Item
                    key={task.id}
                    color={getStatusColor(task.status)}
                    label={<span style={{ color: '#8b949e' }}>{new Date(task.scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>}
                  >
                    <div style={{ color: '#f0f6fc', fontWeight: 500 }}>{task.name}</div>
                    <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>
                      <span style={{ color: getStatusColor(task.status) }}>
                        {getStatusIcon(task.status)} {task.status === 'SUCCESS' ? '成功' : task.status === 'FAILED' ? '失败' : task.status}
                      </span>
                      {task.duration && (
                        <span style={{ marginLeft: 12 }}>
                          耗时: {Math.round(task.duration / 1000)}秒
                        </span>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </>
        )}

        {activeTab === 'resource' && (
          <>
            <Card style={{ marginBottom: 16, background: '#161b22', borderColor: '#30363d' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>CPU使用率</div>
                  <Progress percent={34} strokeColor="#58a6ff" showInfo={false} />
                  <div style={{ color: '#f0f6fc', marginTop: 4 }}>34% (正常)</div>
                </div>
                <div>
                  <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>内存占用</div>
                  <Progress percent={40} strokeColor="#a371f7" showInfo={false} />
                  <div style={{ color: '#f0f6fc', marginTop: 4 }}>1.6GB / 4GB</div>
                </div>
                <div>
                  <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>磁盘使用</div>
                  <Progress percent={67} strokeColor="#238636" showInfo={false} />
                  <div style={{ color: '#f0f6fc', marginTop: 4 }}>45GB / 67GB</div>
                </div>
              </div>
            </Card>

            <Card title="近6小时资源趋势" style={{ background: '#161b22', borderColor: '#30363d' }}>
              <div ref={chartRef} style={{ height: 300 }} />
            </Card>
          </>
        )}

        {activeTab === 'logs' && (
          <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
            <div style={{ 
              background: '#0f1419', 
              borderRadius: 8, 
              padding: 16, 
              fontFamily: 'monospace', 
              fontSize: 13,
              maxHeight: 500,
              overflow: 'auto'
            }}>
              <div style={{ color: '#f85149' }}>[2026-03-09 06:30:15] ERROR: 报表生成任务失败</div>
              <div style={{ color: '#8b949e', marginLeft: 16 }}>Error: Connection timeout to database (47.84.71.25:3306)</div>
              <div style={{ color: '#8b949e', marginLeft: 16 }}>Stack: at DatabaseConnection.connect (/app/db/connection.js:45:12)</div>
              <div style={{ color: '#3fb950', marginTop: 8 }}>[2026-03-09 06:35:42] INFO: 自动重试机制触发</div>
              <div style={{ color: '#3fb950', marginLeft: 16 }}>Retry attempt 1/3 scheduled in 5 minutes</div>
              <div style={{ color: '#d29922', marginTop: 8 }}>[2026-03-09 06:40:15] WARN: 重试失败，进入指数退避</div>
              <div style={{ color: '#d29922', marginLeft: 16 }}>Next retry: 2026-03-09 06:50:15 (backoff: 10 minutes)</div>
              <div style={{ color: '#3fb950', marginTop: 8 }}>[2026-03-09 07:00:00] INFO: 日志归档任务开始执行</div>
              <div style={{ color: '#3fb950', marginLeft: 16 }}>Archived 1,247 log files (45MB) in 45 seconds</div>
              <div style={{ color: '#3fb950', marginTop: 8 }}>[2026-03-09 08:00:00] INFO: 数据同步任务开始执行</div>
              <div style={{ color: '#3fb950', marginLeft: 16 }}>Synced 15,432 records in 135 seconds</div>
              <div style={{ color: '#3fb950', marginTop: 8 }}>[2026-03-09 09:00:00] INFO: AI热点日报任务开始执行</div>
              <div style={{ color: '#3fb950', marginLeft: 16 }}>Generated report with 47 AI hotspots in 272 seconds</div>
            </div>
          </Card>
        )}

        {activeTab === 'config' && (
          <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>任务并发数</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Progress percent={50} steps={5} size="small" strokeColor="#58a6ff" />
                <span style={{ color: '#f0f6fc' }}>5 / 10</span>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>心跳间隔</div>
              <div style={{ color: '#f0f6fc' }}>30秒</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>重试策略</div>
              <div style={{ color: '#f0f6fc' }}>最大重试3次，指数退避（1s, 2s, 4s）</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>超时阈值</div>
              <div style={{ color: '#f0f6fc' }}>30分钟</div>
            </div>
            <div>
              <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 8 }}>环境变量</div>
              <div style={{ 
                background: '#0f1419', 
                borderRadius: 8, 
                padding: 12, 
                fontFamily: 'monospace', 
                fontSize: 12,
                color: '#c9d1d9'
              }}>
                NODE_ENV=production<br />
                LOG_LEVEL=info<br />
                API_ENDPOINT=http://47.84.71.25/api/v1<br />
                DB_POOL_SIZE=10<br />
                RETRY_MAX_ATTEMPTS=3
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button type="primary">保存配置</Button>
              <Button>重置默认值</Button>
            </div>
          </Card>
        )}
      </div>
    </Drawer>
  );
};

export default AgentDrawer;