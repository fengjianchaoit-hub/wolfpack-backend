package com.wolfpack.admin.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.RandomAccessFile;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

/**
 * 系统指标收集器 - 读取真实系统数据
 */
@Slf4j
@Component
public class SystemMetricsCollector {

    private final LocalDateTime jvmStartTime;

    public SystemMetricsCollector() {
        // JVM启动时间就是服务启动时间
        this.jvmStartTime = LocalDateTime.ofInstant(
            Instant.ofEpochMilli(ManagementFactory.getRuntimeMXBean().getStartTime()),
            ZoneId.systemDefault()
        );
    }

    /**
     * 获取CPU使用率（%）
     */
    public double getCpuUsage() {
        try {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            // 使用JMX获取系统负载，转换为近似CPU使用率
            double load = osBean.getSystemLoadAverage();
            int processors = osBean.getAvailableProcessors();
            if (load > 0 && processors > 0) {
                double usage = (load / processors) * 100;
                return Math.min(usage, 100.0); // 最大100%
            }
            
            // 备用方案：读取 /proc/stat
            return readCpuFromProc();
        } catch (Exception e) {
            log.warn("Failed to read CPU usage: {}", e.getMessage());
            return 0.0;
        }
    }

    private double readCpuFromProc() {
        try (BufferedReader reader = new BufferedReader(new FileReader("/proc/stat"))) {
            String line = reader.readLine();
            if (line != null && line.startsWith("cpu ")) {
                String[] parts = line.trim().split("\\s+");
                // cpu user nice system idle iowait irq softirq steal guest guest_nice
                long user = Long.parseLong(parts[1]);
                long nice = Long.parseLong(parts[2]);
                long system = Long.parseLong(parts[3]);
                long idle = Long.parseLong(parts[4]);
                long iowait = Long.parseLong(parts[5]);
                long irq = Long.parseLong(parts[6]);
                long softirq = Long.parseLong(parts[7]);
                
                long total = user + nice + system + idle + iowait + irq + softirq;
                long used = user + nice + system + irq + softirq;
                
                if (total > 0) {
                    return (double) used / total * 100;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to read /proc/stat: {}", e.getMessage());
        }
        return 0.0;
    }

    /**
     * 获取内存信息
     */
    public MemoryInfo getMemoryInfo() {
        try {
            long total = 0, available = 0;
            
            // 读取 /proc/meminfo
            try (BufferedReader reader = new BufferedReader(new FileReader("/proc/meminfo"))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("MemTotal:")) {
                        total = parseMeminfoValue(line);
                    } else if (line.startsWith("MemAvailable:")) {
                        available = parseMeminfoValue(line);
                    }
                }
            }
            
            long used = total - available;
            double usagePercent = total > 0 ? (double) used / total * 100 : 0;
            
            return new MemoryInfo(total, used, available, usagePercent);
        } catch (Exception e) {
            log.warn("Failed to read memory info: {}", e.getMessage());
            // 备用方案：使用 Runtime
            Runtime runtime = Runtime.getRuntime();
            long total = runtime.totalMemory();
            long free = runtime.freeMemory();
            long used = total - free;
            return new MemoryInfo(total, used, free, (double) used / total * 100);
        }
    }

    private long parseMeminfoValue(String line) {
        String[] parts = line.trim().split("\\s+");
        if (parts.length >= 2) {
            long value = Long.parseLong(parts[1]);
            // 如果是KB，转换为字节
            if (parts.length >= 3 && parts[2].equals("kB")) {
                value *= 1024;
            }
            return value;
        }
        return 0;
    }

    /**
     * 获取系统运行时间
     */
    public String getUptime() {
        Duration duration = Duration.between(jvmStartTime, LocalDateTime.now());
        long days = duration.toDays();
        long hours = duration.toHours() % 24;
        long minutes = duration.toMinutes() % 60;
        
        if (days > 0) {
            return String.format("%dd %dh %dm", days, hours, minutes);
        }
        return String.format("%dh %dm", hours, minutes);
    }

    /**
     * 获取完整系统状态
     */
    public Map<String, Object> getFullSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        MemoryInfo mem = getMemoryInfo();
        
        status.put("status", "running");
        status.put("cpuUsage", String.format("%.1f", getCpuUsage()));
        status.put("memoryUsage", String.format("%.1f", mem.getUsagePercent()));
        status.put("memoryTotal", formatBytes(mem.getTotal()));
        status.put("memoryUsed", formatBytes(mem.getUsed()));
        status.put("memoryAvailable", formatBytes(mem.getAvailable()));
        status.put("uptime", getUptime());
        status.put("jvmStartTime", jvmStartTime.toString());
        
        return status;
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }

    /**
     * 内存信息内部类
     */
    public static class MemoryInfo {
        private final long total;
        private final long used;
        private final long available;
        private final double usagePercent;

        public MemoryInfo(long total, long used, long available, double usagePercent) {
            this.total = total;
            this.used = used;
            this.available = available;
            this.usagePercent = usagePercent;
        }

        public long getTotal() { return total; }
        public long getUsed() { return used; }
        public long getAvailable() { return available; }
        public double getUsagePercent() { return usagePercent; }
    }
}
