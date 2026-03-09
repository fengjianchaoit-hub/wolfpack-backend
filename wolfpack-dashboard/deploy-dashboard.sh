#!/bin/bash
# 狼牙仪表盘手动部署脚本
# 在服务器上执行: bash deploy-dashboard.sh

set -e

echo "=== 狼牙仪表盘手动部署 ==="
echo "时间: $(date)"

# 创建目录
echo "1. 创建部署目录..."
mkdir -p /opt/wolfpack-dashboard/html/assets

# 检查本地构建产物
if [ ! -f "index.html" ]; then
    echo "❌ 错误: index.html 不存在"
    echo "请先在本地执行: npm run build"
    exit 1
fi

echo "2. 复制文件到部署目录..."
cp index.html /opt/wolfpack-dashboard/html/
cp -r assets/* /opt/wolfpack-dashboard/html/assets/ 2>/dev/null || true

echo "3. 检查Nginx容器..."
if docker ps | grep -q wolfpack-frontend; then
    echo "   重启Nginx容器..."
    docker restart wolfpack-frontend
else
    echo "   启动Nginx容器..."
    docker run -d \
        --name wolfpack-frontend \
        -p 80:80 \
        -v /opt/wolfpack-dashboard/html:/usr/share/nginx/html:ro \
        --restart unless-stopped \
        nginx:alpine
fi

echo "4. 验证部署..."
sleep 2
if curl -s http://localhost | grep -q "wolfpack"; then
    echo "✅ 部署成功!"
    echo "   访问地址: http://47.84.71.25"
else
    echo "⚠️ 部署可能有问题，请检查"
fi

echo ""
echo "=== 部署完成 ==="