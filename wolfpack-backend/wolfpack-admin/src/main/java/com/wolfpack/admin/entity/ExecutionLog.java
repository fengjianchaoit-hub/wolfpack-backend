package com.wolfpack.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 执行日志实体 - JPA持久化
 */
@Data
@Entity
@Table(name = "execution_logs")
public class ExecutionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agent_id", length = 50, nullable = false)
    private String agentId;

    @Column(name = "agent_name", length = 100)
    private String agentName;

    @Column(name = "task_id", length = 50)
    private String taskId;

    @Column(name = "action", length = 500, nullable = false)
    private String action;

    @Column(name = "status", length = 20)
    private String status = "success";

    @Column(name = "details", length = 2000)
    private String details;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
