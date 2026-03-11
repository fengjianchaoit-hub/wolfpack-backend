package com.wolfpack.common.exception;

import lombok.Getter;

/**
 * 错误码枚举
 * 
 * @author 狼头
 * @since 1.0.0
 */
@Getter
public enum ErrorCode {

    // 系统级错误 1xxxx
    SUCCESS(200, "成功"),
    SYSTEM_ERROR(500, "系统错误"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    
    // 业务级错误 2xxxx
    SKILL_NOT_FOUND(20001, "技能不存在"),
    SKILL_NAME_EXISTS(20002, "技能名称已存在"),
    SKILL_STATUS_INVALID(20003, "技能状态无效"),
    
    AGENT_NOT_FOUND(21001, "代理不存在"),
    AGENT_OFFLINE(21002, "代理离线"),
    
    TASK_NOT_FOUND(22001, "任务不存在"),
    TASK_EXECUTE_FAILED(22002, "任务执行失败");

    private final Integer code;
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}