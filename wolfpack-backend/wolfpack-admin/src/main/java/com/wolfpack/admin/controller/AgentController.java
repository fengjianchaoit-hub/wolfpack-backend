package com.wolfpack.admin.controller;

import com.wolfpack.admin.service.DashboardService;
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
}
