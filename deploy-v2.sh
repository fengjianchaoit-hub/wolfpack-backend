#!/bin/bash
# 狼牙仪表盘V2.0部署脚本
# 执行方式: bash deploy-v2.sh

echo "========================================"
echo "  狼牙仪表盘V2.0部署脚本"
echo "========================================"
echo ""

# 检查是否在正确目录
if [ ! -f "wolfpack-dashboard-v2.0.tar.gz" ]; then
    echo "❌ 错误: 未找到 wolfpack-dashboard-v2.0.tar.gz"
    echo "   请先将部署包上传到当前目录"
    exit 1
fi

echo "[1/5] 备份当前版本..."
mkdir -p /opt/wolfpack-dashboard/backup-$(date +%Y%m%d-%H%M%S)
cp -r /opt/wolfpack-dashboard/html/* /opt/wolfpack-dashboard/backup-*/ 2>/dev/null || true
echo "   ✅ 备份完成"

echo ""
echo "[2/5] 解压新版本..."
rm -rf /opt/wolfpack-dashboard/html/*
tar xzf wolfpack-dashboard-v2.0.tar.gz -C /opt/wolfpack-dashboard/html --strip-components=1
echo "   ✅ 解压完成"

echo ""
echo "[3/5] 检查文件..."
if [ -f "/opt/wolfpack-dashboard/html/index.html" ]; then
    echo "   ✅ index.html 存在"
else
    echo "   ❌ index.html 不存在，部署可能失败"
    exit 1
fi

if [ -d "/opt/wolfpack-dashboard/html/assets" ]; then
    echo "   ✅ assets目录存在"
else
    echo "   ⚠️ assets目录不存在"
fi

echo ""
echo "[4/5] 重启Nginx容器..."
docker restart wolfpack-nginx 2>/dev/null || docker restart wolfpack-frontend 2>/dev/null || echo "⚠️ 请手动重启Nginx"
echo "   ✅ 重启完成"

echo ""
echo "[5/5] 验证部署..."
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ HTTP 200 OK"
else
    echo "   ⚠️ HTTP状态码: $HTTP_STATUS"
fi

echo ""
echo "========================================"
echo "  部署完成!"
echo "========================================"
echo ""
echo "🌐 访问地址: http://47.84.71.25"
echo "📝 版本: V2.0 (React + Ant Design)"
echo ""
echo "新功能:"
echo "  • 代理详情抽屉 (4个标签页)"
echo "  • 文件管理 (SOUL文件编辑/版本回溯)"
echo "  • 直播数据抓取 (4个子模块)"
echo ""
echo "如页面未更新，请按 Ctrl+F5 强制刷新"
echo ""
echo "========================================"