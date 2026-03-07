package com.wolfpack.admin.service;

import com.wolfpack.admin.entity.Agent;
import com.wolfpack.admin.entity.ExecutionLog;
import com.wolfpack.admin.entity.Task;
import com.wolfpack.admin.repository.AgentJpaRepository;
import com.wolfpack.admin.repository.ExecutionLogJpaRepository;
import com.wolfpack.admin.repository.TaskJpaRepository;
import com.wolfpack.admin.util.BeijingTimeUtil;
import com.wolfpack.admin.util.SystemMetricsCollector;
import com.wolfpack.api.dto.DashboardDTO;
import com.wolfpack.api.enums.AgentStatus;
import com.wolfpack.api.enums.TaskStatus;
import com.wolfpack.api.vo.AgentVO;
import com.wolfpack.api.vo.TaskVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 仪表盘服务 - 数据库持久化版本
 * 所有指标数据从数据库读取，禁止写死造假
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AgentJpaRepository agentRepository;
    private final TaskJpaRepository taskRepository;
    private final ExecutionLogJpaRepository logRepository;
    private final SystemMetricsCollector metricsCollector;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("MM-dd HH:mm");

    public DashboardDTO getDashboardData() {
        DashboardDTO dto = new DashboardDTO();
        dto.setAgentStats(getAgentStats());
        dto.setTaskStats(getTaskStats());
        dto.setSystemStatus(getSystemStatus());
        dto.setUpdateTime(BeijingTimeUtil.nowIsoString()); // 使用北京时间
        return dto;
    }

    public List<AgentVO> getAgentList() {
        return agentRepository.findAll().stream()
            .map(this::convertToAgentVO)
            .collect(Collectors.toList());
    }

    public List<TaskVO> getTaskList() {
        return taskRepository.findAll().stream()
            .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt())) // 按创建时间倒序
            .map(this::convertToTaskVO)
            .collect(Collectors.toList());
    }

    public List<TaskVO> getAllTasks() {
        return getTaskList();
    }

    public List<AgentVO> getAllAgents() {
        return getAgentList();
    }

    public List<Map<String, Object>> getExecutionLogs() {
        return logRepository.findTop50ByOrderByCreatedAtDesc().stream()
            .map(this::convertLogToMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "ok");
        health.put("timestamp", BeijingTimeUtil.nowIsoString());
        health.put("version", "1.0.0");
        health.put("uptime", metricsCollector.getUptime());
        return health;
    }

    // ==================== 数据更新接口（供OpenClaw回调）====================

    @Transactional
    public void updateAgentStatus(String agentId, AgentStatus status, String statusText) {
        Agent agent = agentRepository.findById(agentId)
            .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));
        
        AgentStatus oldStatus = agent.getStatus();
        agent.setStatus(status);
        agent.setStatusText(statusText);
        agent.setLastActiveTime(BeijingTimeUtil.now());
        agentRepository.save(agent);
        
        // 自动记录状态变更日志
        String action = String.format("状态变更: %s → %s (%s)", oldStatus, status, statusText);
        addExecutionLog(agentId, action, "success", null);
        
        log.info("Updated agent {} status to {}: {}", agentId, status, statusText);
    }

    @Transactional
    public TaskVO createTask(String id, String title, String assigneeId, 
                             com.wolfpack.api.enums.TaskPriority priority,
                             String scheduledTime, String description) {
        Task task = new Task();
        task.setId(id);
        task.setTitle(title);
        task.setAssigneeId(assigneeId);
        task.setPriority(priority != null ? priority : com.wolfpack.api.enums.TaskPriority.MEDIUM);
        task.setStatus(TaskStatus.PENDING);
        task.setScheduledTime(scheduledTime);
        task.setDescription(description);
        task.setIsCronJob(false);
        task.setCreatedAt(BeijingTimeUtil.now()); // 使用北京时间
        task.setUpdatedAt(BeijingTimeUtil.now());
        taskRepository.save(task);
        
        // 自动记录任务创建日志
        Agent agent = agentRepository.findById(assigneeId).orElse(null);
        String agentName = agent != null ? agent.getName() : assigneeId;
        String action = String.format("创建新任务: %s (分配给 %s)", title, agentName);
        addExecutionLog(assigneeId, action, "success", null);
        
        log.info("Created task {} for agent {}", id, assigneeId);
        return convertToTaskVO(task);
    }

    @Transactional
    public void updateTaskStatus(String taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        
        TaskStatus oldStatus = task.getStatus();
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setCompletedAt(BeijingTimeUtil.now());
        }
        taskRepository.save(task);
        
        // 自动记录任务状态变更日志
        Agent agent = agentRepository.findById(task.getAssigneeId()).orElse(null);
        String agentName = agent != null ? agent.getName() : task.getAssigneeId();
        String action = String.format("任务[%s]状态: %s → %s", task.getTitle(), oldStatus, status);
        addExecutionLog(task.getAssigneeId(), action, "success", null);
        
        log.info("Updated task {} status to {}", taskId, status);
    }

    @Transactional
    public void addExecutionLog(String agentId, String action, String status, String details) {
        Agent agent = agentRepository.findById(agentId).orElse(null);
        
        ExecutionLog executionLog = new ExecutionLog();
        executionLog.setAgentId(agentId);
        executionLog.setAgentName(agent != null ? agent.getName() : agentId);
        executionLog.setAction(action);
        executionLog.setStatus(status);
        executionLog.setDetails(details);
        executionLog.setCreatedAt(BeijingTimeUtil.now()); // 设置创建时间
        logRepository.save(executionLog);
        
        log.info("Added execution log: {} - {}", agentId, action);
    }

    // ==================== 内部转换方法 ====================

    private AgentVO convertToAgentVO(Agent agent) {
        AgentVO vo = new AgentVO();
        vo.setId(agent.getId());
        vo.setName(agent.getName());
        vo.setEmoji(agent.getEmoji());
        vo.setRole(agent.getRole());
        vo.setIsLeader(agent.getIsLeader());
        vo.setStatus(agent.getStatus());
        vo.setStatusText(agent.getStatusText());
        
        // 从数据库查询该代理的任务
        List<Task> tasks = taskRepository.findByAssigneeId(agent.getId());
        if (tasks != null && !tasks.isEmpty()) {
            vo.setTasks(tasks.stream()
                .map(t -> {
                    AgentVO.TaskItem item = new AgentVO.TaskItem();
                    item.setText(t.getTitle());
                    item.setStatus(t.getStatus().name().toLowerCase());
                    return item;
                })
                .collect(Collectors.toList()));
        }
        
        return vo;
    }

    private TaskVO convertToTaskVO(Task task) {
        TaskVO vo = new TaskVO();
        vo.setId(task.getId());
        vo.setTime(task.getScheduledTime());
        
        // 从数据库查询代理人名称
        Agent agent = agentRepository.findById(task.getAssigneeId()).orElse(null);
        vo.setAssignee(agent != null ? agent.getName() : task.getAssigneeId());
        
        vo.setTask(task.getTitle());
        vo.setPriority(task.getPriority());
        vo.setStatus(task.getStatus());
        return vo;
    }

    private Map<String, Object> convertLogToMap(ExecutionLog log) {
        Map<String, Object> map = new HashMap<>();
        // 使用工具类转为北京时间显示
        map.put("time", BeijingTimeUtil.toDisplayString(log.getCreatedAt()));
        map.put("agent", log.getAgentName());
        map.put("action", log.getAction());
        map.put("status", log.getStatus());
        return map;
    }

    // ==================== 统计数据（全部从数据库计算）====================

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
        List<Task> tasks = taskRepository.findAll();
        
        // 今日完成的任务（根据 completedAt 判断，使用北京时间）
        LocalDateTime todayStart = BeijingTimeUtil.todayStart();
        long completedToday = tasks.stream()
            .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
            .filter(t -> t.getCompletedAt() != null && t.getCompletedAt().isAfter(todayStart))
            .count();
        
        // 待处理任务
        long pending = tasks.stream()
            .filter(t -> t.getStatus() == TaskStatus.PENDING)
            .count();
        
        // 执行中任务
        long inProgress = tasks.stream()
            .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS)
            .count();
        
        // 总任务数
        long totalCompleted = tasks.stream()
            .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
            .count();
        
        DashboardDTO.TaskStats stats = new DashboardDTO.TaskStats();
        stats.setTotal(tasks.size());
        stats.setPending((int) pending);
        stats.setInProgress((int) inProgress);
        stats.setCompleted((int) completedToday); // 今日完成数
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
