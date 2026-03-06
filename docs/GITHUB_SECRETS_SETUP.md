## GitHub Actions Secrets 配置清单

访问：https://github.com/fengjianchaoit-hub/wolfpack-backend/settings/secrets/actions

需要添加以下 Secrets：

| Secret Name | Value | 说明 |
|-------------|-------|------|
| `SERVER_HOST` | `47.84.71.25` | 服务器IP |
| `SERVER_USER` | `root` | SSH用户名 |
| `SERVER_SSH_KEY` | **服务器私钥完整内容** | 用于SSH连接 |

### 获取 SERVER_SSH_KEY 的方法：

在服务器执行：
```bash
cat ~/.ssh/id_ed25519
```

复制输出的全部内容（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`）

粘贴到 GitHub Secrets 中，命名为 `SERVER_SSH_KEY`
