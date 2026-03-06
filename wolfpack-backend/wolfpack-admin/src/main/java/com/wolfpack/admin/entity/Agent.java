package com.wolfpack.admin.entity;

import com.wolfpack.api.enums.AgentStatus;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 代理实体
 */
@Data
public class Agent {
    private String id;
    private String name;
    private String emoji;
    private String role;
    private Boolean isLeader;
    private AgentStatus status;
    private String statusText;
    private LocalDateTime lastActiveTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
