import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0f1419'
    }}>
      <Result
        status="404"
        title={<span style={{ color: '#f0f6fc', fontSize: 72, fontWeight: 700 }}>404</span>}
        subTitle={
          <span style={{ color: '#8b949e', fontSize: 18 }}>抱歉，您访问的页面不存在</span>}
        extra={
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              style={{ 
                background: '#238636', 
                borderColor: '#238636',
                height: 40,
                padding: '0 24px'
              }}
            >
              返回首页
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ 
                background: '#21262d', 
                borderColor: '#30363d',
                color: '#c9d1d9',
                height: 40,
                padding: '0 24px'
              }}
            >
              返回上一页
            </Button>
          </div>
        }
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 12,
          padding: '48px 64px'
        }}
      >
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <div style={{ color: '#58a6ff', fontSize: 64, marginBottom: 16 }}>🐺</div>
          <div style={{ color: '#8b949e', fontSize: 14 }}>
            狼牙团队监控仪表盘 · Wolfpack Dashboard
          </div>
        </div>
      </Result>
    </div>
  );
};

export default NotFound;