package com.wolfpack.api.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.wolfpack.api.enums.AgentStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 代理实体
 */
@Data
@TableName("agent")
public class Agent {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String agentId;
    private String name;
    private String emoji;
    private String role;
    private Boolean isLeader;
    
    @TableField("status")
    private AgentStatus status;
    
    private String description;
    private LocalDateTime lastHeartbeat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @TableLogic
    private Integer deleted;
}
