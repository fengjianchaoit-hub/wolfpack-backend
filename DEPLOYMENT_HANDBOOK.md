# 狼牙团队端到端全自动部署手册
**版本**: V1.0 最终版  
**生效日期**: 2026-03-07  
**状态**: 强制执行，唯一标准  
**替代说明**: 此方案替代所有历史部署方案（手动/半自动/实验性方案均作废）

---

## 一、核心方法论（唯一标准）

### 1.1 三步走原则
所有代码变更必须遵循以下流程，**无任何例外**：

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. 同步代码    │ ──► │  2. 本地验证    │ ──► │  3. Push到远程   │ ──► │  4. 自动部署    │
│                 │     │                 │     │                 │     │                 │
│ • git pull      │     │ • 代码正确      │     │ • GitHub仓库    │     │ • Actions触发   │
│ • 同步最新      │     │ • 功能完整      │     │ • 提交信息清晰   │     │ • 自动构建      │
│   远程代码      │     │ • 本地测试通过   │     │                 │     │ • 自动部署      │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
   拉取远程更新           我的工作区              GitHub远程               服务器生产环境
   origin/main            /workspace              wolfpack-backend         47.84.71.25
```

### 1.2 核心口诀（8字诀）
> **"同步→本地→远程→自动→呈现"**

```
git pull 同步最新代码 → 本地验证修改正确 → Push到GitHub → Actions自动部署 → 用户看到结果
```

### 1.3 执行标准
| 阶段 | 负责人 | 交付标准 | 验证方式 |
|------|--------|----------|----------|
| **1. 同步** | 我（狼头） | 拉取远程最新代码，无冲突 | `git log` 确认最新 |
| **2. 本地** | 我（狼头） | 代码可运行，功能符合需求 | 本地构建通过 |
| **3. 远程** | GitHub | 代码已提交，Commit清晰 | `git log` 确认 |
| **4. 服务器** | GitHub Actions | 部署成功，服务健康 | Health API返回200 |

### 1.4 用户等待时间
**用户（老板）只需等待**：Push后 **2-3分钟** 即可看到页面功能呈现

---

## 二、技术架构（唯一配置）

### 2.1 架构图
```
┌──────────────────────────────────────────────────────────────┐
│                         本地工作区                            │
│  /root/.openclaw/workspace/wolfpack-backend/                  │
│  /root/.openclaw/workspace/wolfpack-dashboard/                │
└───────────────────────────┬──────────────────────────────────┘
                            │ git push origin main
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                     GitHub Actions                            │
│  .github/workflows/auto-deploy.yml                           │
│  Secrets: SERVER_HOST, SERVER_USER, SSH_PRIVATE_KEY          │
└───────────────────────────┬──────────────────────────────────┘
                            │ SSH + SCP
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                       生产服务器                              │
│  47.84.71.25                                                 │
│  • Backend: Docker wolfpack-backend:8080                     │
│  • Frontend: Docker wolfpack-frontend:80                     │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 GitHub Secrets配置（唯一）
| Secret Name | 值 | 说明 |
|-------------|-----|------|
| `SERVER_HOST` | `47.84.71.25` | 服务器IP |
| `SERVER_USER` | `root` | SSH登录用户 |
| `SSH_PRIVATE_KEY` | 服务器私钥完整内容 | 认证密钥 |

**废弃Secrets**（已删除，不再使用）：
- ~~`SERVER_PASSWORD`~~ - 使用SSH Key替代
- ~~`SERVER_SSH_KEY`~~ - 命名不规范，已替换为`SSH_PRIVATE_KEY`

### 2.3 Workflow文件（唯一）
**文件**: `.github/workflows/auto-deploy.yml`
**功能**: 
- Maven构建后端
- Docker镜像打包
- SCP上传到服务器
- SSH执行部署脚本
- 健康检查

---

## 三、标准操作流程（SOP）

