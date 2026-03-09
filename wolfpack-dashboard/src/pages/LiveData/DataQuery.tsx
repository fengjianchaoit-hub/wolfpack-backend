import React from 'react';
import { Card, Input, Select, DatePicker, Button, Table, Tag, Space } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface LiveData {
  id: string;
  time: string;
  roomId: string;
  anchorName: string;
  dataType: string;
  content: string;
}

const mockData: LiveData[] = [
  { id: '1', time: '14:32:15', roomId: '444502128478', anchorName: '水滴保险', dataType: '弹幕', content: '这个保险适合老年人吗？' },
  { id: '2', time: '14:30:42', roomId: '444502128478', anchorName: '水滴保险', dataType: '礼物', content: '用户A 赠送 火箭 x10' },
  { id: '3', time: '14:28:03', roomId: '444502128478', anchorName: '水滴保险', dataType: '在线人数', content: '12,847 人' },
  { id: '4', time: '14:25:18', roomId: '444502128478', anchorName: '水滴保险', dataType: '弹幕', content: '怎么购买？' },
  { id: '5', time: '14:22:55', roomId: '444502128478', anchorName: '水滴保险', dataType: '弹幕', content: '主播讲解一下理赔流程' },
];

const DataQuery: React.FC = () => {
  const columns: ColumnsType<LiveData> = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 100 },
    { title: '直播间ID', dataIndex: 'roomId', key: 'roomId' },
    { title: '主播', dataIndex: 'anchorName', key: 'anchorName' },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (type) => {
        const colors: Record<string, string> = { 弹幕: 'blue', 礼物: 'gold', 在线人数: 'green', 用户进入: 'purple' };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      },
    },
    { title: '内容摘要', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      render: () => <Button type="link" size="small">查看详情</Button>,
    },
  ];

  return (
    <div>
      <Card
        title="🔍 直播数据查询"
        extra={<Button icon={<DownloadOutlined />}>导出数据</Button>}
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
          body: { background: '#161b22' }
        }}
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Select defaultValue="all" style={{ width: 120 }} placeholder="直播间">
            <Select.Option value="all">全部直播间</Select.Option>
            <Select.Option value="444502128478">水滴保险</Select.Option>
            <Select.Option value="8839214567">张三带货</Select.Option>
          </Select>
          
          <Select defaultValue="all" style={{ width: 120 }} placeholder="数据类型">
            <Select.Option value="all">全部类型</Select.Option>
            <Select.Option value="danmu">弹幕</Select.Option>
            <Select.Option value="gift">礼物</Select.Option>
            <Select.Option value="online">在线人数</Select.Option>
          </Select>
          
          <RangePicker />
          
          <Input.Search placeholder="关键词搜索" style={{ width: 200 }} enterButton={<SearchOutlined />} />
        </Space>

        <Table columns={columns} dataSource={mockData} rowKey="id" />
      </Card>
    </div>
  );
};

export default DataQuery;