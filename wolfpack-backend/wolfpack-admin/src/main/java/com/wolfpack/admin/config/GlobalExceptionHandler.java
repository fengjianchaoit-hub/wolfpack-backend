package com.wolfpack.admin.config;

import com.wolfpack.common.exception.BusinessException;
import com.wolfpack.common.exception.ErrorCode;
import com.wolfpack.common.utils.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;

/**
 * 全局异常处理器
 * 
 * @author 狼头
 * @since 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常处理
     */
    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.warn("[业务异常] URI={}, Code={}, Message={}", 
            request.getRequestURI(), e.getCode(), e.getMessage());
        return R.error(e.getCode(), e.getMessage());
    }

    /**
     * 参数校验异常
     */
    @ExceptionHandler(BindException.class)
    public R<Void> handleBindException(BindException e, HttpServletRequest request) {
        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.warn("[参数校验异常] URI={}, Message={}", request.getRequestURI(), message);
        return R.error(ErrorCode.PARAM_ERROR.getCode(), message);
    }

    /**
     * 运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public R<Void> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        log.error("[运行时异常] URI={}, Message={}", request.getRequestURI(), e.getMessage(), e);
        return R.error(ErrorCode.SYSTEM_ERROR.getCode(), "系统繁忙，请稍后重试");
    }

    /**
     * 其他异常
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e, HttpServletRequest request) {
        log.error("[系统异常] URI={}, Message={}", request.getRequestURI(), e.getMessage(), e);
        return R.error(ErrorCode.SYSTEM_ERROR.getCode(), "系统错误，请联系管理员");
    }
}