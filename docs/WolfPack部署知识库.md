# WolfPack 部署知识库
**创建时间**: 2026-03-06
**用途**: 前后端部署标准化流程 + GitHub Actions配置参考
**状态**: 待完善（当前后端部署进行中）

---

## 📌 当前任务状态

### 前端部署（wolfpack-dashboard）
| 项目 | 状态 | 备注 |
|------|------|------|
| GitHub仓库 | ✅ 已创建 | https://github.com/fengjianchaoit-hub/wolfpack-dashboard |
| GitHub Pages | ✅ 已启用 | 自动部署 |
| 访问地址 | ⚠️ 待定 | 需要确认 |
| 代码同步 | ✅ 已完成 | 已push到main分支 |

### 后端部署（wolfpack-backend）
| 项目 | 状态 | 备注 |
|------|------|------|
| GitHub仓库 | ✅ 已创建 | https://github.com/fengjianchaoit-hub/wolfpack-backend |
| Actions配置 | ✅ 已完成 | 工作流文件已配置 |
| Secrets | ✅ 已设置 | 4个密钥已配置 |
| 代码推送 | ⏳ 等待网络 | 本地已就绪，网络恢复后推送 |
| 服务器部署 | ⏳ 等待推送 | 47.84.71.25 等待Actions自动部署 |
| 上线验证 | ⏳ 等待部署 | http://wolfpack.hk |

---

## 🔧 GitHub Actions配置模板

### 后端Java项目（Spring Boot）

#### 1. 仓库创建
- **名称**: `项目名-backend`
- **类型**: Private（推荐）
- **初始化**: 勾选 README

#### 2. Actions权限配置
路径: `Settings → Actions → General`

选择:
```
✅ Allow fengjianchaoit-hub, and select non-fengjianchaoit-hub, actions and reusable workflows
```

勾选:
```
✅ Allow actions created by GitHub
✅ Allow actions by Marketplace verified creators
```

#### 3. Secrets配置
路径: `Settings → Secrets and variables → Actions → New repository secret`

| Secret名称 | 值 | 说明 |
|------------|-----|------|
| `SERVER_HOST` | `47.84.71.25` | 服务器IP |
| `SERVER_USER` | `root` | SSH用户名 |
| `SERVER_PASSWORD` | `xxx` | SSH密码 |
| `SERVER_PORT` | `22` | SSH端口 |

#### 4. 工作流文件
路径: `.github/workflows/deploy.yml`

```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      # ⚠️ 注意：根据实际目录结构调整cd路径
      - run: cd 项目名 && mvn clean package -DskipTests
      
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          password: ${{ secrets.SERVER_PASSWORD }}
          script: |
            cd /opt
            git clone https://github.com/用户名/项目名-backend.git || true
            cd 项目名-backend
            mvn clean package -DskipTests
            pkill -f java-app || true
            nohup java -jar target/*.jar > app.log 2>&1 &
```

#### 5. 触发部署
创建触发文件:
```bash
echo "trigger" > trigger.txt
git add trigger.txt
git commit -m "trigger: deploy"
git push origin main
```

或在GitHub网页:
1. Create new file → `trigger.txt`
2. 内容: `trigger deploy`
3. Commit new file

---

## 📋 部署检查清单

### 后端Java项目

#### 本地准备阶段
- [ ] Maven多模块结构正确
- [ ] 父pom.xml包含dependencyManagement
- [ ] 所有子模块依赖有版本号
- [ ] Lombok版本显式声明
- [ ] 工作流文件在 `.github/workflows/`（仓库根目录）

#### GitHub配置阶段
- [ ] 仓库已创建（Private/Public）
- [ ] Actions权限已启用
- [ ] 4个Secrets已配置
- [ ] 工作流文件已提交

#### 部署验证阶段
- [ ] Actions运行成功（绿色✓）
- [ ] 服务器进程已启动 `ps aux | grep java`
- [ ] 健康检查通过 `curl http://localhost:8080/health`
- [ ] Nginx配置正确
- [ ] 域名可访问 `curl http://域名/health`

---

## ⚠️ 常见问题速查

### Q1: Actions不运行
**检查**: Settings → Actions → General → 权限是否启用

### Q2: "There are no workflow runs to show"
**原因**: 1) 权限未启用 2) 工作流文件路径错误
**解决**: 确认工作流在仓库根目录的`.github/workflows/`

### Q3: Maven编译失败"package lombok does not exist"
**解决**: 子模块pom.xml显式添加Lombok版本
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.30</version>
</dependency>
```

### Q4: "The goal you specified requires a project to execute but there is no POM"
**原因**: Actions中的cd路径不对
**解决**: 根据实际目录结构调整，如`cd wolfpack-backend/wolfpack-backend`

### Q5: Token权限不足，无法修改工作流
**解决**: 直接在GitHub网页编辑工作流文件（绕过Token限制）

---

## 📝 本次部署记录（2026-03-06）

### 已完成的配置
1. ✅ GitHub仓库: wolfpack-backend (Private)
2. ✅ Actions权限: 已启用
3. ✅ Secrets: 4个密钥已配置
4. ✅ 工作流文件: deploy.yml 已配置
5. ✅ Maven配置: Lombok版本已修复
6. ✅ 本地代码: 已提交待推送

### 待完成
- ⏳ 网络恢复后推送代码
- ⏳ Actions自动部署
- ⏳ 验证 http://wolfpack.hk

### 本次踩过的坑
1. **仓库混淆**: 前端/后端仓库看错，导致沟通错位
2. **Actions权限**: 私有仓库默认禁用，需手动启用
3. **工作流路径**: 代码嵌套两层，cd路径需调整
4. **Lombok版本**: 子模块需显式声明版本号
5. **Token权限**: 修改工作流需要workflow scope
6. **触发方式**: 仅改工作流不触发，需创建新commit

---

## 🔗 重要链接

| 资源 | 链接 |
|------|------|
| 前端仓库 | https://github.com/fengjianchaoit-hub/wolfpack-dashboard |
| 后端仓库 | https://github.com/fengjianchaoit-hub/wolfpack-backend |
| 后端Actions | https://github.com/fengjianchaoit-hub/wolfpack-backend/actions |
| 服务器 | 47.84.71.25 |
| 域名 | wolfpack.hk |
| 复盘文档 | /docs/复盘_20260306_Java后端部署.md |
| 代码检查 | /docs/本地代码检查报告_20260306.md |

---

**下次部署时，首先阅读本文档！**