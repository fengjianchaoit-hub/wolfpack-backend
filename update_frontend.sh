#!/bin/bash
# 直接在服务器更新前端为完整版

echo "更新前端代码..."

cd /opt/wolfpack-dashboard/html

sudo tee index.html > /dev/null << 'HTMLEOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <title>狼牙团队监控仪表盘 | WolfPack Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%); color: #e6edf3; min-height: 100vh; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #30363d; }
        .header h1 { font-size: 28px; background: linear-gradient(90deg, #58a6ff, #238636); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .card { background: rgba(22, 27, 34, 0.8); border: 1px solid #30363d; border-radius: 12px; padding: 20px; }
        .card h3 { font-size: 14px; color: #8b949e; margin-bottom: 15px; text-transform: uppercase; }
        .metric { display: flex; align-items: baseline; gap: 10px; }
        .metric-value { font-size: 36px; font-weight: 700; color: #58a6ff; }
        .status-online { color: #238636; }
        .status-busy { color: #d29922; }
        .agent-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
        .agent-card { background: rgba(48, 54, 61, 0.5); border-radius: 8px; padding: 15px; text-align: center; transition: transform 0.2s; }
        .agent-card:hover { transform: translateY(-2px); background: rgba(48, 54, 61, 0.8); }
        .agent-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #58a6ff, #238636); display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto 10px; }
        .task-list { max-height: 300px; overflow-y: auto; }
        .task-item { background: rgba(48, 54, 61, 0.3); border-radius: 6px; padding: 12px; margin-bottom: 10px; border-left: 3px solid; }
        .task-pending { border-left-color: #8b949e; }
        .task-running { border-left-color: #d29922; }
        .task-completed { border-left-color: #238636; }
        .task-title { font-weight: 600; margin-bottom: 5px; }
        .task-meta { font-size: 12px; color: #8b949e; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .badge-pending { background: #6e7681; color: #fff; }
        .badge-running { background: #d29922; color: #000; }
        .badge-completed { background: #238636; color: #fff; }
        .refresh-btn { background: #238636; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .footer { text-align: center; padding: 20px; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐺 狼牙团队监控仪表盘</h1>
        <div>
            <span id="wsStatus" style="margin-right: 20px; color: #8b949e;">⏳ 连接中...</span>
            <button class="refresh-btn" onclick="refreshAll()">🔄 刷新数据</button>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h3>待处理任务</h3>
            <div class="metric"><span class="metric-value" id="pendingCount">-</span><span>个</span></div>
        </div>
        <div class="card">
            <h3>执行中</h3>
            <div class="metric"><span class="metric-value" id="runningCount" style="color: #d29922;">-</span><span>个</span></div>
        </div>
        <div class="card">
            <h3>今日完成</h3>
            <div class="metric"><span class="metric-value" id="completedCount" style="color: #238636;">-</span><span>个</span></div>
        </div>
    </div>

    <div class="card" style="margin-bottom: 20px;">
        <h3>数字员工状态</h3>
        <div class="agent-grid" id="agentGrid"><div style="text-align:center;padding:20px;color:#8b949e;">加载中...</div></div>
    </div>

    <div class="grid">
        <div class="card" style="grid-column: span 2;">
            <h3>任务列表</h3>
            <div class="task-list" id="taskList"><div style="text-align:center;padding:20px;color:#8b949e;">加载中...</div></div>
        </div>
        <div class="card">
            <h3>系统日志</h3>
            <div id="systemLog" style="font-size: 12px; color: #8b949e; max-height: 200px; overflow-y: auto;"><div>系统初始化...</div></div>
        </div>
    </div>

    <div class="footer">
        WolfPack Dashboard v1.0.0 | 后端: http://47.84.71.25:8080 | 
        <span id="serverTime">--</span>
    </div>

    <script>
        const API_BASE = '/api/v1';
        
        function addLog(message) {
            const container = document.getElementById('systemLog');
            const time = new Date().toLocaleTimeString();
            const div = document.createElement('div');
            div.textContent = time + ' ' + message;
            container.insertBefore(div, container.firstChild);
        }

        async function loadStats() {
            try {
                const r = await fetch(`${API_BASE}/dashboard/stats`);
                const d = await r.json();
                document.getElementById('pendingCount').textContent = d.data?.pendingTasks || 0;
                document.getElementById('runningCount').textContent = d.data?.runningTasks || 0;
                document.getElementById('completedCount').textContent = d.data?.completedTasks || 0;
                addLog('统计数据已更新');
            } catch (e) {
                addLog('获取统计数据失败: ' + e.message);
            }
        }

        async function loadAgents() {
            try {
                const r = await fetch(`${API_BASE}/agents`);
                const d = await r.json();
                const grid = document.getElementById('agentGrid');
                grid.innerHTML = '';
                
                if (d.data && d.data.length > 0) {
                    d.data.forEach(agent => {
                        const statusClass = agent.status === 'ONLINE' || agent.status === 'IDLE' ? 'status-online' : 
                                           agent.status === 'BUSY' ? 'status-busy' : 'status-offline';
                        const statusText = agent.status === 'IDLE' ? '空闲' : 
                                          agent.status === 'BUSY' ? '工作中' : agent.status;
                        
                        const div = document.createElement('div');
                        div.className = 'agent-card';
                        div.innerHTML = `
                            <div class="agent-avatar">${agent.id === '01' ? '🐺' : agent.id === '02' ? '📊' : '📈'}</div>
                            <div style="font-weight: 600;">${agent.name}</div>
                            <div style="font-size: 12px; color: #8b949e;">${agent.role}</div>
                            <div style="margin-top: 10px;" class="${statusClass}">● ${statusText}</div>
                            ${agent.currentTask ? `<div style="font-size: 11px; color: #8b949e; margin-top: 5px;">任务: ${agent.currentTask}</div>` : ''}
                        `;
                        grid.appendChild(div);
                    });
                }
                addLog('员工状态已更新');
            } catch (e) {
                addLog('获取员工状态失败: ' + e.message);
            }
        }

        async function loadTasks() {
            try {
                const r = await fetch(`${API_BASE}/tasks`);
                const d = await r.json();
                const list = document.getElementById('taskList');
                list.innerHTML = '';
                
                if (d.data && d.data.length > 0) {
                    const sorted = d.data.sort((a, b) => {
                        const order = { RUNNING: 0, PENDING: 1, COMPLETED: 2, FAILED: 3 };
                        return (order[a.status] || 9) - (order[b.status] || 9);
                    });
                    
                    sorted.forEach(task => {
                        const statusClass = task.status.toLowerCase();
                        const badgeClass = task.status === 'PENDING' ? 'badge-pending' : 
                                          task.status === 'RUNNING' ? 'badge-running' : 'badge-completed';
                        const statusText = task.status === 'PENDING' ? '待处理' : 
                                          task.status === 'RUNNING' ? '执行中' : 
                                          task.status === 'COMPLETED' ? '已完成' : task.status;
                        
                        const div = document.createElement('div');
                        div.className = `task-item ${statusClass}`;
                        div.innerHTML = `
                            <div class="task-title">${task.title}</div>
                            <div class="task-meta">
                                <span class="status-badge ${badgeClass}">${statusText}</span>
                                <span style="margin-left: 10px;">${task.assignee}</span>
                                <span style="margin-left: 10px;">${task.type}</span>
                            </div>
                        `;
                        list.appendChild(div);
                    });
                } else {
                    list.innerHTML = '<div style="text-align: center; padding: 20px; color: #8b949e;">暂无任务</div>';
                }
                addLog('任务列表已更新');
            } catch (e) {
                addLog('获取任务列表失败: ' + e.message);
            }
        }

        function refreshAll() {
            addLog('开始刷新数据...');
            loadStats();
            loadAgents();
            loadTasks();
        }

        function updateServerTime() {
            document.getElementById('serverTime').textContent = new Date().toLocaleString();
        }

        document.addEventListener('DOMContentLoaded', () => {
            addLog('仪表盘初始化完成');
            refreshAll();
            updateServerTime();
            setInterval(() => {
                refreshAll();
                updateServerTime();
            }, 30000);
        });
    </script>
</body>
</html>
HTMLEOF

echo "重启 Nginx..."
sudo docker restart wolfpack-frontend

echo ""
echo "✅ 更新完成！访问: http://47.84.71.25"
echo "强制刷新页面: Ctrl + F5"
