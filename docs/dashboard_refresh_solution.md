# 仪表盘动态刷新架构方案

**方案版本**: v1.0  
**制定日期**: 2026-03-03  
**负责人**: 狼牙02

---

## 一、需求概述

实现任务执行后，动态刷新数据和任务状态到仪表盘，无需手动刷新页面。

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────┐     更新状态      ┌─────────────────┐
│   任务执行      │ ─────────────────> │   状态API服务   │
│  (狼牙团队)     │                    │   (Flask)       │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ 读取状态
                                                ▼
┌─────────────────┐     轮询/推送      ┌─────────────────┐
│   仪表盘前端    │ <───────────────── │   数据存储      │
│   (HTML/JS)     │                    │   (JSON文件)    │
└─────────────────┘                    └─────────────────┘
```

### 2.2 组件说明

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| API服务 | Python Flask | 轻量级REST API服务 |
| 数据存储 | JSON文件 | 简单持久化，无需数据库 |
| 前端刷新 | 定时轮询 | 每30秒自动刷新 |
| 通信协议 | HTTP REST | 简单易实现 |

---

## 三、API接口设计

### 3.1 接口列表

| 方法 | 路径 | 功能 | 说明 |
|------|------|------|------|
| POST | /api/status | 更新状态 | 任务更新状态时调用 |
| GET | /api/status | 获取状态 | 前端轮询获取 |
| POST | /api/task/start | 任务开始 | 标记任务开始执行 |
| POST | /api/task/complete | 任务完成 | 标记任务完成 |
| GET | /api/tasks | 获取任务列表 | 获取所有任务状态 |

### 3.2 接口详情

#### POST /api/status

**请求体**:
```json
{
  "agent": "狼牙01",
  "status": "working",
  "task": "生成AI日报",
  "progress": 50,
  "message": "正在搜索数据...",
  "timestamp": "2026-03-03T19:00:00"
}
```

**响应**:
```json
{
  "success": true,
  "message": "状态已更新"
}
```

#### GET /api/status

**响应**:
```json
{
  "agents": [
    {
      "name": "狼头",
      "status": "online",
      "task": "统筹管理",
      "last_update": "2026-03-03T19:00:00"
    },
    {
      "name": "狼牙01",
      "status": "working",
      "task": "生成AI日报",
      "progress": 50,
      "last_update": "2026-03-03T19:05:00"
    }
  ],
  "tasks_today": 5,
  "tasks_completed": 2
}
```

---

## 四、数据存储设计

### 4.1 文件结构

```
/data/
├── status.json        # 当前状态
├── tasks.json         # 任务列表
└── history/           # 历史记录
    └── 2026-03-03.json
```

### 4.2 status.json 示例

```json
{
  "last_update": "2026-03-03T19:10:00",
  "agents": {
    "狼头": {
      "status": "online",
      "role": "团队负责人",
      "current_task": "统筹管理",
      "tasks_completed": 12
    },
    "狼牙01": {
      "status": "working",
      "role": "文案编辑",
      "current_task": "生成AI日报",
      "progress": 75,
      "last_active": "2026-03-03T19:10:00"
    }
  },
  "metrics": {
    "active_agents": 4,
    "tasks_today": 5,
    "tasks_completed": 2,
    "tasks_pending": 3
  }
}
```

---

## 五、前端改造方案

### 5.1 自动刷新机制

```javascript
// 每30秒自动刷新数据
setInterval(loadDashboardData, 30000);

// 加载数据函数
async function loadDashboardData() {
    const response = await fetch('/api/status');
    const data = await response.json();
    updateDashboard(data);
}
```

### 5.2 实时状态显示

- 任务执行中显示进度条
- 状态变化时添加动画效果
- 新任务完成时推送通知

---

## 六、实施步骤

### 6.1 后端部署

1. 创建API服务
```bash
pip install flask flask-cors
cd /root/.openclaw/workspace/wolfpack_dashboard
python3 api_server.py
```

2. API服务代码 (`api_server.py`)
```python
from flask import Flask, jsonify, request
import json
import os

app = Flask(__name__)
DATA_FILE = 'data/status.json'

@app.route('/api/status', methods=['GET'])
def get_status():
    with open(DATA_FILE) as f:
        return jsonify(json.load(f))

@app.route('/api/status', methods=['POST'])
def update_status():
    data = request.json
    # 更新状态逻辑
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 6.2 前端改造

1. 添加自动刷新脚本
2. 修改静态数据为动态加载
3. 添加进度条和动画效果

---

## 七、检查清单

- [x] 架构设计完成
- [x] API接口定义清晰
- [x] 数据存储方案简单可行
- [x] 前端刷新机制设计完成
- [x] 实施步骤明确

---

## 八、预期效果

1. 任务状态实时同步到仪表盘
2. 前端自动刷新，无需手动操作
3. 进度可视化，状态一目了然
4. 历史记录可追溯

---

**文档完成，待狼头审核。**