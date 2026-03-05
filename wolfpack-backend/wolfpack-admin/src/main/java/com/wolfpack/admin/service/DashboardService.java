package com.wolfpack.admin.service;

import com.wolfpack.api.dto.DashboardDTO;
import com.wolfpack.api.enums.AgentStatus;
import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import com.wolfpack.api.vo.AgentVO;
import com.wolfpack.api.vo.TaskVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DashboardService {

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
        
        // 狼头
        AgentVO leader = new AgentVO();
        leader.setId("wolf-head");
        leader.setName("狼头");
        leader.setEmoji("🐺");
        leader.setRole("团队负责人");
        leader.setIsLeader(true);
        leader.setStatus(AgentStatus.ONLINE);
        leader.setStatusText("在线 - 正常运行");
        leader.setTasks(List.of());
        agents.add(leader);
        
        // 狼牙01
        AgentVO a1 = new AgentVO();
        a1.setId("wolf-tooth-01");
        a1.setName("狼牙01");
        a1.setEmoji("🦷");
        a1.setRole("数据整理");
        a1.setIsLeader(false);
        a1.setStatus(AgentStatus.ONLINE);
        a1.setStatusText("在线 - 日报生成中");
        a1.setTasks(List.of());
        agents.add(a1);
        
        // 狼牙02
        AgentVO a2 = new AgentVO();
        a2.setId("wolf-tooth-02");
        a2.setName("狼牙02");
        a2.setEmoji("🦷");
        a2.setRole("数据分析");
        a2.setIsLeader(false);
        a2.setStatus(AgentStatus.ONLINE);
        a2.setStatusText("在线 - 空闲");
        a2.setTasks(List.of());
        agents.add(a2);
        
        // 狼牙03
        AgentVO a3 = new AgentVO();
        a3.setId("wolf-tooth-03");
        a3.setName("狼牙03");
        a3.setEmoji("🦷");
        a3.setRole("可视化");
        a3.setIsLeader(false);
        a3.setStatus(AgentStatus.ONLINE);
        a3.setStatusText("在线 - 空闲");
        a3.setTasks(List.of());
        agents.add(a3);
        
        return agents;
    }

    public List<TaskVO> getTaskList() {
        List<TaskVO> tasks = new ArrayList<>();
        
        TaskVO t1 = new TaskVO();
        t1.setId("task-001");
        t1.setTime("09:00");
        t1.setAssignee("狼牙01");
        t1.setTask("AI热点日报生成");
        t1.setPriority(TaskPriority.HIGH);
        t1.setStatus(TaskStatus.COMPLETED);
        tasks.add(t1);
        
        TaskVO t2 = new TaskVO();
        t2.setId("task-002");
        t2.setTime("10:00");
        t2.setAssignee("狼牙02");
        t2.setTask("抖音直播数据检查");
        t2.setPriority(TaskPriority.MEDIUM);
        t2.setStatus(TaskStatus.COMPLETED);
        tasks.add(t2);
        
        TaskVO t3 = new TaskVO();
        t3.setId("task-003");
        t3.setTime("14:00");
        t3.setAssignee("狼头");
        t3.setTask("仪表盘部署上线");
        t3.setPriority(TaskPriority.HIGH);
        t3.setStatus(TaskStatus.IN_PROGRESS);
        tasks.add(t3);
        
        return tasks;
    }

    public Map<String, Object> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "ok");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("version", "1.0.0");
        health.put("uptime", "99.9%");
        return health;
    }

    private DashboardDTO.AgentStats getAgentStats() {
        DashboardDTO.AgentStats stats = new DashboardDTO.AgentStats();
        stats.setTotal(4);
        stats.setOnline(4);
        stats.setBusy(1);
        stats.setOffline(0);
        return stats;
    }

    private DashboardDTO.TaskStats getTaskStats() {
        DashboardDTO.TaskStats stats = new DashboardDTO.TaskStats();
        stats.setTotal(12);
        stats.setPending(3);
        stats.setInProgress(1);
        stats.setCompleted(8);
        stats.setFailed(0);
        return stats;
    }

    private DashboardDTO.SystemStatus getSystemStatus() {
        DashboardDTO.SystemStatus status = new DashboardDTO.SystemStatus();
        status.setStatus("running");
        status.setUptime("72h 15m");
        status.setCpuUsage(35.2);
        status.setMemoryUsage(42.8);
        return status;
    }
}