package com.wolfpack.admin.repository;

import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import com.wolfpack.api.vo.TaskVO;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 任务数据仓库 - 内存存储 + 可扩展持久化
 */
@Slf4j
@Repository
public class TaskRepository {

    private final Map<String, TaskVO> taskStore = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // 初始化默认任务
        addTask("task-001", "09:00", "狼牙01", "AI热点日报生成", TaskPriority.HIGH, TaskStatus.COMPLETED);
        addTask("task-002", "10:00", "狼牙02", "抖音直播数据检查", TaskPriority.HIGH, TaskStatus.COMPLETED);
        addTask("task-003", "14:00", "狼头", "仪表盘部署上线", TaskPriority.HIGH, TaskStatus.COMPLETED);
        addTask("task-004", "09:00", "狼牙01", "生成AI热点日报", TaskPriority.HIGH, TaskStatus.PENDING);
        addTask("task-005", "10:00", "狼牙02", "分析昨日直播数据（含行为洞察）", TaskPriority.HIGH, TaskStatus.PENDING);
        addTask("task-006", "11:00", "狼牙03", "生成数据看板（含视觉重点）", TaskPriority.MEDIUM, TaskStatus.PENDING);
        addTask("cron-memory-digest", "每4小时", "狼头", "记忆归档检查 - 自动总结入库", TaskPriority.HIGH, TaskStatus.IN_PROGRESS);
        log.info("Initialized {} tasks", taskStore.size());
    }

    private void addTask(String id, String time, String assignee, String task, TaskPriority priority, TaskStatus status) {
        TaskVO t = new TaskVO();
        t.setId(id);
        t.setTime(time);
        t.setAssignee(assignee);
        t.setTask(task);
        t.setPriority(priority);
        t.setStatus(status);
        taskStore.put(id, t);
    }

    public List<TaskVO> findAll() {
        return new ArrayList<>(taskStore.values());
    }

    public TaskVO findById(String id) {
        return taskStore.get(id);
    }

    public List<TaskVO> findByAssignee(String assignee) {
        return taskStore.values().stream()
            .filter(t -> t.getAssignee().equals(assignee))
            .collect(Collectors.toList());
    }

    public List<TaskVO> findByStatus(TaskStatus status) {
        return taskStore.values().stream()
            .filter(t -> t.getStatus() == status)
            .collect(Collectors.toList());
    }

    public void updateStatus(String id, TaskStatus status) {
        TaskVO task = taskStore.get(id);
        if (task != null) {
            task.setStatus(status);
        }
    }

    public void save(TaskVO task) {
        taskStore.put(task.getId(), task);
    }

    public void delete(String id) {
        taskStore.remove(id);
    }
}
