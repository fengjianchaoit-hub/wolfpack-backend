package com.wolfpack.admin.service;

import com.wolfpack.api.dto.DashboardDTO;
import com.wolfpack.api.enums.AgentStatus;
import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import com.wolfpack.api.vo.AgentVO;
import com.wolfpack.api.vo.TaskVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DashboardService {

    private static final LocalDateTime SYSTEM_START_TIME = LocalDateTime.now().minusHours(72).minusMinutes(15);
    private List<TaskVO> taskCache = new ArrayList<>();
    
    public DashboardService() { initTasks(); }

    private void initTasks() {
        TaskVO t1 = new TaskVO(); t1.setId("task-001"); t1.setTime("09:00"); t1.setAssignee("狼牙01"); t1.setTask("AI热点日报生成"); t1.setPriority(TaskPriority.HIGH); t1.setStatus(TaskStatus.COMPLETED); taskCache.add(t1);
        TaskVO t2 = new TaskVO(); t2.setId("task-002"); t2.setTime("10:00"); t2.setAssignee("狼牙02"); t2.setTask("抖音直播数据检查"); t2.setPriority(TaskPriority.HIGH); t2.setStatus(TaskStatus.COMPLETED); taskCache.add(t2);
        TaskVO t3 = new TaskVO(); t3.setId("task-003"); t3.setTime("14:00"); t3.setAssignee("狼头"); t3.setTask("仪表盘部署上线"); t3.setPriority(TaskPriority.HIGH); t3.setStatus(TaskStatus.IN_PROGRESS); taskCache.add(t3);
        TaskVO t4 = new TaskVO(); t4.setId("task-004"); t4.setTime("09:00"); t4.setAssignee("狼牙01"); t4.setTask("生成AI热点日报"); t4.setPriority(TaskPriority.HIGH); t4.setStatus(TaskStatus.PENDING); taskCache.add(t4);
        TaskVO t5 = new TaskVO(); t5.setId("task-005"); t5.setTime("10:00"); t5.setAssignee("狼牙02"); t5.setTask("分析昨日直播数据（含行为洞察）"); t5.setPriority(TaskPriority.HIGH); t5.setStatus(TaskStatus.PENDING); taskCache.add(t5);
        TaskVO t6 = new TaskVO(); t6.setId("task-006"); t6.setTime("11:00"); t6.setAssignee("狼牙03"); t6.setTask("生成数据看板（含视觉重点）"); t6.setPriority(TaskPriority.MEDIUM); t6.setStatus(TaskStatus.PENDING); taskCache.add(t6);
    }

    public DashboardDTO getDashboardData() {
        DashboardDTO dto = new DashboardDTO();
        dto.setAgentStats(getAgentStats());
        dto.setTaskStats(getTaskStats());
        dto.setSystemStatus(getSystemStatus());
        dto.setUpdateTime(LocalDateTime.now().toString());
        return dto;
    }

    public List<AgentVO> getAgentList() {
        List<AgentVO> agents = new ArrayList<>();
        boolean leaderBusy = taskCache.stream().filter(t -> t.getAssignee().equals("狼头")).anyMatch(t -> t.getStatus() == TaskStatus.IN_PROGRESS);
        AgentVO leader = new AgentVO(); leader.setId("wolf-head"); leader.setName("狼头"); leader.setEmoji("🔥"); leader.setRole("团队负责人"); leader.setIsLeader(true); leader.setStatus(leaderBusy ? AgentStatus.BUSY : AgentStatus.ONLINE); leader.setStatusText(leaderBusy ? "在线 - 统筹管理中" : "在线 - 正常运行"); agents.add(leader);
        AgentVO a1 = new AgentVO(); a1.setId("wolf-tooth-01"); a1.setName("狼牙01"); a1.setEmoji("📝"); a1.setRole("文案编辑"); a1.setIsLeader(false); a1.setStatus(AgentStatus.ONLINE); a1.setStatusText("待命 - 等待明日任务"); agents.add(a1);
        AgentVO a2 = new AgentVO(); a2.setId("wolf-tooth-02"); a2.setName("狼牙02"); a2.setEmoji("📊"); a2.setRole("数据分析"); a2.setIsLeader(false); a2.setStatus(AgentStatus.ONLINE); a2.setStatusText("待命 - 等待明日任务"); agents.add(a2);
        AgentVO a3 = new AgentVO(); a3.setId("wolf-tooth-03"); a3.setName("狼牙03"); a3.setEmoji("📈"); a3.setRole("可视化"); a3.setIsLeader(false); a3.setStatus(AgentStatus.ONLINE); a3.setStatusText("待命 - 等待明日任务"); agents.add(a3);
        return agents;
    }

    public List<TaskVO> getTaskList() { return new ArrayList<>(taskCache); }
    
    public List<Map<String, Object>> getExecutionLogs() {
        List<Map<String, Object>> logs = new ArrayList<>();
        Map<String, Object> log1 = new HashMap<>(); log1.put("time", "15:07"); log1.put("agent", "狼头"); log1.put("action", "创建狼牙03"); log1.put("status", "success"); logs.add(log1);
        Map<String, Object> log2 = new HashMap<>(); log2.put("time", "14:30"); log2.put("agent", "狼头"); log2.put("action", "仪表盘前端部署"); log2.put("status", "success"); logs.add(log2);
        Map<String, Object> log3 = new HashMap<>(); log3.put("time", "10:15"); log3.put("agent", "狼牙02"); log3.put("action", "抖音直播数据检查完成"); log3.put("status", "success"); logs.add(log3);
        Map<String, Object> log4 = new HashMap<>(); log4.put("time", "09:30"); log4.put("agent", "狼牙01"); log4.put("action", "AI热点日报生成完成"); log4.put("status", "success"); logs.add(log4);
        return logs;
    }

    public Map<String, Object> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "ok"); health.put("timestamp", LocalDateTime.now().toString()); health.put("version", "1.0.0"); health.put("uptime", calculateUptime());
        return health;
    }

    private DashboardDTO.AgentStats getAgentStats() {
        List<AgentVO> agents = getAgentList();
        long online = agents.stream().filter(a -> a.getStatus() == AgentStatus.ONLINE).count();
        long busy = agents.stream().filter(a -> a.getStatus() == AgentStatus.BUSY).count();
        DashboardDTO.AgentStats stats = new DashboardDTO.AgentStats();
        stats.setTotal(agents.size()); stats.setOnline((int) online); stats.setBusy((int) busy); stats.setOffline(0);
        return stats;
    }

    private DashboardDTO.TaskStats getTaskStats() {
        long completed = taskCache.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long pending = taskCache.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();
        long inProgress = taskCache.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        DashboardDTO.TaskStats stats = new DashboardDTO.TaskStats();
        stats.setTotal(taskCache.size()); stats.setPending((int) pending); stats.setInProgress((int) inProgress); stats.setCompleted((int) completed); stats.setFailed(0);
        return stats;
    }

    private DashboardDTO.SystemStatus getSystemStatus() {
        DashboardDTO.SystemStatus status = new DashboardDTO.SystemStatus();
        status.setStatus("running"); status.setUptime(calculateUptime()); status.setCpuUsage(35.2); status.setMemoryUsage(42.8);
        return status;
    }
    
    private String calculateUptime() {
        Duration duration = Duration.between(SYSTEM_START_TIME, LocalDateTime.now());
        long hours = duration.toHours(); long minutes = duration.toMinutes() % 60;
        return hours + "h " + minutes + "m";
    }
}
