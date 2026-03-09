import React from 'react';
import { Card, Statistic, Badge } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styles from './index.module.css';

interface KpiCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  status?: 'success' | 'warning' | 'error' | 'normal';
  subtitle?: string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  suffix,
  trend,
  trendLabel,
  status = 'normal',
  subtitle,
  onClick,
}) => {
  return (
    <Card
      className={styles.kpiCard}
      onClick={onClick}
      hoverable
      styles={{
        body: {
          background: '#161b22',
          border: `1px solid ${status === 'error' ? '#da3633' : '#30363d'}`,
          borderRadius: 12,
        },
      }}
    >
      <div className={styles.header}>
        <span className={styles.label}>{title}</span>
        <Badge
          status={status === 'success' ? 'success' : status === 'error' ? 'error' : 'processing'}
          className={styles.statusDot}
        />
      </div>
      
      <div className={styles.valueWrapper}>
        <Statistic
          value={value}
          suffix={suffix}
          valueStyle={{
            color: '#f0f6fc',
            fontSize: 32,
            fontWeight: 700,
          }}
        />
        {trend !== undefined && (
          <span
            className={styles.trend}
            style={{ color: trend >= 0 ? '#3fb950' : '#da3633' }}
          >
            {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(trend)}%
            {trendLabel && <span className={styles.trendLabel}>{trendLabel}</span>}
          </span>
        )}
      </div>
      
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </Card>
  );
};

export default KpiCard;