### 3.1 代码变更流程
```bash
# Step 1: 同步远程最新代码（必须先执行！）
GIT_SSH_COMMAND="ssh -i ~/.ssh/github_wolfpack -o StrictHostKeyChecking=no" git pull origin main

# Step 2: 本地修改代码
vim wolfpack-backend/.../XXX.java
vim wolfpack-dashboard/index.html

# Step 3: 本地验证（快速检查）
cd wolfpack-backend && mvn clean compile -q

# Step 4: Git提交
Git add .
Git commit -m "feat: 清晰描述本次变更"
GIT_SSH_COMMAND="ssh -i ~/.ssh/github_wolfpack -o StrictHostKeyChecking=no" Git push origin main

# Step 5: 等待自动部署（2-3分钟）
# 无需操作，Actions自动完成

# Step 6: 验证（可选）
curl http://47.84.71.25:8080/api/v1/dashboard/health
curl http://47.84.71.25
```

### 3.2 用户指令响应流程
```
用户指令 → 我理解需求 → git pull同步 → 本地编码 → 本地验证 → Git Push → 通知用户等待
                                                                  ↓
                                                        Actions自动部署
                                                                  ↓
                                                        通知用户完成 + 验证链接
```

---

## 四、疑难杂症处理手册

### 4.1 SSH认证失败（最常见）
**症状**: `ssh: handshake failed: ssh: unable to authenticate`
**原因**: Secrets配置错误或服务器authorized_keys未配置

**解决方案**:
1. 检查服务器authorized_keys：
   ```bash
   cat ~/.ssh/authorized_keys
   # 确保包含 ~/.ssh/id_ed25519.pub 的内容
   ```
2. 检查GitHub Secrets：
   - 访问 https://github.com/fengjianchaoit-hub/wolfpack-backend/settings/secrets/actions
   - 确认 `SSH_PRIVATE_KEY` 包含完整私钥（含BEGIN/END行）
3. 检查文件权限：
   ```bash
   chmod 600 ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/id_ed25519
   ```

### 4.2 Maven构建失败
**症状**: `BUILD FAILURE`
**常见原因**: 缺少方法依赖

**解决方案**:
```bash
# 检查Controller调用Service的方法是否存在
# 如：AgentController调用getAllAgents()，需在Service中添加对应方法

public List<AgentVO> getAllAgents() { 
    return getAgentList(); 
}
```

### 4.3 Docker构建失败
**症状**: `docker build`报错
**解决方案**:
1. 检查Dockerfile是否存在
2. 检查基础镜像是否可拉取
3. 清理旧镜像重建：
   ```bash
   docker system prune -f
   ```

### 4.4 部署成功但页面未更新
**症状**: Health检查通过，但页面还是旧版
**原因**: 前端Nginx缓存或部署路径错误

**解决方案**:
1. 强制刷新页面：Ctrl+F5
2. 检查文件是否正确复制：
   ```bash
   cat /opt/wolfpack-dashboard/html/index.html | head -5
   ```
3. 重启Nginx容器：
   ```bash
   docker restart wolfpack-frontend
   ```

### 4.5 Git Push失败
**症状**: `error: failed to push some refs`
**原因**: 远程仓库有更新，本地落后

**解决方案**:
```bash
GIT_SSH_COMMAND="ssh -i ~/.ssh/github_wolfpack -o StrictHostKeyChecking=no" Git pull origin main --rebase
GIT_SSH_COMMAND="ssh -i ~/.ssh/github_wolfpack -o StrictHostKeyChecking=no" Git push origin main
```

### 4.6 Workflow不触发
**症状**: Push后Actions没有新任务
**原因**: 
- workflow文件路径错误
- 分支不匹配
- YAML语法错误

**解决方案**:
1. 确认文件位置：`.github/workflows/auto-deploy.yml`
2. 确认分支：`on: push: branches: [ main ]`
3. 手动触发：GitHub页面 → Actions → 选择workflow → Run workflow

---

