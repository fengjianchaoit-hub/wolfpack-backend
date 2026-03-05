package com.wolfpack.api.enums;

import lombok.Getter;

/**
 * 任务优先级枚举
 */
@Getter
public enum TaskPriority {
    HIGH("high", "高", 3),
    MEDIUM("medium", "中", 2),
    LOW("low", "低", 1);
    
    private final String code;
    private final String desc;
    private final Integer weight;
    
    TaskPriority(String code, String desc, Integer weight) {
        this.code = code;
        this.desc = desc;
        this.weight = weight;
    }
}
