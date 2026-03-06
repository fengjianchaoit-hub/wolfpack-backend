package com.wolfpack.admin.config;

import com.wolfpack.admin.entity.Agent;
import com.wolfpack.admin.entity.Task;
import com.wolfpack.admin.repository.AgentJpaRepository;
import com.wolfpack.admin.repository.ExecutionLogJpaRepository;
import com.wolfpack.admin.repository.TaskJpaRepository;
import com.wolfpack.admin.util.BeijingTimeUtil;
import com.wolfpack.api.enums.AgentStatus;
import com.wolfpack.api.enums.TaskPriority;
import com.wolfpack.api.enums.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 数据初始化器 - 应用启动时初始化基础数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AgentJpaRepository agentRepository;
    private final TaskJpaRepository taskRepository;
    private final ExecutionLogJpaRepository logRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // 只在空数据库时初始化
        if (agentRepository.count() == 0) {
            log.info("Initializing database with default data...");
            initAgents();
            initTasks();
            // 不再初始化假日志，等待真实操作产生
            log.info("Database initialized successfully (logs will be created by real operations)");
        } else {
            log.info("Database already contains data, skipping initialization");
        }
    }

    private void initAgents() {
        Agent leader = new Agent();
        leader.setId("wolf-head");
        leader.setName("狼头");
        leader.setEmoji("🔥");
        leader.setRole("团队负责人");
        leader.setIsLeader(true);
        leader.setStatus(AgentStatus.ONLINE);
        leader.setStatusText("在线 - 统筹管理中");
        leader.setLastActiveTime(BeijingTimeUtil.now());
        agentRepository.save(leader);

        Agent a1 = new Agent();
        a1.setId("wolf-tooth-01");
        a1.setName("狼牙01");
        a1.setEmoji("📝");
        a1.setRole("文案编辑");
        a1.setIsLeader(false);
        a1.setStatus(AgentStatus.ONLINE);
        a1.setStatusText("待命 - 等待任务");
        a1.setLastActiveTime(BeijingTimeUtil.now());
        agentRepository.save(a1);

        Agent a2 = new Agent();
        a2.setId("wolf-tooth-02");
        a2.setName("狼牙02");
        a2.setEmoji("📊");
        a2.setRole("数据分析");
        a2.setIsLeader(false);
        a2.setStatus(AgentStatus.ONLINE);
        a2.setStatusText("待命 - 等待任务");
        a2.setLastActiveTime(BeijingTimeUtil.now());
        agentRepository.save(a2);

        Agent a3 = new Agent();
        a3.setId("wolf-tooth-03");
        a3.setName("狼牙03");
        a3.setEmoji("📈");
        a3.setRole("可视化");
        a3.setIsLeader(false);
        a3.setStatus(AgentStatus.ONLINE);
        a3.setStatusText("待命 - 等待任务");
        a3.setLastActiveTime(BeijingTimeUtil.now());
        agentRepository.save(a3);

        log.info("Initialized {} agents", agentRepository.count());
    }

    private void initTasks() {
        Task t1 = new Task();
        t1.setId("task-001");
        t1.setTitle("AI热点日报生成");
        t1.setAssigneeId("wolf-tooth-01");
        t1.setPriority(TaskPriority.HIGH);
        t1.setStatus(TaskStatus.COMPLETED);
        t1.setScheduledTime("09:00");
        t1.setIsCronJob(false);
        t1.setDescription("生成AI热点日报");
        taskRepository.save(t1);

        Task t2 = new Task();
        t2.setId("task-002");
        t2.setTitle("抖音直播数据检查");
        t2.setAssigneeId("wolf-tooth-02");
        t2.setPriority(TaskPriority.HIGH);
        t2.setStatus(TaskStatus.COMPLETED);
        t2.setScheduledTime("10:00");
        t2.setIsCronJob(false);
        t2.setDescription("检查抖音直播数据");
        taskRepository.save(t2);

        Task t3 = new Task();
        t3.setId("task-003");
        t3.setTitle("仪表盘部署上线");
        t3.setAssigneeId("wolf-head");
        t3.setPriority(TaskPriority.HIGH);
        t3.setStatus(TaskStatus.COMPLETED);
        t3.setScheduledTime("14:00");
        t3.setIsCronJob(false);
        t3.setDescription("完成仪表盘部署");
        taskRepository.save(t3);

        Task t4 = new Task();
        t4.setId("task-004");
        t4.setTitle("生成AI热点日报");
        t4.setAssigneeId("wolf-tooth-01");
        t4.setPriority(TaskPriority.HIGH);
        t4.setStatus(TaskStatus.PENDING);
        t4.setScheduledTime("09:00");
        t4.setIsCronJob(false);
        t4.setDescription("明日日报任务");
        taskRepository.save(t4);

        Task t5 = new Task();
        t5.setId("task-005");
        t5.setTitle("分析昨日直播数据");
        t5.setAssigneeId("wolf-tooth-02");
        t5.setPriority(TaskPriority.HIGH);
        t5.setStatus(TaskStatus.PENDING);
        t5.setScheduledTime("10:00");
        t5.setIsCronJob(false);
        t5.setDescription("含行为洞察");
        taskRepository.save(t5);

        Task t6 = new Task();
        t6.setId("task-006");
        t6.setTitle("生成数据看板");
        t6.setAssigneeId("wolf-tooth-03");
        t6.setPriority(TaskPriority.MEDIUM);
        t6.setStatus(TaskStatus.PENDING);
        t6.setScheduledTime("11:00");
        t6.setIsCronJob(false);
        t6.setDescription("含视觉重点");
        taskRepository.save(t6);

        Task t7 = new Task();
        t7.setId("cron-memory-digest");
        t7.setTitle("记忆归档检查 - 自动总结入库");
        t7.setAssigneeId("wolf-head");
        t7.setPriority(TaskPriority.HIGH);
        t7.setStatus(TaskStatus.IN_PROGRESS);
        t7.setScheduledTime("每4小时");
        t7.setIsCronJob(true);
        t7.setDescription("自动检查并归档核心意见");
        taskRepository.save(t7);

        log.info("Initialized {} tasks", taskRepository.count());
    }
}
