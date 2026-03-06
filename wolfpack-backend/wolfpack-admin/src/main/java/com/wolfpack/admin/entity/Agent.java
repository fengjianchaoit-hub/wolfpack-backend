package com.wolfpack.admin.entity;

import com.wolfpack.api.enums.AgentStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 代理实体 - JPA持久化
 */
@Data
@Entity
@Table(name = "agents")
public class Agent {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "emoji", length = 10)
    private String emoji;

    @Column(name = "role", length = 100, nullable = false)
    private String role;

    @Column(name = "is_leader")
    private Boolean isLeader = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private AgentStatus status = AgentStatus.ONLINE;

    @Column(name = "status_text", length = 200)
    private String statusText;

    @Column(name = "last_active_time")
    private LocalDateTime lastActiveTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
