package com.wolfpack.admin.entity;

import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 任务实体 - JPA持久化
 */
@Data
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "title", length = 500, nullable = false)
    private String title;

    @Column(name = "assignee_id", length = 50, nullable = false)
    private String assigneeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "scheduled_time", length = 50)
    private String scheduledTime;

    @Column(name = "cron_expression", length = 100)
    private String cronExpression;

    @Column(name = "is_cron_job")
    private Boolean isCronJob = false;

    @Column(name = "description", length = 1000)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
