package com.wolfpack.api.enums;

import lombok.Getter;

/**
 * 任务状态枚举
 */
@Getter
public enum TaskStatus {
    PENDING("pending", "待执行"),
    IN_PROGRESS("in_progress", "进行中"),
    COMPLETED("completed", "已完成"),
    FAILED("failed", "失败"),
    CANCELLED("cancelled", "已取消");
    
    private final String code;
    private final String desc;
    
    TaskStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
