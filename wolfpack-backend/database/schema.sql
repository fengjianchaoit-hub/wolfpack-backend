-- 狼牙团队监控系统数据库设计
-- 创建时间: 2026-03-07

-- 代理表 (Agents)
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    role VARCHAR(100) NOT NULL,
    is_leader BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ONLINE', -- ONLINE, BUSY, OFFLINE, ERROR
    status_text VARCHAR(200),
    last_active_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 任务表 (Tasks)
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    assignee_id VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    scheduled_time VARCHAR(50), -- 如 "09:00" 或 "每4小时"
    cron_expression VARCHAR(100), -- 如果是定时任务
    is_cron_job BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES agents(id)
);

-- 执行日志表 (Execution Logs)
CREATE TABLE execution_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50),
    action VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'success', -- success, failed
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 系统指标表 (System Metrics) - 可选，用于历史趋势
CREATE TABLE system_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cpu_usage DOUBLE,
    memory_usage DOUBLE,
    memory_total BIGINT,
    memory_used BIGINT,
    disk_usage DOUBLE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化数据
INSERT INTO agents (id, name, emoji, role, is_leader, status, status_text) VALUES
('wolf-head', '狼头', '🔥', '团队负责人', TRUE, 'ONLINE', '在线 - 统筹管理中'),
('wolf-tooth-01', '狼牙01', '📝', '文案编辑', FALSE, 'ONLINE', '待命 - 等待任务'),
('wolf-tooth-02', '狼牙02', '📊', '数据分析', FALSE, 'ONLINE', '待命 - 等待任务'),
('wolf-tooth-03', '狼牙03', '📈', '可视化', FALSE, 'ONLINE', '待命 - 等待任务');

-- 初始化任务
INSERT INTO tasks (id, title, assignee_id, priority, status, scheduled_time, is_cron_job, description) VALUES
('task-001', 'AI热点日报生成', 'wolf-tooth-01', 'HIGH', 'COMPLETED', '09:00', FALSE, '生成AI热点日报'),
('task-002', '抖音直播数据检查', 'wolf-tooth-02', 'HIGH', 'COMPLETED', '10:00', FALSE, '检查抖音直播数据'),
('task-003', '仪表盘部署上线', 'wolf-head', 'HIGH', 'COMPLETED', '14:00', FALSE, '完成仪表盘部署'),
('task-004', '生成AI热点日报', 'wolf-tooth-01', 'HIGH', 'PENDING', '09:00', FALSE, '明日日报任务'),
('task-005', '分析昨日直播数据', 'wolf-tooth-02', 'HIGH', 'PENDING', '10:00', FALSE, '含行为洞察'),
('task-006', '生成数据看板', 'wolf-tooth-03', 'MEDIUM', 'PENDING', '11:00', FALSE, '含视觉重点'),
('cron-memory-digest', '记忆归档检查 - 自动总结入库', 'wolf-head', 'HIGH', 'IN_PROGRESS', '每4小时', TRUE, '自动检查并归档核心意见');

-- 初始化日志
INSERT INTO execution_logs (agent_id, action, status) VALUES
('wolf-head', '创建狼牙03', 'success'),
('wolf-head', '仪表盘前端部署', 'success'),
('wolf-tooth-02', '抖音直播数据检查完成', 'success'),
('wolf-tooth-01', 'AI热点日报生成完成', 'success');
