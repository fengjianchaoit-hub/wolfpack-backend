package com.wolfpack.admin.service;

import com.wolfpack.admin.config.DashboardWebSocketHandler;
import com.wolfpack.api.dto.DashboardDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataPushScheduler {

    private final DashboardService dashboardService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Scheduled(fixedRate = 10000) // 每10秒推送一次
    public void pushDashboardData() {
        try {
            DashboardDTO data = dashboardService.getDashboardData();
            String message = objectMapper.writeValueAsString(data);
            DashboardWebSocketHandler.broadcast(message);
            log.debug("WebSocket数据推送完成");
        } catch (Exception e) {
            log.error("数据推送失败", e);
        }
    }
}