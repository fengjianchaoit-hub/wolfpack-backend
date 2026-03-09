import React, { useState } from 'react';
import { Card, Button, Space, Tag, Badge, Table, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface LiveRoom {
  id: string;
  roomId: string;
  platform: string;
  anchorName: string;
  status: 'running' | 'stopped' | 'error';
  lastCrawlTime?: string;
  totalData: number;
  crawlFrequency: number;
}

const mockRooms: LiveRoom[] = [
  { id: '1', roomId: '444502128478', platform: '抖音', anchorName: '水滴保险', status: 'running', lastCrawlTime: '2026-03-09 14:20', totalData: 1247, crawlFrequency: 5 },
  { id: '2', roomId: '8839214567', platform: '抖音', anchorName: '张三带货', status: 'stopped', totalData: 523, crawlFrequency: 10 },
  { id: '3', roomId: '1293847562', platform: '快手', anchorName: '李四直播', status: 'error', lastCrawlTime: '2026-03-09 12:00', totalData: 0, crawlFrequency: 5 },
];

const LiveRoomList: React.FC = () => {
  const [rooms, setRooms] = useState(mockRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<LiveRoom> = [
    {
      title: '直播间ID',
      dataIndex: 'roomId',
      key: 'roomId',
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => (
        <Tag color={platform === '抖音' ? '#000' : platform === '快手' ? '#ff6600' : 'blue'}>
          {platform}
        </Tag>
      ),
    },
    {
      title: '主播名称',
      dataIndex: 'anchorName',
      key: 'anchorName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          running: { color: 'success', text: '监控中' },
          stopped: { color: 'default', text: '已停止' },
          error: { color: 'error', text: '异常' },
        };
        const { color, text } = config[status] || config.stopped;
        return <Badge status={color as any} text={text} />;
      },
    },
    {
      title: '最后抓取',
      dataIndex: 'lastCrawlTime',
      key: 'lastCrawlTime',
      render: (time) => time || '-',
    },
    {
      title: '数据量',
      dataIndex: 'totalData',
      key: 'totalData',
      render: (num) => `${num.toLocaleString()} 条`,
    },
    {
      title: '频率',
      dataIndex: 'crawlFrequency',
      key: 'crawlFrequency',
      render: (freq) => `${freq}分钟`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'running' ? (
            <Button 
              size="small" 
              icon={<PauseCircleOutlined />}
              onClick={() => handleStop(record.id)}
            >
              停止
            </Button>
          ) : (
            <Button 
              size="small" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.id)}
            >
              启动
            </Button>
          )}
          <Button size="small" icon={<EditOutlined />}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleStart = (id: string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status: 'running' as const } : r));
    message.success('已开始监控');
  };

  const handleStop = (id: string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status: 'stopped' as const } : r));
    message.success('已停止监控');
  };

  const handleAdd = (values: any) => {
    console.log(values);
    setIsModalOpen(false);
    message.success('直播间已添加');
  };

  return (
    <div>
      <Card
        title="📺 直播间管理"
        extra={
          <Space>
            <Button icon={<SearchOutlined />}>批量导入</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              新增直播间
            </Button>
          </Space>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
          body: { background: '#161b22' }
        }}
      >
        <Table 
          columns={columns} 
          dataSource={rooms} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增直播间"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="platform" label="平台" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="抖音">抖音</Select.Option>
              <Select.Option value="快手">快手</Select.Option>
              <Select.Option value="视频号">视频号</Select.Option>
              <Select.Option value="淘宝直播">淘宝直播</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="roomId" label="直播间ID" rules={[{ required: true }]}>
            <Input placeholder="请输入直播间ID" />
          </Form.Item>
          <Form.Item name="anchorName" label="主播名称" rules={[{ required: true }]}>
            <Input placeholder="请输入主播名称" />
          </Form.Item>
          <Form.Item name="crawlFrequency" label="抓取频率" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={5}>5分钟</Select.Option>
              <Select.Option value={10}>10分钟</Select.Option>
              <Select.Option value={30}>30分钟</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LiveRoomList;