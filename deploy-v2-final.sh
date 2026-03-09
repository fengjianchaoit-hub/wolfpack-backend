#!/bin/bash
# 狼牙仪表盘V2.0 一键部署脚本
# 在服务器执行: bash deploy-v2-final.sh

set -e

echo "=== 狼牙仪表盘V2.0 部署 ==="
echo ""

# 下载最新代码
echo "[1/4] 下载最新代码..."
cd /tmp
rm -rf wolfpack-deploy
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no" git clone --depth 1 https://github.com/fengjianchaoit-hub/wolfpack-backend.git wolfpack-deploy 2>/dev/null || {
    echo "Git失败，尝试wget下载..."
    wget -q https://github.com/fengjianchaoit-hub/wolfpack-backend/archive/refs/heads/main.zip -O wolfpack.zip 2>/dev/null
    unzip -q wolfpack.zip
    mv wolfpack-backend-main wolfpack-deploy
}

echo "[2/4] 备份旧版本..."
mkdir -p /opt/wolfpack-dashboard/backup-$(date +%Y%m%d-%H%M%S)
cp -r /opt/wolfpack-dashboard/html/* /opt/wolfpack-dashboard/backup-*/ 2>/dev/null || true

echo "[3/4] 部署新版本..."
rm -rf /opt/wolfpack-dashboard/html/*

# 如果前端已构建，直接复制
if [ -d "/tmp/wolfpack-deploy/wolfpack-dashboard/dist" ]; then
    cp -r /tmp/wolfpack-deploy/wolfpack-dashboard/dist/* /opt/wolfpack-dashboard/html/
    echo "   使用预构建版本"
else
    # 需要本地构建
    echo "   本地构建前端..."
    cd /tmp/wolfpack-deploy/wolfpack-dashboard
    npm install >/dev/null 2>&1
    npm run build >/dev/null 2>&1
    cp -r dist/* /opt/wolfpack-dashboard/html/
fi

echo "[4/4] 重启Nginx..."
docker restart wolfpack-nginx 2>/dev/null || docker restart wolfpack-frontend 2>/dev/null || {
    docker run -d --name wolfpack-nginx -p 80:80 -v /opt/wolfpack-dashboard/html:/usr/share/nginx/html:ro --restart unless-stopped nginx:alpine
}

# 清理
rm -rf /tmp/wolfpack-deploy /tmp/wolfpack.zip 2>/dev/null || true

echo ""
echo "=== 部署完成 ==="
echo "🌐 访问: http://47.84.71.25"
echo "📝 版本: V2.0 (React + Ant Design)"
echo ""
echo "新功能:"
echo "  • 7个导航菜单"
echo "  • 4个可点击KPI卡片"
echo "  • 代理详情抽屉"
echo "  • 文件管理(SOUL编辑)"
echo "  • 直播数据抓取"
echo ""
echo "如页面未更新，请按 Ctrl+F5 强制刷新"