## 五、自我检查清单（每次部署前必查）

### 5.1 提交前检查
- [ ] **已执行 `git pull origin main` 同步最新代码**
- [ ] 代码已在本地保存
- [ ] 功能逻辑正确
- [ ] 无敏感信息泄露（密码、Token等）
- [ ] Commit信息清晰（格式：`type: description`）

### 5.2 Push后检查
- [ ] Git push成功无报错
- [ ] GitHub Actions已触发（状态显示黄色/绿色）
- [ ] 等待2-3分钟

### 5.3 部署后验证
- [ ] Health API返回200
- [ ] 页面功能正常
- [ ] 用户确认满意

---

## 六、禁止事项（红线）

1. **禁止直接在服务器修改代码** - 必须通过GitHub Actions部署
2. **禁止手动构建Docker镜像** - 必须由Actions完成
3. **禁止使用root密码登录部署** - 必须使用SSH Key
4. **禁止跳过本地验证直接Push** - 必须确保代码基本正确
5. **禁止保留多个workflow文件** - 只保留auto-deploy.yml
6. **禁止在代码中硬编码敏感信息** - 必须使用Secrets
7. **禁止写死/造假指标数据** - 指标类数据必须真实、持久化、从数据库读取

---

## 七、工程开发约束（强制执行）

### 7.1 数据真实性原则（铁律）
> **指标类数据必须真实、持久化、所有指标数据从数据库读取，禁止写死造假。**

**具体要求：**
- ✅ 所有展示给用户的指标数据必须从数据库读取
- ✅ 系统级指标（CPU/内存/运行时间）必须从操作系统真实获取
- ❌ 禁止在代码中写死任何指标数值（如 `cpuUsage = 35.2`）
- ❌ 禁止使用静态假数据冒充真实业务数据
- ❌ 禁止使用内存缓存替代数据库存储来伪造持久化

**数据来源规范：**
| 指标类型 | 数据来源 | 示例 |
|----------|----------|------|
| 业务数据 | 数据库（JPA/JDBC） | 代理状态、任务进度、执行日志 |
| 系统指标 | `/proc` 文件系统 | CPU使用率、内存使用率 |
| 运行时间 | JVM RuntimeMXBean | 服务启动时间、运行时长 |

**违规后果：** 视为严重工程事故，必须立即重构修复。

### 7.2 外部方案评估原则（工作纪律）
> **当用户发来外部参考方案时，只做对照、方案评估、修改观点建议，等待用户明确回复后再执行。**

**具体要求：**
- ✅ 收到外部方案后，进行对照分析和技术评估
- ✅ 给出明确的修改观点和建议
- ❌ **禁止未经用户确认直接执行修改**
- ❌ **禁止跳过评估环节立即编码**

**执行流程：**
```
用户发来外部方案 → 对照评估 → 给出建议 → 等待确认 → 执行修改
```

**违规后果：** 视为工作流程违规，可能导致返工和资源浪费。

---

## 八、持续改进方向

1. **监控告警**: 部署失败时自动通知（邮件/钉钉/飞书）
2. **回滚机制**: 部署失败自动回滚到上一版本
3. **蓝绿部署**: 零停机时间部署
4. **环境分离**: 区分开发/测试/生产环境
5. **自动化测试**: Push前自动运行单元测试
6. **性能监控**: 部署后自动验证API响应时间

---

## 八、核心记忆锚点

> **"同步→本地→远程→自动→呈现"**
> 
> git pull 同步最新代码，本地验证修改正确，Push到GitHub，Actions自动部署，用户看到结果。
> 
> **核心原则：先拉后推（Pull before Push）**

**当用户说"给我做个功能"时，我的标准回答应该是**：
> "明白，现在先同步最新代码，然后开始编写，预计X分钟后Push，2-3分钟后您可以直接访问页面查看效果。"

---

**文档维护**: 狼头  
**审核**: 老板  
**生效**: 立即执行，替代所有历史方案
