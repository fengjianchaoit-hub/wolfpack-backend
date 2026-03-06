package com.wolfpack.admin.controller;

import com.wolfpack.admin.service.DashboardService;
import com.wolfpack.api.dto.DashboardDTO;
import com.wolfpack.common.utils.R;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public R<DashboardDTO> getDashboard() {
        log.info("获取仪表盘数据");
        return R.ok(dashboardService.getDashboardData());
    }

    @GetMapping("/agents")
    public R<Object> getAgents() {
        return R.ok(dashboardService.getAgentList());
    }

    @GetMapping("/tasks")
    public R<Object> getTasks() {
        return R.ok(dashboardService.getTaskList());
    }

    @GetMapping("/health")
    public R<Object> health() {
        return R.ok(dashboardService.getHealthStatus());
    }

    @GetMapping("/logs")
    public R<Object> getLogs() {
        return R.ok(dashboardService.getExecutionLogs());
    }
}