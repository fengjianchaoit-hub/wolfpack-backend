package com.wolfpack.admin.controller;

import com.wolfpack.admin.service.DashboardService;
import com.wolfpack.api.enums.AgentStatus;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
public class AgentController {
    private final DashboardService dashboardService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAgents() {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", dashboardService.getAllAgents());
        return ResponseEntity.ok(response);
    }

    /**
     * 更新代理状态（供OpenClaw调用）
     */
    @PostMapping("/{agentId}/status")
    public ResponseEntity<Map<String, Object>> updateAgentStatus(
            @PathVariable String agentId,
            @RequestBody StatusUpdateRequest request) {
        dashboardService.updateAgentStatus(agentId, request.getStatus(), request.getStatusText());
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "状态更新成功");
        return ResponseEntity.ok(response);
    }

    @Data
    public static class StatusUpdateRequest {
        private AgentStatus status;
        private String statusText;
    }
}
