import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card } from 'antd';
import type { TrendData } from '@/types';

interface TrendChartProps {
  title: string;
  data: TrendData;
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ title, data, height = 250 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#161b22',
        borderColor: '#30363d',
        textStyle: { color: '#c9d1d9' },
      },
      legend: {
        data: ['成功', '失败', '重试'],
        textStyle: { color: '#8b949e' },
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.dates,
        axisLine: { lineStyle: { color: '#30363d' } },
        axisLabel: { color: '#8b949e' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#21262d' } },
        axisLabel: { color: '#8b949e' },
      },
      series: [
        {
          name: '成功',
          type: 'line',
          smooth: true,
          data: data.success,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(35, 134, 54, 0.3)' },
              { offset: 1, color: 'rgba(35, 134, 54, 0)' },
            ]),
          },
          lineStyle: { color: '#238636', width: 2 },
          itemStyle: { color: '#238636' },
        },
        {
          name: '失败',
          type: 'line',
          smooth: true,
          data: data.failed,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(218, 54, 51, 0.3)' },
              { offset: 1, color: 'rgba(218, 54, 51, 0)' },
            ]),
          },
          lineStyle: { color: '#da3633', width: 2 },
          itemStyle: { color: '#da3633' },
        },
        {
          name: '重试',
          type: 'line',
          smooth: true,
          data: data.retry,
          lineStyle: { color: '#d29922', width: 2, type: 'dashed' },
          itemStyle: { color: '#d29922' },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return (
    <Card
      title={title}
      styles={{
        header: { color: '#f0f6fc', borderBottom: '1px solid #30363d' },
        body: { background: '#161b22' },
      }}
    >
      <div ref={chartRef} style={{ height }} />
    </Card>
  );
};

export default TrendChart;