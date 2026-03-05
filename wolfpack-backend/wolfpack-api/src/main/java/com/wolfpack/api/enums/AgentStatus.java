package com.wolfpack.api.enums;

import lombok.Getter;

/**
 * 代理状态枚举
 */
@Getter
public enum AgentStatus {
    ONLINE("online", "在线"),
    OFFLINE("offline", "离线"),
    BUSY("busy", "忙碌"),
    ERROR("error", "异常");
    
    private final String code;
    private final String desc;
    
    AgentStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
