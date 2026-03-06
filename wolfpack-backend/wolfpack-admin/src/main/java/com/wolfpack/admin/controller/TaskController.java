package com.wolfpack.admin.controller;

import com.wolfpack.admin.service.DashboardService;
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
}
