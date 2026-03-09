import React, { useState } from 'react';
import {
  DashboardOutlined,
  RobotOutlined,
  FileTextOutlined,
  DesktopOutlined,
  ScheduleOutlined,
  SettingOutlined,
  VideoCameraOutlined,
  BellOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Badge, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/agents',
    icon: <RobotOutlined />,
    label: '代理管理',
    children: [
      { key: '/agents', label: '代理监控' },
      { key: '/agents/config', label: '代理配置' },
    ],
  },
  {
    key: '/live',
    icon: <VideoCameraOutlined />,
    label: '数据抓取',
    children: [
      { key: '/live/rooms', label: '直播间管理' },
      { key: '/live/tasks', label: '抓取任务' },
      { key: '/live/data', label: '数据查询' },
      { key: '/live/detect', label: '整体检测' },
    ],
  },
  {
    key: '/files',
    icon: <FileTextOutlined />,
    label: '配置中心',
    children: [
      { key: '/files', label: 'Claw文件' },
      { key: '/files/config', label: '配置文件' },
      { key: '/files/logs', label: '操作日志' },
    ],
  },
  {
    key: '/system',
    icon: <DesktopOutlined />,
    label: '资源管理',
    children: [
      { key: '/system', label: '服务器监控' },
      { key: '/system/containers', label: '容器管理' },
    ],
  },
  {
    key: '/schedule',
    icon: <ScheduleOutlined />,
    label: '任务调度',
  },
  {
    key: '/alerts',
    icon: <BellOutlined />,
    label: '告警中心',
  },
  {
    key: '/skills',
    icon: <ToolOutlined />,
    label: '技能管理',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed] = useState(false);
  
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const onMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🐺
          </div>
          <span style={{ color: '#58a6ff', fontSize: 18, fontWeight: 600 }}>
            狼牙团队监控仪表盘
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Badge count={2} size="small">
            <BellOutlined style={{ color: '#8b949e', fontSize: 18, cursor: 'pointer' }} />
          </Badge>
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #58a6ff, #a371f7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            总
          </div>
        </div>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
          style={{
            background: '#161b22',
            borderRight: '1px solid #30363d',
          }}
          width={240}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['/agents', '/live', '/files', '/system']}
            items={menuItems as any}
            onClick={onMenuClick}
            style={{
              background: '#161b22',
              borderRight: 'none',
            }}
          />
        </Sider>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#0f1419',
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;