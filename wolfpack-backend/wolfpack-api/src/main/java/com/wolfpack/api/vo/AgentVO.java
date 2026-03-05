package com.wolfpack.api.vo;

import com.wolfpack.api.enums.AgentStatus;
import lombok.Data;

import java.util.List;

/**
 * 代理视图对象
 */
@Data
public class AgentVO {
    
    private String id;
    private String name;
    private String emoji;
    private String role;
    private Boolean isLeader;
    private AgentStatus status;
    private String statusText;
    private List<TaskItem> tasks;
    
    @Data
    public static class TaskItem {
        private String text;
        private String status; // done, pending, todo
    }
}
