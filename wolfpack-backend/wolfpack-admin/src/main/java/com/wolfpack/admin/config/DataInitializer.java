package com.wolfpack.admin.config;

import com.wolfpack.admin.entity.Agent;
import com.wolfpack.admin.entity.Skill;
import com.wolfpack.admin.entity.Task;
import com.wolfpack.admin.repository.AgentJpaRepository;
import com.wolfpack.admin.repository.ExecutionLogJpaRepository;
import com.wolfpack.admin.repository.SkillRepository;
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

import java.time.LocalDateTime;

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
    private final SkillRepository skillRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // 只在空数据库时初始化
        if (agentRepository.count() == 0) {
            log.info("Initializing database with default data...");
            initAgents();
            initTasks();
            initSkills();
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

    private void initSkills() {
        if (skillRepository.count() > 0) {
            log.info("Skills already initialized, skipping");
            return;
        }

        // MCP工具类技能 - 文件系统
        Skill s1 = new Skill();
        s1.setName("文件系统MCP");
        s1.setDescription("基于MCP协议的文件系统操作工具，支持读/写/删除文件");
        s1.setCategory(Skill.SkillCategory.TESTING);
        s1.setStatus(Skill.SkillStatus.ACTIVE);
        s1.setSkillType(Skill.SkillType.MCP_TOOL);
        s1.setVisibility(Skill.Visibility.DASHBOARD);
        s1.setVersion("1.0.0");
        s1.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/mcp-filesystem");
        s1.setAuthor("狼头");
        s1.setUsageCount(156);
        s1.setIcon("📁");
        s1.setDisplayOrder(1);
        s1.setMcpEndpoint("/mcp/v1/filesystem");
        s1.setInputSchema("{\"type\":\"object\",\"properties\":{\"action\":{\"type\":\"string\"},\"path\":{\"type\":\"string\"}}}");
        skillRepository.save(s1);

        // MCP工具类技能 - 数据库查询
        Skill s2 = new Skill();
        s2.setName("数据库查询MCP");
        s2.setDescription("基于MCP协议的SQL查询工具，支持MySQL/PostgreSQL");
        s2.setCategory(Skill.SkillCategory.TESTING);
        s2.setStatus(Skill.SkillStatus.ACTIVE);
        s2.setSkillType(Skill.SkillType.MCP_TOOL);
        s2.setVisibility(Skill.Visibility.DASHBOARD);
        s2.setVersion("1.1.0");
        s2.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/mcp-database");
        s2.setAuthor("狼牙02");
        s2.setUsageCount(234);
        s2.setIcon("🗄️");
        s2.setDisplayOrder(2);
        s2.setMcpEndpoint("/mcp/v1/database");
        s2.setInputSchema("{\"type\":\"object\",\"properties\":{\"sql\":{\"type\":\"string\"},\"params\":{\"type\":\"array\"}}}");
        skillRepository.save(s2);

        // 集成工具 - 飞书同步
        Skill s3 = new Skill();
        s3.setName("飞书IM同步");
        s3.setDescription("将对话记录自动同步到飞书群，支持定时推送");
        s3.setCategory(Skill.SkillCategory.INTEGRATION);
        s3.setStatus(Skill.SkillStatus.ACTIVE);
        s3.setSkillType(Skill.SkillType.TOOL);
        s3.setVisibility(Skill.Visibility.DASHBOARD);
        s3.setVersion("1.2.0");
        s3.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/feishu-sync");
        s3.setAuthor("狼牙01");
        s3.setUsageCount(128);
        s3.setIcon("💬");
        s3.setDisplayOrder(3);
        skillRepository.save(s3);

        // 集成工具 - 语雀文档
        Skill s4 = new Skill();
        s4.setName("语雀文档同步");
        s4.setDescription("自动同步文档到语雀知识库，支持Markdown格式");
        s4.setCategory(Skill.SkillCategory.INTEGRATION);
        s4.setStatus(Skill.SkillStatus.ACTIVE);
        s4.setSkillType(Skill.SkillType.TOOL);
        s4.setVisibility(Skill.Visibility.DASHBOARD);
        s4.setVersion("1.0.0");
        s4.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/yuque-sync");
        s4.setAuthor("狼头");
        s4.setUsageCount(89);
        s4.setIcon("📚");
        s4.setDisplayOrder(4);
        skillRepository.save(s4);

        // 系统工具 - SSH执行
        Skill s5 = new Skill();
        s5.setName("SSH远程执行");
        s5.setDescription("通过SSH执行远程服务器命令，支持批量操作");
        s5.setCategory(Skill.SkillCategory.AUTOMATION);
        s5.setStatus(Skill.SkillStatus.ACTIVE);
        s5.setSkillType(Skill.SkillType.TOOL);
        s5.setVisibility(Skill.Visibility.DASHBOARD);
        s5.setVersion("1.3.0");
        s5.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/ssh-executor");
        s5.setAuthor("狼牙02");
        s5.setUsageCount(312);
        s5.setIcon("🔐");
        s5.setDisplayOrder(5);
        skillRepository.save(s5);

        // 数据工具 - ETL处理
        Skill s6 = new Skill();
        s6.setName("数据ETL处理");
        s6.setDescription("数据抽取、转换、加载，支持多种数据源");
        s6.setCategory(Skill.SkillCategory.AUTOMATION);
        s6.setStatus(Skill.SkillStatus.ACTIVE);
        s6.setSkillType(Skill.SkillType.TOOL);
        s6.setVisibility(Skill.Visibility.DASHBOARD);
        s6.setVersion("2.0.0");
        s6.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/data-etl");
        s6.setAuthor("狼牙02");
        s6.setUsageCount(178);
        s6.setIcon("🔄");
        s6.setDisplayOrder(6);
        skillRepository.save(s6);

        // 工作流 - 狼牙日报生成（业务技能，不在仪表盘展示）
        Skill s7 = new Skill();
        s7.setName("狼牙日报生成");
        s7.setDescription("自动生成AI热点日报，包含数据分析和可视化");
        s7.setCategory(Skill.SkillCategory.AUTOMATION);
        s7.setStatus(Skill.SkillStatus.ACTIVE);
        s7.setSkillType(Skill.SkillType.WORKFLOW);
        s7.setVisibility(Skill.Visibility.INTERNAL); // 内部使用，不展示在仪表盘
        s7.setVersion("1.5.0");
        s7.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/daily-report");
        s7.setAuthor("狼牙01");
        s7.setUsageCount(45);
        s7.setIcon("📰");
        s7.setDisplayOrder(7);
        skillRepository.save(s7);

        // MCP服务器 - 统一MCP网关（开发中）
        Skill s8 = new Skill();
        s8.setName("MCP统一网关");
        s8.setDescription("统一的MCP服务器网关，管理所有MCP工具");
        s8.setCategory(Skill.SkillCategory.INTEGRATION);
        s8.setStatus(Skill.SkillStatus.DEVELOPMENT);
        s8.setSkillType(Skill.SkillType.MCP_SERVER);
        s8.setVisibility(Skill.Visibility.DASHBOARD);
        s8.setVersion("0.5.0");
        s8.setCodeUrl("https://github.com/fengjianchaoit-hub/wolfpack-backend/tree/main/skills/mcp-gateway");
        s8.setAuthor("狼头");
        s8.setUsageCount(0);
        s8.setIcon("🌐");
        s8.setDisplayOrder(8);
        s8.setMcpEndpoint("/mcp/v1/gateway");
        skillRepository.save(s8);

        log.info("Initialized {} skills", skillRepository.count());
    }
}
