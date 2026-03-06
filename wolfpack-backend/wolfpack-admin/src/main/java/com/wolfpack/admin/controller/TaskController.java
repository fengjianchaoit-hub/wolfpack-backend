package com.wolfpack.admin.controller;

import com.wolfpack.admin.service.DashboardService;
import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final DashboardService dashboardService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTasks() {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", dashboardService.getAllTasks());
        return ResponseEntity.ok(response);
    }

    /**
     * 创建新任务（供OpenClaw调用）
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(@RequestBody CreateTaskRequest request) {
        dashboardService.createTask(
            request.getId(),
            request.getTitle(),
            request.getAssigneeId(),
            request.getPriority(),
            request.getScheduledTime(),
            request.getDescription()
        );
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "任务创建成功");
        return ResponseEntity.ok(response);
    }

    /**
     * 更新任务状态（供OpenClaw调用）
     */
    @PostMapping("/{taskId}/status")
    public ResponseEntity<Map<String, Object>> updateTaskStatus(
            @PathVariable String taskId,
            @RequestBody StatusUpdateRequest request) {
        dashboardService.updateTaskStatus(taskId, request.getStatus());
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "任务状态更新成功");
        return ResponseEntity.ok(response);
    }

    /**
     * 添加执行日志（供OpenClaw调用）
     */
    @PostMapping("/logs")
    public ResponseEntity<Map<String, Object>> addExecutionLog(@RequestBody LogAddRequest request) {
        dashboardService.addExecutionLog(
            request.getAgentId(), 
            request.getAction(), 
            request.getStatus(),
            request.getDetails()
        );
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "日志添加成功");
        return ResponseEntity.ok(response);
    }

    @Data
    public static class CreateTaskRequest {
        private String id;
        private String title;
        private String assigneeId;
        private TaskPriority priority;
        private String scheduledTime;
        private String description;
    }

    @Data
    public static class StatusUpdateRequest {
        private TaskStatus status;
    }

    @Data
    public static class LogAddRequest {
        private String agentId;
        private String action;
        private String status;
        private String details;
    }
}
