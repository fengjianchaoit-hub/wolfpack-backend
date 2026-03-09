#!/bin/bash
# 狼牙仪表盘紧急部署脚本
# 在服务器上执行: bash deploy-frontend.sh

set -e

echo "=== 狼牙仪表盘部署脚本 ==="
echo "时间: $(date)"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

echo "1. 下载最新构建文件..."
# 从GitHub下载最新dist
curl -sL "https://raw.githubusercontent.com/fengjianchaoit-hub/wolfpack-backend/main/wolfpack-dashboard/dist/index.html" -o index.html || {
    echo "❌ 下载失败，请检查网络或手动上传"
    exit 1
}

# 下载assets（简化版，实际需要递归下载）
mkdir -p assets
curl -sL "https://api.github.com/repos/fengjianchaoit-hub/wolfpack-backend/contents/wolfpack-dashboard/dist/assets" | grep -o '"download_url":"[^"]*"' | cut -d'"' -f4 | while read url; do
    filename=$(basename "$url")
    curl -sL "$url" -o "assets/$filename" &
done
wait

echo "2. 备份旧版本..."
mkdir -p /opt/wolfpack-dashboard/backup
cp -r /opt/wolfpack-dashboard/html/* /opt/wolfpack-dashboard/backup/ 2>/dev/null || true

echo "3. 部署新版本..."
mkdir -p /opt/wolfpack-dashboard/html/assets
rsync -av --delete $TEMP_DIR/ /opt/wolfpack-dashboard/html/

echo "4. 重启Nginx..."
docker restart wolfpack-nginx || docker restart wolfpack-frontend || {
    echo "⚠️ 请手动重启Nginx容器"
}

echo "5. 清理临时文件..."
rm -rf $TEMP_DIR

echo ""
echo "✅ 部署完成！"
echo "访问地址: http://47.84.71.25"
echo ""
echo "如页面未更新，请强制刷新: Ctrl+F5"