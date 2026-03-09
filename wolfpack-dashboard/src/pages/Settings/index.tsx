import React, { useState, useEffect } from 'react';
import { Card, Switch, Button, message, Typography, List, Tag } from 'antd';
import { 
  MoonOutlined, 
  SunOutlined,
  SaveOutlined,
  ClearOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [autoTheme, setAutoTheme] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初始化时读取本地存储的主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('wolfpack-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    
    // 检查系统主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      // 系统偏好浅色，但默认保持深色
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setDarkMode(checked);
    
    // 应用主题
    if (checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('wolfpack-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('wolfpack-theme', 'light');
    }
    
    message.success(checked ? '已切换到深色模式' : '已切换到浅色模式');
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('设置已保存');
    }, 1000);
  };

  const handleClearCache = () => {
    localStorage.clear();
    message.success('缓存已清除，页面即将刷新');
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <Title level={4} style={{ color: '#f0f6fc', marginBottom: 24 }}>⚙️ 系统设置</Title>

      <Card title="🎨 外观设置" style={{ marginBottom: 16, background: '#161b22', borderColor: '#30363d' }}>
        <List>
          <List.Item
            style={{ borderBottom: '1px solid #30363d', padding: '16px 0' }}
            actions={[
              <Switch
                checked={darkMode}
                onChange={handleThemeChange}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
            ]}
          >
            <List.Item.Meta
              title={<span style={{ color: '#f0f6fc' }}>深色模式</span>}
              description={<span style={{ color: '#8b949e' }}>切换界面的明暗主题</span>}
            />
          </List.Item>

          <List.Item
            style={{ borderBottom: '1px solid #30363d', padding: '16px 0' }}
            actions={[
              <Switch checked={autoTheme} onChange={setAutoTheme} disabled />
            ]}
          >
            <List.Item.Meta
              title={<span style={{ color: '#f0f6fc' }}>自动跟随系统</span>}
              description={<span style={{ color: '#8b949e' }}>根据系统设置自动切换主题（开发中）</span>}
            />
          </List.Item>

          <List.Item
            style={{ padding: '16px 0' }}
            actions={[
              <Switch checked={compactMode} onChange={setCompactMode} />
            ]}
          >
            <List.Item.Meta
              title={<span style={{ color: '#f0f6fc' }}>紧凑模式</span>}
              description={<span style={{ color: '#8b949e' }}>减小组件间距，显示更多内容</span>}
            />
          </List.Item>
        </List>
      </Card>

      <Card title="🔔 通知设置" style={{ marginBottom: 16, background: '#161b22', borderColor: '#30363d' }}>
        <List>
          <List.Item
            style={{ borderBottom: '1px solid #30363d', padding: '16px 0' }}
            actions={[<Switch defaultChecked />]}
          >
            <List.Item.Meta
              title={<span style={{ color: '#f0f6fc' }}>桌面通知</span>}
              description={<span style={{ color: '#8b949e' }}>任务完成或异常时发送浏览器通知</span>}
            />
          </List.Item>

          <List.Item
            style={{ padding: '16px 0' }}
            actions={[<Switch defaultChecked />]}
          >
            <List.Item.Meta
              title={<span style={{ color: '#f0f6fc' }}>声音提醒</span>}
              description={<span style={{ color: '#8b949e' }}>重要告警时播放提示音</span>}
            />
          </List.Item>
        </List>
      </Card>

      <Card title="📊 数据设置" style={{ marginBottom: 16, background: '#161b22', borderColor: '#30363d' }}>
        <List>
          <List.Item
            style={{ borderBottom: '1px solid #30363d', padding: '16px 0' }}
            actions={[<Tag color="blue">30秒</Tag>]}
          >
            <List.Item.Meta
              title={<span style={{ color: '#f0f6fc' }}>自动刷新间隔</span>}
              description={<span style={{ color: '#8b949e' }}>仪表盘数据自动刷新频率</span>}
            />
          </List.Item>

          <List.Item
            style={{ padding: '16px 0' }}
            actions={[
              <Button icon={<ClearOutlined />} danger size="small" onClick={handleClearCache}>
                清除缓存
              </Button>
            ]}
          >
            <List.Item.Meta
              title={<span style={{ color: '#f0f6fc' }}>本地缓存</span>}
              description={<span style={{ color: '#8b949e' }}>清除浏览器本地存储的数据</span>}
            />
          </List.Item>
        </List>
      </Card>

      <Card title="ℹ️ 关于" style={{ background: '#161b22', borderColor: '#30363d' }}>
        <div style={{ color: '#8b949e' }}>
          <p><strong style={{ color: '#f0f6fc' }}>狼牙团队监控仪表盘</strong></p>
          <p>版本: V2.0</p>
          <p>技术栈: React 18 + TypeScript + Ant Design 5 + ECharts 5</p>
          <p>构建时间: 2026-03-09</p>
          <p><a href="https://github.com/fengjianchaoit-hub/wolfpack-backend" target="_blank" rel="noopener noreferrer" style={{ color: '#58a6ff' }}>GitHub 仓库</a></p>
        </div>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          size="large" 
          onClick={handleSave}
          loading={loading}
        >
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default Settings;