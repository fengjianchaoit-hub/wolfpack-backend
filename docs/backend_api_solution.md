# 后台服务API设计方案

**方案版本**: v1.0  
**制定日期**: 2026-03-03  
**负责人**: 狼牙03

---

## 一、需求概述

开发后台API服务，通过API对接方式管理仪表盘数据，无需每次重新部署网站即可更新内容。

---

## 二、技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| 后端框架 | Python Flask | 轻量、易部署、生态丰富 |
| 数据库 | SQLite | 零配置、单文件、足够使用 |
| 前端 | 纯HTML+JS | 无需构建工具，直接调用API |
| 部署 | 内置HTTP服务器 | 无需Nginx/Apache |

---

## 三、服务架构

```
┌─────────────────────────────────────────────────────────┐
│                    狼牙后台服务 (Flask)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Dashboard   │  │   Task API   │  │  Agent API   │  │
│  │   数据接口    │  │   任务管理   │  │  代理状态    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         └─────────────────┼─────────────────┘          │
│                           │                            │
│                    ┌──────┴──────┐                    │
│                    │   SQLite    │                    │
│                    │   数据库    │                    │
│                    └─────────────┘                    │
└─────────────────────────────────────────────────────────┘
                              │
                              │ HTTP REST API
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   仪表盘前端 (HTML/JS)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  数据展示    │  │  实时刷新    │  │  交互操作    │  │
│  │  (动态加载)  │  │  (轮询API)   │  │  (按钮事件)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 四、API接口设计

### 4.1 接口总览

| 分类 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 仪表盘 | /api/dashboard | GET | 获取仪表盘完整数据 |
| 任务 | /api/tasks | GET | 获取任务列表 |
| 任务 | /api/tasks | POST | 创建新任务 |
| 任务 | /api/tasks/{id} | PUT | 更新任务状态 |
| 代理 | /api/agents | GET | 获取代理列表 |
| 代理 | /api/agents/{name}/status | POST | 更新代理状态 |
| 系统 | /api/health | GET | 健康检查 |

### 4.2 接口详情

#### GET /api/dashboard

**响应**:
```json
{
  "update_time": "2026-03-03T19:30:00",
  "metrics": {
    "active_agents": 4,
    "tasks_today": 5,
    "tasks_completed": 2,
    "tasks_pending": 3,
    "uptime_hours": 48
  },
  "agents": [
    {
      "name": "狼头",
      "role": "团队负责人",
      "status": "online",
      "current_task": "统筹管理",
      "tasks": [
        {"name": "团队搭建", "status": "done"},
        {"name": "复盘报告", "status": "done"}
      ]
    }
  ],
  "today_tasks": [
    {
      "id": 1,
      "time": "09:00",
      "agent": "狼牙01",
      "task": "生成AI日报",
      "priority": "high",
      "status": "pending"
    }
  ],
  "logs": [
    {
      "time": "15:07",
      "agent": "狼头",
      "action": "创建狼牙03",
      "result": "成功"
    }
  ]
}
```

#### POST /api/tasks

**请求体**:
```json
{
  "time": "12:00",
  "agent": "狼牙01",
  "task": "额外任务",
  "priority": "medium"
}
```

**响应**:
```json
{
  "success": true,
  "task_id": 6,
  "message": "任务已创建"
}
```

#### PUT /api/tasks/{id}

**请求体**:
```json
{
  "status": "completed",
  "result": "日报已生成"
}
```

#### POST /api/agents/{name}/status

**请求体**:
```json
{
  "status": "working",
  "task": "生成AI日报",
  "progress": 50,
  "message": "正在整理数据..."
}
```

---

## 五、数据库设计

### 5.1 表结构

```sql
-- 代理表
CREATE TABLE agents (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    role TEXT,
    status TEXT DEFAULT 'idle',
    current_task TEXT,
    progress INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    time TEXT,
    agent_name TEXT,
    task TEXT,
    priority TEXT,
    status TEXT DEFAULT 'pending',
    result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 日志表
CREATE TABLE logs (
    id INTEGER PRIMARY KEY,
    time TEXT,
    agent TEXT,
    action TEXT,
    result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 指标表
CREATE TABLE metrics (
    key TEXT PRIMARY KEY,
    value INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 初始化数据

```sql
-- 初始化代理
INSERT INTO agents (name, role, status) VALUES
('狼头', '团队负责人', 'online'),
('狼牙01', '文案编辑', 'idle'),
('狼牙02', '数据分析', 'idle'),
('狼牙03', '可视化', 'idle');

-- 初始化指标
INSERT INTO metrics (key, value) VALUES
('active_agents', 4),
('tasks_today', 0),
('tasks_completed', 0),
('uptime_hours', 0);
```

---

## 六、后端代码实现

### 6.1 项目结构

```
wolfpack_backend/
├── app.py              # 主应用
├── models.py           # 数据模型
├── database.py         # 数据库连接
├── api/
│   ├── dashboard.py    # 仪表盘接口
│   ├── tasks.py        # 任务接口
│   └── agents.py       # 代理接口
├── data/
│   └── wolfpack.db     # SQLite数据库
└── requirements.txt
```

### 6.2 主应用代码 (app.py)

```python
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_PATH = 'data/wolfpack.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    db = get_db()
    
    # 获取代理状态
    agents = db.execute('SELECT * FROM agents').fetchall()
    
    # 获取今日任务
    tasks = db.execute(
        "SELECT * FROM tasks WHERE date(created_at) = date('now')"
    ).fetchall()
    
    # 获取指标
    metrics = dict(db.execute('SELECT key, value FROM metrics').fetchall())
    
    # 获取日志
    logs = db.execute(
        'SELECT * FROM logs ORDER BY created_at DESC LIMIT 10'
    ).fetchall()
    
    return jsonify({
        'update_time': datetime.now().isoformat(),
        'metrics': metrics,
        'agents': [dict(a) for a in agents],
        'today_tasks': [dict(t) for t in tasks],
        'logs': [dict(l) for l in logs]
    })

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    db = get_db()
    cursor = db.execute(
        'INSERT INTO tasks (time, agent_name, task, priority) VALUES (?, ?, ?, ?)',
        (data['time'], data['agent'], data['task'], data.get('priority', 'medium'))
    )
    db.commit()
    return jsonify({'success': True, 'task_id': cursor.lastrowid})

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    db = get_db()
    db.execute(
        'UPDATE tasks SET status = ?, result = ? WHERE id = ?',
        (data['status'], data.get('result'), task_id)
    )
    db.commit()
    return jsonify({'success': True})

@app.route('/api/agents/<name>/status', methods=['POST'])
def update_agent_status(name):
    data = request.json
    db = get_db()
    db.execute(
        'UPDATE agents SET status = ?, current_task = ?, progress = ?, updated_at = ? WHERE name = ?',
        (data['status'], data.get('task'), data.get('progress', 0), 
         datetime.now().isoformat(), name)
    )
    db.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
```

---

## 七、前端改造

### 7.1 API客户端

```javascript
// api.js
const API_BASE = 'http://localhost:5000/api';

async function fetchDashboard() {
    const response = await fetch(`${API_BASE}/dashboard`);
    return await response.json();
}

async function updateTaskStatus(taskId, status, result) {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({status, result})
    });
    return await response.json();
}

async function updateAgentStatus(name, status, task, progress) {
    const response = await fetch(`${API_BASE}/agents/${name}/status`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({status, task, progress})
    });
    return await response.json();
}
```

### 7.2 页面加载

```javascript
// 页面加载时获取数据
async function initDashboard() {
    const data = await fetchDashboard();
    renderMetrics(data.metrics);
    renderAgents(data.agents);
    renderTasks(data.today_tasks);
    renderLogs(data.logs);
}

// 每30秒自动刷新
setInterval(initDashboard, 30000);

// 初始化
initDashboard();
```

---

## 八、部署方案

### 8.1 启动服务

```bash
# 安装依赖
pip install flask flask-cors

# 创建数据目录
mkdir -p data

# 初始化数据库
python3 init_db.py

# 启动服务
python3 app.py
```

### 8.2 后台运行

```bash
# 使用nohup后台运行
nohup python3 app.py > /tmp/wolfpack_api.log 2>&1 &

# 或使用systemd
sudo systemctl start wolfpack-api
```

### 8.3 与GitHub Pages集成

GitHub Pages只支持静态文件，需要通过以下方式集成：

1. **方式一：分开部署**
   - 前端：GitHub Pages
   - 后端：自有服务器（当前服务器）
   
2. **方式二：纯前端改造**
   - 前端调用后端API
   - 后端部署在当前服务器

---

## 九、检查清单

- [x] API设计RESTful规范
- [x] 数据库设计完整
- [x] 代码实现框架完成
- [x] 前端改造方案清晰
- [x] 部署步骤明确
- [x] 支持热更新数据（无需重新部署）

---

## 十、预期效果

1. ✅ 网站数据通过API动态加载
2. ✅ 任务状态实时更新
3. ✅ 无需重新部署即可修改数据
4. ✅ 支持多设备同时查看
5. ✅ 可扩展更多功能

---

**文档完成，待狼头审核。**