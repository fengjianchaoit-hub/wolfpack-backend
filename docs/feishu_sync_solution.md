# Kimi对话同步飞书IM技术方案

## 一、项目概述

### 1.1 需求背景
将当前Kimi聊天窗口的对话记录同步到飞书IM，方便老板在手机端随时查看对话内容。

### 1.2 目标用户
- 老板：通过手机飞书APP查看Kimi对话记录
- 使用者：在Kimi窗口正常对话，无需额外操作

---

## 二、可行性分析

### 2.1 OpenClaw飞书能力调研

根据当前环境权限检查，OpenClaw已具备以下飞书权限：

| 权限 | 说明 | 状态 |
|------|------|------|
| `im:message` | 获取与发送单聊、群聊消息 | ✅ 已授权 |
| `im:message:send_as_bot` | 以Bot身份发送消息 | ✅ 已授权 |
| `im:message:readonly` | 读取消息（双向同步备用） | ✅ 已授权 |
| `im:message.p2p_msg:readonly` | 读取单聊消息 | ✅ 已授权 |
| `im:resource` | IM资源操作 | ✅ 已授权 |

**结论**：OpenClaw已有完整的消息发送权限，方案可行。

### 2.2 技术方案对比

| 方案 | 实现复杂度 | 实时性 | 成本 | 适用场景 |
|------|-----------|--------|------|---------|
| **群机器人Webhook** | 低 | 准实时 | 免费 | 单向推送、简单场景 |
| **自建应用Bot API** | 中 | 实时 | 免费 | 双向交互、复杂场景 |
| **消息队列+消费** | 高 | 实时 | 低 | 高并发、分布式 |

**推荐方案**：群机器人Webhook（满足单向同步需求，实现简单可靠）

---

## 三、技术实现方案

### 3.1 架构设计

```
┌─────────────────┐    对话记录     ┌─────────────────┐
│   Kimi聊天窗口   │ ──────────────> │  OpenClaw服务   │
└─────────────────┘                 └────────┬────────┘
                                             │
                                             │ 调用message工具
                                             ▼
                                    ┌─────────────────┐
                                    │  飞书群机器人    │
                                    │  (Webhook)      │
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   飞书群聊/单聊  │
                                    │  (老板手机查看)  │
                                    └─────────────────┘
```

### 3.2 实现方式选择：群机器人Webhook

#### 3.2.1 飞书端配置步骤

1. **创建飞书群**
   - 在飞书客户端创建专用群（如「Kimi对话同步」）
   - 邀请老板加入该群

2. **添加群机器人**
   ```
   群设置 → 群机器人 → 添加机器人 → 自定义机器人
   ```

3. **获取Webhook地址**
   ```
   https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxxxxxxxxxx
   ```

4. **安全设置（可选）**
   - 自定义关键词：设置如「Kimi」「对话」等关键词
   - 或IP白名单：限制OpenClaw服务器IP

#### 3.2.2 OpenClaw端配置

在OpenClaw配置文件中添加webhook信息：

```json
{
  "feishu_sync": {
    "webhook_url": "https://open.feishu.cn/open-apis/bot/v2/hook/xxxx",
    "secret": "your-secret-if-enabled",
    "enabled": true,
    "target_channel": "狼牙01-Kimi同步"
  }
}
```

---

## 四、消息格式设计

### 4.1 消息结构设计

考虑到飞书消息长度限制和可读性，设计以下格式：

#### 4.1.1 富文本消息（推荐）

```json
{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "title": "🤖 Kimi对话同步",
        "content": [
          [
            {"tag": "text", "text": "📅 时间：2026-03-03 18:33\n"},
            {"tag": "text", "text": "👤 用户：xxx\n"},
            {"tag": "text", "text": "─────────────────\n"}
          ],
          [
            {"tag": "text", "text": "💬 对话内容：\n"},
            {"tag": "text", "text": "用户：设计一个同步方案\n"},
            {"tag": "text", "text": "Kimi：好的，我来设计..."}
          ],
          [
            {"tag": "a", "text": "【查看完整对话】", "href": "https://kimi.moonshot.cn/chat/xxx"}
          ]
        ]
      }
    }
  }
}
```

**飞书展示效果预览：**
```
🤖 Kimi对话同步
─────────────────
📅 时间：2026-03-03 18:33
👤 用户：xxx
─────────────────
💬 对话内容：
用户：设计一个同步方案
Kimi：好的，我来设计...
【查看完整对话】
```

#### 4.1.2 文本消息（备用）

```json
{
  "msg_type": "text",
  "content": {
    "text": "【Kimi对话同步】\n时间：2026-03-03 18:33\n─────────────────\n用户：设计一个同步方案\nKimi：好的，我来设计方案..."
  }
}
```

### 4.2 消息长度限制处理

飞书机器人消息限制：
- 文本消息：最大 4096 字符
- 富文本消息：最大 10000 字符
- 卡片消息：最大 10000 字符

**处理策略**：

| 内容长度 | 处理方式 |
|---------|---------|
| < 3000字符 | 完整发送 |
| 3000-10000字符 | 截取前9500字符 + 【内容过长，已截断】 |
| > 10000字符 | 分多条消息发送，或只发送摘要+链接 |

### 4.3 消息合并策略

考虑到连续对话可能产生多条消息，建议：

1. **按会话合并**：一个完整问答对作为一条消息
2. **定时批量**：每5分钟合并发送一次
3. **触发阈值**：单条消息超过500字符立即发送

---

## 五、同步触发方式

### 5.1 方案对比

