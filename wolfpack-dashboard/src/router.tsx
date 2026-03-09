import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'agents', element: <div style={{ color: '#fff' }}>代理监控（开发中）</div> },
      { path: 'agents/config', element: <div style={{ color: '#fff' }}>代理配置（开发中）</div> },
      { path: 'live/rooms', element: <div style={{ color: '#fff' }}>直播间管理（开发中）</div> },
      { path: 'live/tasks', element: <div style={{ color: '#fff' }}>抓取任务（开发中）</div> },
      { path: 'live/data', element: <div style={{ color: '#fff' }}>数据查询（开发中）</div> },
      { path: 'live/detect', element: <div style={{ color: '#fff' }}>整体检测（开发中）</div> },
      { path: 'files', element: <div style={{ color: '#fff' }}>SOUL文件（开发中）</div> },
      { path: 'files/config', element: <div style={{ color: '#fff' }}>配置文件（开发中）</div> },
      { path: 'files/logs', element: <div style={{ color: '#fff' }}>操作日志（开发中）</div> },
      { path: 'system', element: <div style={{ color: '#fff' }}>服务器监控（开发中）</div> },
      { path: 'system/containers', element: <div style={{ color: '#fff' }}>容器管理（开发中）</div> },
      { path: 'schedule', element: <div style={{ color: '#fff' }}>任务调度（开发中）</div> },
      { path: 'settings', element: <div style={{ color: '#fff' }}>系统设置（开发中）</div> },
    ],
  },
]);

export default router;