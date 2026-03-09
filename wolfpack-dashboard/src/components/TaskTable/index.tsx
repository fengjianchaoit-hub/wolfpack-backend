import React from 'react';
import { Table, Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Task } from '@/types';

interface TaskTableProps {
  data: Task[];
  loading?: boolean;
  onViewDetail?: (task: Task) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ data, loading, onViewDetail }) => {
  const columns: ColumnsType<Task> = [
    {
      title: '时间',
      dataIndex: 'scheduledTime',
      key: 'time',
      render: (time) => new Date(time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
    {
      title: '代理',
      dataIndex: 'agentName',
      key: 'agent',
      render: (name, record) => (
        <Tag color={getAgentColor(record.agentId)} style={{ borderRadius: 20 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#fff', marginRight: 6 }} />
          {name}
        </Tag>
      ),
    },
    {
      title: '任务',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const color = priority === 'HIGH' ? '#f85149' : priority === 'MEDIUM' ? '#d29922' : '#8b949e';
        return <span style={{ color, fontSize: 12 }}>● {priority}</span>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; text: string; icon: string }> = {
          SUCCESS: { color: 'success', text: '成功', icon: '✓' },
          RUNNING: { color: 'processing', text: '运行中', icon: '◐' },
          FAILED: { color: 'error', text: '失败', icon: '✗' },
          TIMEOUT: { color: 'warning', text: '超时', icon: '⏱' },
          PENDING: { color: 'default', text: '待执行', icon: '○' },
        };
        const { color, text, icon } = config[status] || config.PENDING;
        return <Tag color={color}>{icon} {text}</Tag>;
      },
    },
    {
      title: '耗时',
      key: 'duration',
      render: (_, record) => {
        if (!record.duration) return '-';
        const seconds = Math.round(record.duration / 1000);
        return seconds < 60 ? `${seconds}秒` : `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => onViewDetail?.(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  const getAgentColor = (agentId: string) => {
    if (agentId.includes('01')) return 'green';
    if (agentId.includes('02')) return 'blue';
    if (agentId.includes('03')) return 'purple';
    return 'default';
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 5, size: 'small' }}
      style={{
        background: '#161b22',
        borderRadius: 8,
      }}
    />
  );
};

export default TaskTable;