| 触发方式 | 实现难度 | 实时性 | 适用场景 |
|---------|---------|--------|---------|
| **实时推送** | 中 | 秒级 | 关键对话即时通知 |
| **定时批量** | 低 | 分钟级 | 常规对话汇总 |
| **手动触发** | 低 | 按需 | 重要对话主动推送 |

### 5.2 推荐方案：定时批量 + 手动触发

**原因**：Kimi对话通常较长，实时推送会导致消息刷屏，影响阅读体验。

#### 5.2.1 定时批量同步

- **频率**：每10分钟检查一次
- **条件**：有新对话内容时发送
- **格式**：合并这段时间内的所有对话

#### 5.2.2 手动触发指令

在Kimi对话中输入特定指令即可立即同步：

```
/sync          # 同步当前对话到飞书
/sync urgent   # 立即同步（高优先级格式）
```

---

## 六、部署步骤

### 6.1 前置准备

1. **确认OpenClaw版本**
   ```bash
   openclaw version
   # 需 >= 1.0.0
   ```

2. **确认飞书权限**
   ```bash
   openclaw feishu scopes
   ```

### 6.2 飞书端配置（5分钟）

1. 创建飞书群「Kimi对话同步」
2. 添加自定义机器人
3. 复制Webhook URL
4. （可选）配置安全策略

### 6.3 OpenClaw配置（10分钟）

1. **安装飞书技能（如未安装）**
   ```bash
   openclaw plugins install @openclaw/feishu
   ```

2. **配置同步参数**
   ```bash
   # 设置webhook地址
   openclaw config set feishu_sync.webhook_url "https://open.feishu.cn/open-apis/bot/v2/hook/xxxx"
   
   # 设置安全密钥（如启用签名校验）
   openclaw config set feishu_sync.secret "your-secret"
   
   # 启用同步
   openclaw config set feishu_sync.enabled true
   ```

3. **重启网关**
   ```bash
   openclaw gateway restart
   ```

### 6.4 验证测试

1. 在Kimi窗口发送测试消息
2. 执行同步指令或等待定时任务
3. 检查飞书群是否收到消息

---

## 七、错误处理机制

### 7.1 常见错误及处理

| 错误类型 | 原因 | 处理策略 |
|---------|------|---------|
| Webhook 404 | 机器人被删除 | 本地记录错误日志，通知管理员重配 |
| 消息发送失败 | 网络/频率限制 | 指数退避重试（1s, 2s, 4s, 8s） |
| 消息超长 | 内容超过限制 | 自动截断+提示 |
| 权限不足 | Token过期 | 自动刷新Token，重试一次 |
| 服务器异常 | 飞书服务问题 | 本地队列暂存，稍后重试 |

### 7.2 重试机制

```python
max_retries = 3
retry_delays = [1, 2, 4]  # 秒

for attempt in range(max_retries):
    try:
        send_message(content)
        break
    except Exception as e:
        if attempt < max_retries - 1:
            time.sleep(retry_delays[attempt])
        else:
            log_error(e)
            save_to_queue(content)  # 本地暂存
```

### 7.3 监控告警

建议配置以下监控项：

1. **同步成功率** < 95% 时告警
2. **连续失败次数** > 3 次时告警
3. **消息堆积数量** > 100 条时告警

---

## 八、安全与隐私

### 8.1 数据安全

- Webhook URL 存储在本地配置，不上传云端
- 敏感内容可配置过滤规则
- 支持IP白名单限制

### 8.2 隐私保护

- 仅同步必要对话内容
- 可配置排除特定关键词
- 支持手动触发替代自动同步

---

## 九、方案总结

### 9.1 检查清单

- [x] **方案可行性**：OpenClaw已有完整飞书发送权限
- [x] **步骤清晰**：飞书端5分钟 + OpenClaw端10分钟配置
- [x] **消息长度限制**：设计分段策略，最大10000字符
- [x] **错误处理**：包含重试、退避、告警机制

### 9.2 预计效果

老板在手机上可以：
1. 每10分钟收到一次对话汇总
2. 看到格式化的时间、用户、内容
3. 点击链接查看完整对话（如需要）

### 9.3 后续优化方向

1. **智能摘要**：使用AI生成对话摘要
2. **关键词过滤**：只同步包含特定关键词的对话
3. **多目标支持**：支持同步到多个飞书群
4. **历史查询**：支持在飞书查询历史对话

---

## 十、附录

### 附录A：快速配置脚本

```bash
#!/bin/bash
# setup_feishu_sync.sh

echo "=== Kimi-飞书同步配置脚本 ==="

# 读取配置
read -p "请输入飞书Webhook URL: " WEBHOOK_URL
read -p "请输入安全密钥(无则回车): " SECRET

# 配置OpenClaw
openclaw config set feishu_sync.webhook_url "$WEBHOOK_URL"
if [ -n "$SECRET" ]; then
    openclaw config set feishu_sync.secret "$SECRET"
fi
openclaw config set feishu_sync.enabled true

# 重启网关
echo "重启OpenClaw网关..."
openclaw gateway restart

echo "配置完成！发送测试消息验证..."
```

### 附录B：消息模板JSON

```json
{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "title": "🤖 Kimi对话同步",
        "content": []
      }
    }
  }
}
```

### 附录C：飞书开放平台文档

- [自定义机器人指南](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)
- [发送富文本消息](https://open.feishu.cn/document/ukTMukTMukTM/uMDMxEjLzATMx4yMwETM)
- [消息内容限制](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)

---

**文档版本**：v1.0  
**编写时间**：2026-03-03  
**状态**：待审核