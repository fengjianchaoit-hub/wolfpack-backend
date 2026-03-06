package com.wolfpack.admin.repository;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 执行日志仓库 - 内存 + 文件持久化
 */
@Slf4j
@Repository
public class ExecutionLogRepository {

    private static final String LOG_FILE = "logs/execution.log";
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    private final List<ExecutionLog> logCache = new CopyOnWriteArrayList<>();
    private final Path logPath;

    public ExecutionLogRepository() {
        this.logPath = Paths.get(LOG_FILE);
    }

    @PostConstruct
    public void init() {
        // 创建日志目录
        try {
            Files.createDirectories(logPath.getParent());
        } catch (IOException e) {
            log.warn("Failed to create log directory: {}", e.getMessage());
        }
        
        // 加载历史日志
        loadFromFile();
        
        // 如果没有日志，添加默认的
        if (logCache.isEmpty()) {
            addLog("wolf-head", "创建狼牙03", "success", null);
            addLog("wolf-head", "仪表盘前端部署", "success", null);
            addLog("wolf-tooth-02", "抖音直播数据检查完成", "success", null);
            addLog("wolf-tooth-01", "AI热点日报生成完成", "success", null);
            flushToFile();
        }
        
        log.info("Initialized {} execution logs", logCache.size());
    }

    @PreDestroy
    public void destroy() {
        flushToFile();
    }

    public void addLog(String agentId, String action, String status, String details) {
        ExecutionLog log = new ExecutionLog();
        log.setTime(LocalDateTime.now().format(TIME_FORMATTER));
        log.setAgent(agentIdToName(agentId));
        log.setAction(action);
        log.setStatus(status);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        
        logCache.add(0, log); // 新日志在前
        
        // 异步写入文件
        flushToFile();
    }

    public List<ExecutionLog> findRecent(int limit) {
        return logCache.stream()
            .limit(limit)
            .collect(java.util.stream.Collectors.toList());
    }

    public List<ExecutionLog> findAll() {
        return new ArrayList<>(logCache);
    }

    private void loadFromFile() {
        if (!Files.exists(logPath)) {
            return;
        }
        
        try (BufferedReader reader = Files.newBufferedReader(logPath, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                try {
                    ExecutionLog logEntry = parseLogLine(line);
                    if (logEntry != null) {
                        logCache.add(logEntry);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse log line: {}", line);
                }
            }
        } catch (IOException e) {
            log.error("Failed to load logs from file: {}", e.getMessage());
        }
    }

    private void flushToFile() {
        try (BufferedWriter writer = Files.newBufferedWriter(logPath, StandardCharsets.UTF_8)) {
            for (ExecutionLog logEntry : logCache) {
                writer.write(formatLogLine(logEntry));
                writer.newLine();
            }
        } catch (IOException e) {
            log.error("Failed to save logs to file: {}", e.getMessage());
        }
    }

    private ExecutionLog parseLogLine(String line) {
        // Format: yyyy-MM-dd HH:mm:ss|HH:mm|agent|action|status|details
        String[] parts = line.split("\\|", 6);
        if (parts.length >= 5) {
            ExecutionLog log = new ExecutionLog();
            log.setTimestamp(LocalDateTime.parse(parts[0], DATETIME_FORMATTER));
            log.setTime(parts[1]);
            log.setAgent(parts[2]);
            log.setAction(parts[3]);
            log.setStatus(parts[4]);
            log.setDetails(parts.length > 5 ? parts[5] : null);
            return log;
        }
        return null;
    }

    private String formatLogLine(ExecutionLog log) {
        return String.format("%s|%s|%s|%s|%s|%s",
            log.getTimestamp().format(DATETIME_FORMATTER),
            log.getTime(),
            log.getAgent(),
            log.getAction(),
            log.getStatus(),
            log.getDetails() != null ? log.getDetails() : ""
        );
    }

    private String agentIdToName(String id) {
        return switch (id) {
            case "wolf-head" -> "狼头";
            case "wolf-tooth-01" -> "狼牙01";
            case "wolf-tooth-02" -> "狼牙02";
            case "wolf-tooth-03" -> "狼牙03";
            default -> id;
        };
    }

    @Data
    public static class ExecutionLog {
        private String time;       // HH:mm 格式，用于显示
        private String agent;      // 代理名称
        private String action;     // 操作描述
        private String status;     // success, failed
        private String details;    // 详情
        private LocalDateTime timestamp; // 完整时间戳
    }
}
