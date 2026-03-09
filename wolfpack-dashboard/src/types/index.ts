// 通用API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 任务类型
export interface Task {
  id: string;
  agentId: string;
  agentName: string;
  name: string;
  scheduledTime: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  duration?: number; // 毫秒
  errorMessage?: string;
}

// 代理类型
export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'ERROR';
  lastHeartbeat: string;
  taskCountTotal: number;
  taskCountSuccess: number;
  taskCountFailed: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

// 系统指标
export interface SystemMetrics {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  diskPercent: number;
  networkLatencyMs: number;
}

// KPI数据
export interface KpiData {
  activeAgents: number;
  totalAgents: number;
  todayTasks: number;
  todayTotalTasks: number;
  successRate: number;
  systemHealth: number;
  trendUp: boolean;
  trendValue: number;
}

// 趋势数据
export interface TrendData {
  dates: string[];
  success: number[];
  failed: number[];
  retry: number[];
}

// 告警
export interface Alert {
  id: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  taskId?: string;
  agentId?: string;
  status: 'NEW' | 'ACKED' | 'RESOLVED';
  createdAt: string;
}

// 直播间
export interface LiveRoom {
  id: string;
  roomId: string;
  platform: 'douyin' | 'kuaishou' | 'shipinhao' | 'taobao';
  roomName: string;
  anchorName: string;
  crawlFrequency: number; // 分钟
  status: 0 | 1; // 0-禁用 1-启用
  createdAt: string;
}

// 抓取任务
export interface CrawlTask {
  id: string;
  roomId: string;
  roomName: string;
  taskStatus: 0 | 1 | 2; // 0-停止 1-手动 2-自动
  crawlFrequency: number;
  lastCrawlTime?: string;
  crawlCount: number;
  errorMsg?: string;
}

// 直播数据
export interface LiveData {
  id: string;
  roomId: string;
  dataType: 'danmu' | 'gift' | 'online' | 'user';
  content: Record<string, any>;
  rawData: Record<string, any>;
  createdAt: string;
}

// 导航菜单项
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path: string;
  children?: MenuItem[];
}