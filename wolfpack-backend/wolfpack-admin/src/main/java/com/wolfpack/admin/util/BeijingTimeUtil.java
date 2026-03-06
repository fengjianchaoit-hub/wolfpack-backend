package com.wolfpack.admin.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 时间工具类 - 统一使用北京时间（Asia/Shanghai）
 * 
 * 开发规范：
 * 1. 所有数据库存储时间使用 LocalDateTime（JPA自动处理）
 * 2. 所有展示给前端的时间必须转为北京时间
 * 3. 所有时间计算（如"今天开始"）基于北京时间
 * 4. 禁止直接使用 LocalDateTime.now() 用于展示，必须通过此工具类
 */
public class BeijingTimeUtil {
    
    /** 北京时区 */
    public static final ZoneId BEIJING_ZONE = ZoneId.of("Asia/Shanghai");
    
    /** 标准显示格式 */
    public static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("MM-dd HH:mm");
    
    /**
     * 获取当前北京时间
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(BEIJING_ZONE);
    }
    
    /**
     * 获取今天的开始时间（北京时间 00:00:00）
     */
    public static LocalDateTime todayStart() {
        return now().withHour(0).withMinute(0).withSecond(0).withNano(0);
    }
    
    /**
     * 获取今天的结束时间（北京时间 23:59:59）
     */
    public static LocalDateTime todayEnd() {
        return now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
    }
    
    /**
     * 将任意时间转为北京时间显示字符串
     * @param localDateTime 数据库中的时间
     * @return MM-dd HH:mm 格式的北京时间
     */
    public static String toDisplayString(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return "--:--";
        }
        // 先转为系统时区的ZonedDateTime，再转到北京时间
        ZonedDateTime zdt = localDateTime.atZone(ZoneId.systemDefault())
                .withZoneSameInstant(BEIJING_ZONE);
        return zdt.format(DISPLAY_FORMATTER);
    }
    
    /**
     * 检查时间是否是今天（北京时间）
     */
    public static boolean isToday(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return false;
        }
        LocalDateTime beijingTime = localDateTime.atZone(ZoneId.systemDefault())
                .withZoneSameInstant(BEIJING_ZONE)
                .toLocalDateTime();
        LocalDateTime today = todayStart();
        return !beijingTime.isBefore(today) && !beijingTime.isAfter(todayEnd());
    }
    
    /**
     * 获取当前时间的ISO字符串（带时区）
     */
    public static String nowIsoString() {
        return ZonedDateTime.now(BEIJING_ZONE).toString();
    }
}
