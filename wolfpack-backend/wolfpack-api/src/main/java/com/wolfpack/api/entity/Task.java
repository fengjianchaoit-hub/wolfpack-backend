package com.wolfpack.api.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务实体
 */
@Data
@TableName("task")
public class Task {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String taskId;
    private String title;
    private String description;
    
    @TableField("assignee_id")
    private String assigneeId;
    
    @TableField("status")
    private TaskStatus status;
    
    @TableField("priority")
    private TaskPriority priority;
    
    private LocalDateTime scheduledTime;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String result;
    private String errorMsg;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    @TableLogic
    private Integer deleted;
}
