import React from 'react';
import { Card, Button, Tag, Statistic, Row, Col, Timeline } from 'antd';
import { CheckCircleOutlined, WarningOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';

const Detect: React.FC = () => {
  const checkItems = [
    { name: 'Cookie有效性', status: 'success', detail: '有效期3天' },
    { name: '抖音API连通性', status: 'success', detail: '延迟45ms' },
    { name: '快手API连通性', status: 'success', detail: '延迟52ms' },
    { name: '语雀API连通性', status: 'success', detail: '延迟23ms' },
    { name: '代理服务器状态', status: 'success', detail: '3/3在线' },
    { name: '存储空间', status: 'warning', detail: '剩余15%' },
    { name: '数据同步队列', status: 'success', detail: '0条积压' },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="系统健康度"
              value={85.7}
              suffix="%"
              valueStyle={{ color: '#3fb950' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正常项目"
              value={6}
              suffix="/ 7"
              valueStyle={{ color: '#58a6ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="警告项目"
              value={1}
              valueStyle={{ color: '#d29922' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最后检测"
              value="2分钟前"
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="🏥 整体检测"
        extra={
          <Button icon={<ReloadOutlined />}>立即检测</Button>
        }
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
          body: { background: '#161b22' }
        }}
      >
        <Row gutter={[16, 16]}>
          {checkItems.map((item) => (
            <Col span={12} key={item.name}>
              <Card
                size="small"
                style={{
                  background: item.status === 'warning' ? 'rgba(210, 153, 34, 0.1)' : '#0f1419',
                  borderColor: item.status === 'warning' ? '#d29922' : '#30363d'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#f0f6fc', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>{item.detail}</div>
                  </div>
                  <Tag 
                    color={item.status === 'success' ? 'success' : 'warning'}
                    icon={item.status === 'success' ? <CheckCircleOutlined /> : <WarningOutlined />}
                  >
                    {item.status === 'success' ? '正常' : '警告'}
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title="📋 检测历史"
        style={{ marginTop: 16 }}
        extra={<Button icon={<FileTextOutlined />}>导出报告</Button>}
        styles={{
          header: { background: '#161b22', borderBottom: '1px solid #30363d', color: '#f0f6fc' },
          body: { background: '#161b22' }
        }}
      >
        <Timeline
          items={[
            { color: 'green', children: '13:30 自动检测 - 全部正常' },
            { color: 'orange', children: '12:30 自动检测 - 存储空间警告(剩余15%)' },
            { color: 'green', children: '11:30 自动检测 - 全部正常' },
            { color: 'green', children: '10:30 自动检测 - 全部正常' },
          ]}
        />
      </Card>
    </div>
  );
};

export default Detect;