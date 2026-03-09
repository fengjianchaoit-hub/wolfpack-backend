import React, { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Badge, Table, Tabs } from 'antd';
import * as echarts from 'echarts';
import { 
  DesktopOutlined, 
  DatabaseOutlined, 
  CloudServerOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import styles from './index.module.css';

interface ServerMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
}

interface Container {
  id: string;
  name: string;
  status: 'running' | 'exited' | 'restarting';
  image: string;
  cpu: number;
  memory: number;
  uptime: string;
}

const mockMetrics: ServerMetrics[] = Array.from({ length: 60 }, (_, i) => ({
  timestamp: new Date(Date.now() - (59 - i) * 60000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  cpu: 20 + Math.random() * 30,
  memory: 40 + Math.random() * 20,
  disk: 65 + Math.random() * 5,
  networkIn: Math.random() * 100,
  networkOut: Math.random() * 80,
}));

const mockContainers: Container[] = [
  { id: 'c1', name: 'wolfpack-backend', status: 'running', image: 'wolfpack-backend:latest', cpu: 12, memory: 245, uptime: '45天3小时' },
  { id: 'c2', name: 'wolfpack-postgres', status: 'running', image: 'postgres:15-alpine', cpu: 3, memory: 128, uptime: '45天3小时' },
  { id: 'c3', name: 'wolfpack-nginx', status: 'running', image: 'nginx:alpine', cpu: 1, memory: 67, uptime: '12小时' },
];

const System: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const cpuChartRef = useRef<HTMLDivElement>(null);
  const memoryChartRef = useRef<HTMLDivElement>(null);
  const diskChartRef = useRef<HTMLDivElement>(null);
  const chartInstances = useRef<echarts.ECharts[]>([]);

  useEffect(() => {
    if (activeTab === 'overview') {
      // CPU图表
      if (cpuChartRef.current) {
        const chart = echarts.init(cpuChartRef.current);
        chartInstances.current.push(chart);
        chart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
          xAxis: {
            type: 'category',
            data: mockMetrics.map(m => m.timestamp),
            axisLine: { lineStyle: { color: '#30363d' } },
            axisLabel: { color: '#8b949e', interval: 9 },
          },
          yAxis: {
            type: 'value',
            max: 100,
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#21262d' } },
            axisLabel: { color: '#8b949e', formatter: '{value}%' },
          },
          series: [{
            name: 'CPU',
            type: 'line',
            smooth: true,
            data: mockMetrics.map(m => m.cpu.toFixed(1)),
            lineStyle: { color: '#58a6ff', width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(88, 166, 255, 0.3)' },
                { offset: 1, color: 'rgba(88, 166, 255, 0)' },
              ]),
            },
          }],
        });
      }

      // 内存图表
      if (memoryChartRef.current) {
        const chart = echarts.init(memoryChartRef.current);
        chartInstances.current.push(chart);
        chart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
          xAxis: {
            type: 'category',
            data: mockMetrics.map(m => m.timestamp),
            axisLine: { lineStyle: { color: '#30363d' } },
            axisLabel: { color: '#8b949e', interval: 9 },
          },
          yAxis: {
            type: 'value',
            max: 100,
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#21262d' } },
            axisLabel: { color: '#8b949e', formatter: '{value}%' },
          },
          series: [{
            name: '内存',
            type: 'line',
            smooth: true,
            data: mockMetrics.map(m => m.memory.toFixed(1)),
            lineStyle: { color: '#a371f7', width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(163, 113, 247, 0.3)' },
                { offset: 1, color: 'rgba(163, 113, 247, 0)' },
              ]),
            },
          }],
        });
      }

      // 磁盘图表
      if (diskChartRef.current) {
        const chart = echarts.init(diskChartRef.current);
        chartInstances.current.push(chart);
        chart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
          xAxis: {
            type: 'category',
            data: mockMetrics.map(m => m.timestamp),
            axisLine: { lineStyle: { color: '#30363d' } },
            axisLabel: { color: '#8b949e', interval: 9 },
          },
          yAxis: {
            type: 'value',
            max: 100,
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#21262d' } },
            axisLabel: { color: '#8b949e', formatter: '{value}%' },
          },
          series: [{
            name: '磁盘',
            type: 'line',
            smooth: true,
            data: mockMetrics.map(m => m.disk.toFixed(1)),
            lineStyle: { color: '#238636', width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(35, 134, 54, 0.3)' },
                { offset: 1, color: 'rgba(35, 134, 54, 0)' },
              ]),
            },
          }],
        });
      }
    }

    return () => {
      chartInstances.current.forEach(chart => chart.dispose());
      chartInstances.current = [];
    };
  }, [activeTab]);

  const containerColumns = [
    {
      title: '容器名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ color: '#58a6ff' }}>{name}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          running: { color: 'success', icon: <CheckCircleOutlined /> },
          exited: { color: 'error', icon: <CloseCircleOutlined /> },
          restarting: { color: 'warning', icon: <WarningOutlined /> },
        };
        const { color } = config[status] || config.exited;
        return <Badge status={color as any} text={status} />;
      },
    },
    {
      title: '镜像',
      dataIndex: 'image',
      key: 'image',
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (cpu: number) => `${cpu}%`,
    },
    {
      title: '内存',
      dataIndex: 'memory',
      key: 'memory',
      render: (memory: number) => `${memory}MB`,
    },
    {
      title: '运行时长',
      dataIndex: 'uptime',
      key: 'uptime',
    },
  ];

  return (
    <div className={styles.container}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'overview',
          label: '📊 服务器概览',
          children: (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="CPU 使用率"
                      value={34}
                      suffix="%"
                      valueStyle={{ color: '#58a6ff' }}
                      prefix={<DesktopOutlined />}
                    />
                    <Progress percent={34} strokeColor="#58a6ff" showInfo={false} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="内存使用"
                      value={2.1}
                      suffix="GB / 8GB"
                      valueStyle={{ color: '#a371f7' }}
                      prefix={<DatabaseOutlined />}
                    />
                    <Progress percent={40} strokeColor="#a371f7" showInfo={false} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="磁盘使用"
                      value={45}
                      suffix="GB / 67GB"
                      valueStyle={{ color: '#238636' }}
                      prefix={<CloudServerOutlined />}
                    />
                    <Progress percent={67} strokeColor="#238636" showInfo={false} />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card title="CPU 趋势（近1小时）" className={styles.chartCard}>
                    <div ref={cpuChartRef} style={{ height: 250 }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="内存趋势（近1小时）" className={styles.chartCard}>
                    <div ref={memoryChartRef} style={{ height: 250 }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="磁盘趋势（近1小时）" className={styles.chartCard}>
                    <div ref={diskChartRef} style={{ height: 250 }} />
                  </Card>
                </Col>
              </Row>
            </>
          ),
        },
        {
          key: 'containers',
          label: '🐳 容器管理',
          children: (
            <Card title="运行中的容器">
              <Table
                columns={containerColumns}
                dataSource={mockContainers}
                rowKey="id"
                pagination={false}
              />
            </Card>
          ),
        },
        {
          key: 'network',
          label: '🌐 网络监控',
          children: (
            <Card title="网络流量">
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#8b949e' }}>
                网络监控功能开发中...
              </div>
            </Card>
          ),
        },
      ]} />
    </div>
  );
};

export default System;