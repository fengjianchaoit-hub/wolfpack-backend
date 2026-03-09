#!/bin/bash
# 狼牙仪表盘V2.0部署脚本 - 在服务器上执行

echo "=== 狼牙仪表盘V2.0部署 ==="

# 下载最新版本
cd /tmp
wget -q https://raw.githubusercontent.com/fengjianchaoit-hub/wolfpack-backend/main/wolfpack-dashboard-v2.0.tar.gz -O dashboard-v2.tar.gz

# 备份旧版本
mkdir -p /opt/wolfpack-dashboard/backup
cp -r /opt/wolfpack-dashboard/html/* /opt/wolfpack-dashboard/backup/ 2>/dev/null || true

# 部署新版本
rm -rf /opt/wolfpack-dashboard/html/*
tar xzf dashboard-v2.tar.gz -C /opt/wolfpack-dashboard/html --strip-components=1

# 重启Nginx
docker restart wolfpack-nginx 2>/dev/null || docker restart wolfpack-frontend 2>/dev/null

echo "✅ 部署完成！访问: http://47.84.71.25"
echo "如未更新请按 Ctrl+F5 强制刷新"