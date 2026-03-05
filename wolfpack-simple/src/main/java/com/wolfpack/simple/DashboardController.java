package com.wolfpack.simple;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @GetMapping
    public Map<String, Object> getDashboard() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        
        Map<String, Object> data = new HashMap<>();
        
        // Agent stats
        Map<String, Object> agentStats = new HashMap<>();
        agentStats.put("total", 4);
        agentStats.put("online", 4);
        agentStats.put("busy", 1);
        agentStats.put("offline", 0);
        data.put("agentStats", agentStats);
        
        // Task stats
        Map<String, Object> taskStats = new HashMap<>();
        taskStats.put("total", 12);
        taskStats.put("pending", 3);
        taskStats.put("inProgress", 1);
        taskStats.put("completed", 8);
        taskStats.put("failed", 0);
        data.put("taskStats", taskStats);
        
        // System status
        Map<String, Object> systemStatus = new HashMap<>();
        systemStatus.put("status", "running");
        systemStatus.put("uptime", "72h 15m");
        systemStatus.put("cpuUsage", 35.2);
        systemStatus.put("memoryUsage", 42.8);
        data.put("systemStatus", systemStatus);
        
        data.put("updateTime", LocalDateTime.now().toString());
        
        result.put("data", data);
        return result;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "ok");
        health.put("timestamp", LocalDateTime.now().toString());
        return health;
    }
}