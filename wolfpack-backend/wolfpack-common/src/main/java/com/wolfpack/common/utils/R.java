package com.wolfpack.common.utils;

import cn.hutool.json.JSONUtil;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 统一API响应封装
 */
@Data
public class R<T> {
    
    private Integer code;
    private String message;
    private T data;
    private String timestamp;
    
    private R() {
        this.timestamp = LocalDateTime.now().toString();
    }
    
    public static <T> R<T> ok() {
        R<T> r = new R<>();
        r.setCode(200);
        r.setMessage("success");
        return r;
    }
    
    public static <T> R<T> ok(T data) {
        R<T> r = ok();
        r.setData(data);
        return r;
    }
    
    public static <T> R<T> error(String message) {
        R<T> r = new R<>();
        r.setCode(500);
        r.setMessage(message);
        return r;
    }
    
    public static <T> R<T> error(Integer code, String message) {
        R<T> r = new R<>();
        r.setCode(code);
        r.setMessage(message);
        return r;
    }
    
    public String toJson() {
        return JSONUtil.toJsonStr(this);
    }
}
