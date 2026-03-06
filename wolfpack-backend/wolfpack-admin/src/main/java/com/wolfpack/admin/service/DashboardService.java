package com.wolfpack.admin.service;

import com.wolfpack.admin.entity.Agent;
import com.wolfpack.admin.repository.AgentRepository;
import com.wolfpack.admin.repository.ExecutionLogRepository;
import com.wolfpack.admin.repository.TaskRepository;
import com.wolfpack.admin.util.SystemMetricsCollector;
import com.wolfpack.api.dto.DashboardDTO;
import com.wolfpack.api.enums.AgentStatus;
import com.wolfpack.api.enums.TaskStatus;
import com.wolfpack.api.vo.AgentVO;
import com.wolfpack.api.vo.TaskVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 仪表盘服务 - 真实数据版本
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AgentRepository agentRepository;
    private final TaskRepository taskRepository;
    private final ExecutionLogRepository logRepository;
    private final SystemMetricsCollector metricsCollector;

    public DashboardDTO getDashboardData() {
        DashboardDTO dto = new DashboardDTO();
        dto.setAgentStats(getAgentStats());
        dto.setTaskStats(getTaskStats());
        dto.setSystemStatus(getSystemStatus());
        dto.setUpdateTime(java.time.LocalDateTime.now().toString());
        return dto;
    }

    public List<AgentVO> getAgentList() {
        return agentRepository.findAll().stream()
            .map(this::convertToAgentVO)
            .collect(Collectors.toList());
    }

    public List<TaskVO> getTaskList() {
        return taskRepository.findAll();
    }

    public List<TaskVO> getAllTasks() {
        return getTaskList();
    }

    public List<AgentVO> getAllAgents() {
        return getAgentList();
    }

    public List<Map<String, Object>> getExecutionLogs() {
        return logRepository.findRecent(50).stream()
            .map(log -> {
                Map<String, Object> map = new HashMap<>();
                map.put("time", log.getTime());
                map.put("agent", log.getAgent());
                map.put("action", log.getAction());
                map.put("status", log.getStatus());
                return map;
            })
            .collect(Collectors.toList());
    }

    public Map<String, Object> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "ok");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        health.put("version", "1.0.0");
        health.put("uptime", metricsCollector.getUptime());
        return health;
    }

    // 更新代理状态（供OpenClaw回调使用）
    public void updateAgentStatus(String agentId, AgentStatus status, String statusText) {
        agentRepository.updateStatus(agentId, status, statusText);
        log.info("Updated agent {} status to {}: {}", agentId, status, statusText);
    }

    // 更新任务状态（供OpenClaw回调使用）
    public void updateTaskStatus(String taskId, TaskStatus status) {
        taskRepository.updateStatus(taskId, status);
        log.info("Updated task {} status to {}", taskId, status);
    }

    // 添加执行日志（供OpenClaw回调使用）
    public void addExecutionLog(String agentId, String action, String status, String details) {
        logRepository.addLog(agentId, action, status, details);
    }

    private AgentVO convertToAgentVO(Agent agent) {
        AgentVO vo = new AgentVO();
        vo.setId(agent.getId());
        vo.setName(agent.getName());
        vo.setEmoji(agent.getEmoji());
        vo.setRole(agent.getRole());
        vo.setIsLeader(agent.getIsLeader());
        vo.setStatus(agent.getStatus());
        vo.setStatusText(agent.getStatusText());
        
        // 获取代理的任务列表
        List<TaskVO> tasks = taskRepository.findByAssignee(agent.getName());
        if (tasks != null && !tasks.isEmpty()) {
            vo.setTasks(tasks.stream()
                .map(t -> {
                    AgentVO.TaskItem item = new AgentVO.TaskItem();
                    item.setText(t.getTask());
                    item.setStatus(t.getStatus().name().toLowerCase());
                    return item;
                })
                .collect(Collectors.toList()));
        }
        
        return vo;
    }

    private DashboardDTO.AgentStats getAgentStats() {
        List<Agent> agents = agentRepository.findAll();
        long online = agents.stream().filter(a -> a.getStatus() == AgentStatus.ONLINE).count();
        long busy = agents.stream().filter(a -> a.getStatus() == AgentStatus.BUSY).count();
        DashboardDTO.AgentStats stats = new DashboardDTO.AgentStats();
        stats.setTotal(agents.size());
        stats.setOnline((int) online);
        stats.setBusy((int) busy);
        stats.setOffline(0);
        return stats;
    }

    private DashboardDTO.TaskStats getTaskStats() {
        List<TaskVO> tasks = taskRepository.findAll();
        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long pending = tasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        DashboardDTO.TaskStats stats = new DashboardDTO.TaskStats();
        stats.setTotal(tasks.size());
        stats.setPending((int) pending);
        stats.setInProgress((int) inProgress);
        stats.setCompleted((int) completed);
        stats.setFailed(0);
        return stats;
    }

    private DashboardDTO.SystemStatus getSystemStatus() {
        Map<String, Object> metrics = metricsCollector.getFullSystemStatus();
        DashboardDTO.SystemStatus status = new DashboardDTO.SystemStatus();
        status.setStatus("running");
        status.setUptime((String) metrics.get("uptime"));
        status.setCpuUsage(Double.parseDouble((String) metrics.get("cpuUsage")));
        status.setMemoryUsage(Double.parseDouble((String) metrics.get("memoryUsage")));
        return status;
    }
}
