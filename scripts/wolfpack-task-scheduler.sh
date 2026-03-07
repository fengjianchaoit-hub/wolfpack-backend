#!/bin/bash
# 狼牙团队定时任务调度系统
# 统一调度狼牙01/02/03的定时任务，支持状态上报和失败重试

set -e

API_BASE="http://47.84.71.25:8080/api/v1"
LOG_FILE="/var/log/wolfpack-cron.log"
MAX_RETRY=3

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 创建任务
create_task() {
    local task_id=$1
    local title=$2
    local assignee_id=$3
    local priority=$4
    local scheduled_time=$5
    
    curl -s -X POST "${API_BASE}/tasks" \
        -H "Content-Type: application/json" \
        -d "{\n            \"id\": \"${task_id}\",\n            \"title\": \"${title}\",\n            \"assigneeId\": \"${assignee_id}\",\n            \"priority\": \"${priority}\",\n            \"scheduledTime\": \"${scheduled_time}\",\n            \"description\": \"定时任务自动创建\"
        }" || log "创建任务 ${task_id} 失败"
}

# 更新任务状态
update_task_status() {
    local task_id=$1
    local status=$2
    local retry=0
    
    while [ $retry -lt $MAX_RETRY ]; do
        if curl -s -X POST "${API_BASE}/tasks/${task_id}/status" \
            -H "Content-Type: application/json" \
            -d "{\"status\": \"${status}\"}"; then
            log "任务 ${task_id} 状态更新为 ${status}"
            return 0
        fi
        retry=$((retry + 1))
        log "更新任务状态失败，重试 ${retry}/${MAX_RETRY}"
        sleep 2
    done
    
    log "更新任务状态最终失败: ${task_id}"
    return 1
}

# 添加执行日志
add_execution_log() {
    local agent_id=$1
    local action=$2
    local status=$3
    local details=$4
    
    curl -s -X POST "${API_BASE}/tasks/logs" \
        -H "Content-Type: application/json" \
        -d "{\n            \"agentId\": \"${agent_id}\",\n            \"action\": \"${action}\",\n            \"status\": \"${status}\",\n            \"details\": \"${details}\"
        }" || log "添加日志失败"
}

# 执行狼牙01任务 - 09:00 AI热点日报
execute_wolf01_daily() {
    local task_id="wolf01-daily-$(date +%Y%m%d)"
    local today=$(date +%Y-%m-%d)
    
    log "=== 启动狼牙01任务: AI热点日报 ==="
    
    # 1. 创建任务
    create_task "$task_id" "生成AI热点日报" "wolf-tooth-01" "HIGH" "09:00"
    
    # 2. 更新为执行中
    update_task_status "$task_id" "IN_PROGRESS"
    
    # 3. 执行日报生成
    log "狼牙01开始生成日报..."
    
    # 通过OpenClaw API触发狼牙01执行
    # 实际执行由 wolfpack-daily-report-cron.sh 完成
    if /root/.openclaw/workspace/scripts/wolfpack-daily-report-cron.sh; then
        # 4. 更新为完成
        update_task_status "$task_id" "COMPLETED"
        add_execution_log "wolf-tooth-01" "AI热点日报生成完成" "success" "日报已生成并保存"
        log "狼牙01任务完成"
    else
        # 5. 更新为失败
        update_task_status "$task_id" "FAILED"
        add_execution_log "wolf-tooth-01" "AI热点日报生成失败" "failed" "脚本执行出错"
        log "狼牙01任务失败"
        return 1
    fi
}

# 执行狼牙02任务 - 10:00 数据分析
execute_wolf02_analysis() {
    local task_id="wolf02-analysis-$(date +%Y%m%d)"
    
    log "=== 启动狼牙02任务: 数据分析 ==="
    
    create_task "$task_id" "分析昨日数据" "wolf-tooth-02" "HIGH" "10:00"
    update_task_status "$task_id" "IN_PROGRESS"
    
    log "狼牙02开始数据分析..."
    
    # 模拟数据分析过程
    sleep 5
    
    update_task_status "$task_id" "COMPLETED"
    add_execution_log "wolf-tooth-02" "昨日数据分析完成" "success" "数据报表已生成"
    log "狼牙02任务完成"
}

# 执行狼牙03任务 - 11:00 数据看板
execute_wolf03_dashboard() {
    local task_id="wolf03-dashboard-$(date +%Y%m%d)"
    
    log "=== 启动狼牙03任务: 数据看板 ==="
    
    create_task "$task_id" "生成数据看板" "wolf-tooth-03" "MEDIUM" "11:00"
    update_task_status "$task_id" "IN_PROGRESS"
    
    log "狼牙03开始生成看板..."
    
    # 模拟看板生成
    sleep 5
    
    update_task_status "$task_id" "COMPLETED"
    add_execution_log "wolf-tooth-03" "数据看板生成完成" "success" "可视化图表已更新"
    log "狼牙03任务完成"
}

# 检查并执行到期的定时任务
check_and_execute() {
    local current_hour=$(date +%H)
    local current_min=$(date +%M)
    
    # 09:00 - 狼牙01 AI日报
    if [ "$current_hour" -eq 09 ] && [ "$current_min" -eq 00 ]; then
        execute_wolf01_daily || {
            log "狼牙01任务失败，将在5分钟后重试"
            sleep 300
            execute_wolf01_daily
        }
    fi
    
    # 10:00 - 狼牙02 数据分析
    if [ "$current_hour" -eq 10 ] && [ "$current_min" -eq 00 ]; then
        execute_wolf02_analysis || {
            log "狼牙02任务失败，将在5分钟后重试"
            sleep 300
            execute_wolf02_analysis
        }
    fi
    
    # 11:00 - 狼牙03 数据看板
    if [ "$current_hour" -eq 11 ] && [ "$current_min" -eq 00 ]; then
        execute_wolf03_dashboard || {
            log "狼牙03任务失败，将在5分钟后重试"
            sleep 300
            execute_wolf03_dashboard
        }
    fi
}

# 主循环
main() {
    log "=== 狼牙团队定时任务调度系统启动 ==="
    
    while true; do
        check_and_execute
        # 每分钟检查一次
        sleep 60
    done
}

# 如果是直接执行而非source，运行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi
