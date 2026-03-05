# 飞书IM同步功能使用说明

## 功能概述

将Kimi对话记录自动同步到飞书群，方便老板通过手机飞书APP查看。

## 快速开始

### 1. 配置飞书Webhook

编辑配置文件：
```bash
nano /root/.openclaw/workspace/feishu_sync_config.json
```

填写以下字段：
```json
{
  "feishu_sync": {
    "enabled": true,
    "webhook_url": "https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxx",
    "secret": "",
    "target_group": "狼牙01-Kimi同步"
  }
}
```

**如何获取Webhook URL：**
1. 在飞书创建群聊「Kimi对话同步」
2. 群设置 → 群机器人 → 添加机器人 → 自定义机器人
3. 复制Webhook地址

### 2. 测试连接

```bash
cd /root/.openclaw/workspace
python3 sync_to_feishu.py --test
```

### 3. 手动同步

在Kimi对话中输入：
```
/sync
```

或手动执行：
```bash
python3 sync_to_feishu.py
```

### 4. 定时任务（自动）

每10分钟自动执行同步：
```bash
# 添加到crontab
crontab -e

# 添加以下行
*/10 * * * * /root/.openclaw/workspace/feishu_sync_cron.sh
```

## 文件结构

```
/root/.openclaw/workspace/
├── feishu_sync_config.json          # 配置文件
├── sync_to_feishu.py                # 主同步脚本
├── feishu_sync_cron.sh              # 定时任务脚本
├── docs/feishu_sync_solution.md     # 技术方案文档
└── memory/
    ├── conversation_log.json        # 对话记录存储
    ├── last_sync_timestamp.txt      # 上次同步时间
    └── failed_messages_queue.json   # 失败消息队列
```

## 指令说明

### /sync
触发飞书同步，同步最新对话记录。

### /sync force
强制同步全部对话记录（忽略时间戳）。

### /sync test
测试飞书连接，发送一条测试消息。

## 消息格式

飞书接收到的消息格式如下：

```
🤖 Kimi对话同步
─────────────────
📅 同步时间：2026-03-03 18:45
📊 对话数量：3 条
─────────────────

⏰ 18:30
👤 用户：设计一个同步方案
🤖 Kimi：好的，我来设计方案...

⏰ 18:35
👤 用户：测试一下
🤖 Kimi：测试成功...

【查看完整记录】
```

## 故障排查

### 问题1：同步失败，提示"未配置webhook_url"

**解决：** 在 `feishu_sync_config.json` 中填写正确的webhook_url。

### 问题2：消息发送成功但飞书没收到

**解决：** 
1. 检查飞书群机器人是否被删除
2. 检查是否触发了安全策略（关键词/IP白名单）

### 问题3：同步内容不完整

**解决：**
1. 飞书消息有长度限制（9000字符），超长会自动截断
2. 可以在配置中调整 `max_message_length`

### 查看日志

```bash
# 查看同步日志
tail -f /root/.openclaw/workspace/logs/feishu_sync_cron.log

# 查看失败队列
cat /root/.openclaw/workspace/memory/failed_messages_queue.json
```

## 配置说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| enabled | 是否启用同步 | true |
| webhook_url | 飞书机器人Webhook地址 | "" |
| secret | 安全密钥（可选） | "" |
| sync_interval_minutes | 同步间隔（分钟） | 10 |
| max_message_length | 最大消息长度 | 9000 |
| max_retries | 失败重试次数 | 3 |

## 安全说明

1. Webhook URL 存储在本地配置文件中，不会上传到云端
2. 可以配置 `secret` 启用飞书签名校验
3. 支持IP白名单限制（在飞书端配置）
4. 敏感对话可以通过 `exclude_patterns` 过滤

## 更新历史

- v1.0 (2026-03-03): 初始版本，支持基本同步功能