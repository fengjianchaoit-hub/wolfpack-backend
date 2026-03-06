package com.wolfpack.admin.repository;

import com.wolfpack.admin.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 代理数据访问层 - JPA
 */
@Repository
public interface AgentJpaRepository extends JpaRepository<Agent, String> {
    
    List<Agent> findByStatus(String status);
    
    List<Agent> findByIsLeaderTrue();
    
    Optional<Agent> findByName(String name);
}
