#!/bin/bash
# 抖音直播间数据抓取 - 自动化脚本
# 用法: ./douyin_auto_grab.sh [room_id]

ROOM_ID="${1:-444502128478}"
WORK_DIR="/root/.openclaw/workspace"
LOG_FILE="$WORK_DIR/douyin_grab_$(date +%Y%m%d).log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始抖音直播间抓取任务" | tee -a "$LOG_FILE"
echo "直播间: $ROOM_ID" | tee -a "$LOG_FILE"

cd "$WORK_DIR"

# 检查依赖
if ! command -v python3 &> /dev/null; then
    echo "错误: 未安装 Python3" | tee -a "$LOG_FILE"
    exit 1
fi

# 运行抓取脚本
python3 douyin_grabber_api.py --room "$ROOM_ID" 2>&1 | tee -a "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 抓取任务结束" | tee -a "$LOG_FILE"
