import React from 'react';
import { Card, Switch, Button, Space, Tag, Table, Progress, Statistic, Row, Col } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface CrawlTask {
  id: string;
  roomId: string;
  anchorName: string;
  status: 'running' | 'stopped' | 'paused';
  startTime?: string;
  duration?: string;
  dataCount: number;
  progress: number;
}

const mockTasks: CrawlTask[] = [
  { id: '1', roomId: '444502128478', anchorName: '水滴保险', status: 'running', startTime: '14:00', duration: '25分钟', dataCount: 247, progress: 75 },
  { id: '2', roomId: '8839214567', anchorName: '张三带货', status: 'paused', dataCount: 523, progress: 0 },
];

const LiveTaskControl: React.FC = () => {
  const columns: ColumnsType<CrawlTask> = [
    {
      title: '直播间ID',
      dataIndex: 'roomId',
      key: 'roomId',
    },
    {
      title: '主播',
      dataIndex: 'anchorName',
      key: 'anchorName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = { running: 'processing', paused: 'warning', stopped: 'default' };
        const texts: Record<string, string> = { running: '运行中', paused: '已暂停', stopped: '已停止' };
        return <Tag color={colors[status] || 'default'}>{texts[status] || status}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => time || '-',
    },
    {
      title: '运行时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (time) => time || '-',
    },
    {
      title: '已抓数据',
      dataIndex: 'dataCount',
      key: 'dataCount',
      render: (num) => `${num} 条`,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (p) => <Progress percent={p} size="small" />,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status !== 'running' ? (
            <Button size="small" type="primary" icon={<PlayCircleOutlined />}>启动</Button>
          ) : (
            <Button size="small" icon={<PauseCircleOutlined />}>暂停</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <div style={{ color: '#8b949e', marginBottom: 8 }}>自动抓取总开关</div>
            <Switch checked={true} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="运行中任务" value={1} suffix="/ 3" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="今日抓取数据" value={12470} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card
        title="📡 抓取任务控制"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button type="primary">🚀 批量启动</Button>
            <Button danger>⏹️ 批量停止</Button>
          </Space>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
          body: { background: '#161b22' }
        }}
      >
        <Table columns={columns} dataSource={mockTasks} rowKey="id" />
      </Card>
    </div>
  );
};

export default LiveTaskControl;