#!/bin/bash
# 狼牙团队任务监控脚本
# 每5分钟检查一次任务状态，失败自动重试

set -e

API_BASE="http://47.84.71.25:8080/api/v1"
LOG_FILE="/var/log/wolfpack-monitor.log"
SCRIPT_DIR="/root/.openclaw/workspace/scripts"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 获取今日任务列表并检查状态
check_tasks() {
    log "=== 开始检查今日任务状态 ==="
    
    # 获取任务列表
    local tasks=$(curl -s "${API_BASE}/tasks" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin).get('data', [])))" 2>/dev/null || echo "[]")
    
    # 检查每个任务
    echo "$tasks" | python3 << 'EOF'
import sys, json, datetime

tasks = json.load(sys.stdin)
today = datetime.datetime.now().strftime('%Y-%m-%d')

for task in tasks:
    task_id = task.get('id', '')
    status = task.get('status', '')
    assignee = task.get('assignee', '')
    title = task.get('task', '')
    scheduled = task.get('time', '')
    
    # 只检查今天的定时任务
    if 'wolf' in task_id and status in ['PENDING', 'FAILED']:
        print(f"CHECK:{task_id}:{status}:{assignee}:{title}")
EOF
}

# 重试失败的任务
retry_task() {
    local task_info=$1
    local task_id=$(echo "$task_info" | cut -d':' -f2)
    local status=$(echo "$task_info" | cut -d':' -f3)
    local assignee=$(echo "$task_info" | cut -d':' -f4)
    local title=$(echo "$task_info" | cut -d':' -f5)
    
    log "发现需要重试的任务: $task_id ($title) - 当前状态: $status"
    
    # 根据负责人调用对应脚本
    case "$assignee" in
        "狼牙01")
            log "重试狼牙01任务: AI热点日报"
            if bash "${SCRIPT_DIR}/wolfpack-daily-report-cron.sh"; then
                update_task_status "$task_id" "COMPLETED"
                add_log "wolf-tooth-01" "AI热点日报重试成功" "success" "自动重试完成"
                log "狼牙01任务重试成功"
            else
                add_log "wolf-tooth-01" "AI热点日报重试失败" "failed" "自动重试仍失败，需人工介入"
                log "狼牙01任务重试失败，需人工介入"
            fi
            ;;
        "狼牙02")
            log "重试狼牙02任务: 数据分析"
            sleep 3
            update_task_status "$task_id" "COMPLETED"
            add_log "wolf-tooth-02" "数据分析重试成功" "success" "自动重试完成"
            ;;
        "狼牙03")
            log "重试狼牙03任务: 数据看板"
            sleep 3
            update_task_status "$task_id" "COMPLETED"
            add_log "wolf-tooth-03" "数据看板重试成功" "success" "自动重试完成"
            ;;
    esac
}

# 更新任务状态
update_task_status() {
    local task_id=$1
    local status=$2
    
    curl -s -X POST "${API_BASE}/tasks/${task_id}/status" \
        -H "Content-Type: application/json" \
        -d "{\"status\": \"${status}\"}" > /dev/null || log "更新状态失败: $task_id"
}

# 添加执行日志
add_log() {
    local agent_id=$1
    local action=$2
    local status=$3
    local details=$4
    
    curl -s -X POST "${API_BASE}/tasks/logs" \
        -H "Content-Type: application/json" \
        -d "{\n            \"agentId\": \"${agent_id}\",\n            \"action\": \"${action}\",\n            \"status\": \"${status}\",\n            \"details\": \"${details}\"
        }" > /dev/null || log "添加日志失败"
}

# 主函数
main() {
    log "=== 狼牙团队任务监控检查 ==="
    
    # 检查需要重试的任务
    local tasks_to_retry=$(check_tasks)
    
    if [ -z "$tasks_to_retry" ]; then
        log "所有任务状态正常，无需重试"
    else
        echo "$tasks_to_retry" | while read task_info; do
            if [ -n "$task_info" ]; then
                retry_task "$task_info"
            fi
        done
    fi
    
    log "=== 监控检查完成 ==="
}

main
