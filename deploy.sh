#!/bin/bash
# 狼牙仪表盘部署脚本 - 在服务器上执行

echo "=== 狼牙仪表盘部署 ==="

# 下载并解压
cd /tmp
wget -O dashboard-dist.tar.gz "https://raw.githubusercontent.com/fengjianchaoit-hub/wolfpack-backend/main/dashboard-dist.tar.gz" 2>/dev/null || echo "请手动上传 dashboard-dist.tar.gz 到 /tmp/"

# 解压
mkdir -p /opt/wolfpack-dashboard/html
tar xzf dashboard-dist.tar.gz -C /opt/wolfpack-dashboard/html --strip-components=1

# 重启Nginx
docker restart wolfpack-frontend 2>/dev/null || docker run -d \
    --name wolfpack-frontend \
    -p 80:80 \
    -v /opt/wolfpack-dashboard/html:/usr/share/nginx/html:ro \
    --restart unless-stopped \
    nginx:alpine

echo "✅ 部署完成，访问: http://47.84.71.25"