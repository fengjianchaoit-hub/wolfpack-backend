package com.wolfpack.admin.repository;

import com.wolfpack.admin.entity.Agent;
import com.wolfpack.api.enums.AgentStatus;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 代理数据仓库 - 内存存储 + 可扩展持久化
 */
@Slf4j
@Repository
public class AgentRepository {

    private final Map<String, Agent> agentStore = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // 初始化默认代理
        createAgent("wolf-head", "狼头", "🔥", "团队负责人", true);
        createAgent("wolf-tooth-01", "狼牙01", "📝", "文案编辑", false);
        createAgent("wolf-tooth-02", "狼牙02", "📊", "数据分析", false);
        createAgent("wolf-tooth-03", "狼牙03", "📈", "可视化", false);
        log.info("Initialized {} agents", agentStore.size());
    }

    private void createAgent(String id, String name, String emoji, String role, boolean isLeader) {
        Agent agent = new Agent();
        agent.setId(id);
        agent.setName(name);
        agent.setEmoji(emoji);
        agent.setRole(role);
        agent.setIsLeader(isLeader);
        agent.setStatus(AgentStatus.ONLINE);
        agent.setStatusText("在线 - 正常运行");
        agent.setLastActiveTime(LocalDateTime.now());
        agent.setCreatedAt(LocalDateTime.now());
        agent.setUpdatedAt(LocalDateTime.now());
        agentStore.put(id, agent);
    }

    public List<Agent> findAll() {
        return new ArrayList<>(agentStore.values());
    }

    public Agent findById(String id) {
        return agentStore.get(id);
    }

    public void updateStatus(String id, AgentStatus status, String statusText) {
        Agent agent = agentStore.get(id);
        if (agent != null) {
            agent.setStatus(status);
            agent.setStatusText(statusText);
            agent.setLastActiveTime(LocalDateTime.now());
            agent.setUpdatedAt(LocalDateTime.now());
        }
    }

    public void updateLastActiveTime(String id) {
        Agent agent = agentStore.get(id);
        if (agent != null) {
            agent.setLastActiveTime(LocalDateTime.now());
            agent.setUpdatedAt(LocalDateTime.now());
        }
    }

    public void save(Agent agent) {
        agent.setUpdatedAt(LocalDateTime.now());
        agentStore.put(agent.getId(), agent);
    }
}
