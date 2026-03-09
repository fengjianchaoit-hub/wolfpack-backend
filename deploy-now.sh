#!/bin/bash
# 狼牙仪表盘V2.0 紧急部署脚本
# 在服务器执行: bash deploy-now.sh

echo "=== 狼牙仪表盘V2.0 紧急部署 ==="

# 1. 下载最新代码
echo "[1/4] 下载代码..."
cd /tmp
rm -rf wolfpack-temp
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no" git clone --depth 1 https://github.com/fengjianchaoit-hub/wolfpack-backend.git wolfpack-temp 2>/dev/null || {
    echo "Git失败，使用curl下载..."
    wget -q https://github.com/fengjianchaoit-hub/wolfpack-backend/archive/refs/heads/main.zip
    unzip -q main.zip
    mv wolfpack-backend-main wolfpack-temp
}

# 2. 备份旧版本
echo "[2/4] 备份旧版本..."
mkdir -p /opt/wolfpack-dashboard/backup-$(date +%Y%m%d-%H%M%S)
cp -r /opt/wolfpack-dashboard/html/* /opt/wolfpack-dashboard/backup-*/ 2>/dev/null || true

# 3. 检查是否有预构建的dist
echo "[3/4] 部署新版本..."
if [ -d "/tmp/wolfpack-temp/wolfpack-dashboard/dist" ]; then
    echo "   使用GitHub上的预构建版本..."
    rm -rf /opt/wolfpack-dashboard/html/*
    cp -r /tmp/wolfpack-temp/wolfpack-dashboard/dist/* /opt/wolfpack-dashboard/html/
else
    echo "   GitHub上没有预构建版本，需要在服务器本地构建..."
    echo "   安装Node.js依赖并构建..."
    cd /tmp/wolfpack-temp/wolfpack-dashboard
    npm install 2>/dev/null
    npm run build 2>/dev/null
    rm -rf /opt/wolfpack-dashboard/html/*
    cp -r dist/* /opt/wolfpack-dashboard/html/
fi

# 4. 重启Nginx
echo "[4/4] 重启Nginx..."
docker restart wolfpack-nginx 2>/dev/null || docker restart wolfpack-frontend 2>/dev/null || {
    docker run -d --name wolfpack-nginx -p 80:80 -v /opt/wolfpack-dashboard/html:/usr/share/nginx/html:ro --restart unless-stopped nginx:alpine
}

# 清理
rm -rf /tmp/wolfpack-temp /tmp/main.zip 2>/dev/null

echo ""
echo "=== 部署完成 ==="
echo "🌐 访问: http://47.84.71.25"
echo "📝 如未更新请按 Ctrl+F5 强制刷新"
echo ""

# 验证
echo "验证中..."
sleep 2
if curl -s http://localhost | grep -q "root"; then
    echo "✅ 部署成功！"
else
    echo "⚠️ 请手动检查"
fi