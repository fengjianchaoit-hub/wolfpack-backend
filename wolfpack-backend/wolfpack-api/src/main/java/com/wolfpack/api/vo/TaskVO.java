package com.wolfpack.api.vo;

import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import lombok.Data;

/**
 * 任务视图对象
 */
@Data
public class TaskVO {
    
    private String id;
    private String time;
    private String assignee;
    private String task;
    private TaskPriority priority;
    private TaskStatus status;
}
