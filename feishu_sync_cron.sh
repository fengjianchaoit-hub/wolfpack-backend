#!/bin/bash
# -*- coding: utf-8 -*-
# Kimi-飞书同步定时任务脚本
# 每10分钟执行一次

# 设置工作目录
WORKSPACE="/root/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/feishu_sync_cron.log"

# 确保日志目录存在
mkdir -p "$WORKSPACE/logs"

# 记录开始时间
echo "========================================" >> "$LOG_FILE"
echo "【定时同步】$(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "[错误] Python3 未安装" >> "$LOG_FILE"
    exit 1
fi

# 执行同步脚本
cd "$WORKSPACE"
python3 sync_to_feishu.py >> "$LOG_FILE" 2>&1
SYNC_RESULT=$?

# 记录结果
if [ $SYNC_RESULT -eq 0 ]; then
    echo "[成功] 同步任务完成" >> "$LOG_FILE"
else
    echo "[警告] 同步任务可能失败，退出码: $SYNC_RESULT" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"

# 保留最近7天的日志
if [ -f "$LOG_FILE" ]; then
    # 使用tail保留最后1000行
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

exit $SYNC_RESULT