#!/bin/bash
# WolfPack 完整部署脚本 - 执行一次即可

set -e

echo "======================================"
echo "WolfPack 监控仪表盘部署"
echo "======================================"

# 1. 更新前端代码
echo ""
echo "[1/4] 更新前端代码..."
sudo mkdir -p /opt/wolfpack-dashboard/html

sudo tee /opt/wolfpack-dashboard/html/index.html > /dev/null << 'HTMLEOF'
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
        .status-offline { color: #da3633; }
        .status-busy { color: #d29922; }
        .agent-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
        .agent-card { background: rgba(48, 54, 61, 0.5); border-radius: 8px; padding: 15px; text-align: center; }
        .agent-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #58a6ff, #238636); display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto 10px; }
        .task-item { background: rgba(48, 54, 61, 0.3); border-radius: 6px; padding: 12px; margin-bottom: 10px; border-left: 3px solid; }
        .task-pending { border-left-color: #8b949e; }
        .task-running { border-left-color: #d29922; }
        .task-completed { border-left-color: #238636; }
        .refresh-btn { background: #238636; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐺 狼牙团队监控仪表盘</h1>
        <button class="refresh-btn" onclick="refreshAll()">🔄 刷新数据</button>
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
            <div id="taskList"><div style="text-align:center;padding:20px;color:#8b949e;">加载中...</div></div>
        </div>
    </div>
    <script>
        const API = '/api/v1';
        async function loadStats() { try { const r = await fetch(`${API}/dashboard/stats`); const d = await r.json(); document.getElementById('pendingCount').textContent = d.data?.pendingTasks || 0; document.getElementById('runningCount').textContent = d.data?.runningTasks || 0; document.getElementById('completedCount').textContent = d.data?.completedTasks || 0; } catch (e) { console.error(e); } }
        async function loadAgents() { try { const r = await fetch(`${API}/agents`); const d = await r.json(); const g = document.getElementById('agentGrid'); g.innerHTML = ''; if (d.data) d.data.forEach(a => { const s = a.status === 'IDLE' ? 'status-online' : a.status === 'BUSY' ? 'status-busy' : 'status-offline'; const t = a.status === 'IDLE' ? '空闲' : a.status === 'BUSY' ? '工作中' : a.status; g.innerHTML += `<div class="agent-card"><div class="agent-avatar">${a.id === '01' ? '🐺' : a.id === '02' ? '📊' : '📈'}</div><div style="font-weight:600;">${a.name}</div><div style="font-size:12px;color:#8b949e;">${a.role}</div><div class="${s}" style="margin-top:10px;">● ${t}</div></div>`; }); } catch (e) { console.error(e); } }
        async function loadTasks() { try { const r = await fetch(`${API}/tasks`); const d = await r.json(); const l = document.getElementById('taskList'); l.innerHTML = ''; if (d.data) d.data.forEach(t => { const c = t.status === 'PENDING' ? 'task-pending' : t.status === 'RUNNING' ? 'task-running' : 'task-completed'; l.innerHTML += `<div class="task-item ${c}"><div style="font-weight:600;">${t.title}</div><div style="font-size:12px;color:#8b949e;">${t.assignee} · ${t.type}</div></div>`; }); } catch (e) { console.error(e); } }
        function refreshAll() { loadStats(); loadAgents(); loadTasks(); }
        document.addEventListener('DOMContentLoaded', () => { refreshAll(); setInterval(refreshAll, 30000); });
    </script>
</body>
</html>
HTMLEOF

# 2. 创建Nginx配置（带HTTPS）
echo ""
echo "[2/4] 配置Nginx..."
sudo tee /opt/wolfpack-dashboard/nginx.conf > /dev/null << 'NGINX'
server {
    listen 80;
    server_name wolfpack.hk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wolfpack.hk;
    ssl_certificate /etc/letsencrypt/live/wolfpack.hk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wolfpack.hk/privkey.pem;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        add_header Cache-Control 'no-cache' always;
    }
    
    location /api/ {
        proxy_pass http://47.84.71.25:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    location /ws/ {
        proxy_pass http://47.84.71.25:8080/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

# 3. 重启Nginx容器
echo ""
echo "[3/4] 重启Nginx..."
sudo docker stop wolfpack-frontend 2>/dev/null || true
sudo docker rm wolfpack-frontend 2>/dev/null || true

sudo docker run -d \
  --name wolfpack-frontend \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /opt/wolfpack-dashboard/html:/usr/share/nginx/html:ro \
  -v /opt/wolfpack-dashboard/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  nginx:alpine

# 4. 验证
echo ""
echo "[4/4] 验证部署..."
sleep 3
sudo docker ps | grep wolfpack

echo ""
echo "======================================"
echo "✅ 部署完成！"
echo "访问: https://wolfpack.hk"
echo "======================================"
