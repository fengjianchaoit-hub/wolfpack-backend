package com.wolfpack.api.dto;

import lombok.Data;

/**
 * 仪表盘数据DTO
 */
@Data
public class DashboardDTO {
    
    private AgentStats agentStats;
    private TaskStats taskStats;
    private SystemStatus systemStatus;
    private String updateTime;
    
    @Data
    public static class AgentStats {
        private Integer total;
        private Integer online;
        private Integer busy;
        private Integer offline;
    }
    
    @Data
    public static class TaskStats {
        private Integer total;
        private Integer pending;
        private Integer inProgress;
        private Integer completed;
        private Integer failed;
    }
    
    @Data
    public static class SystemStatus {
        private String status;
        private String uptime;
        private Double cpuUsage;
        private Double memoryUsage;
    }
}
