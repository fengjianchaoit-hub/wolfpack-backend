package com.wolfpack.admin.repository;

import com.wolfpack.admin.entity.ExecutionLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 执行日志数据访问层 - JPA
 */
@Repository
public interface ExecutionLogJpaRepository extends JpaRepository<ExecutionLog, Long> {
    
    List<ExecutionLog> findByAgentIdOrderByCreatedAtDesc(String agentId);
    
    List<ExecutionLog> findByTaskIdOrderByCreatedAtDesc(String taskId);
    
    List<ExecutionLog> findByOrderByCreatedAtDesc(Pageable pageable);
    
    List<ExecutionLog> findTop50ByOrderByCreatedAtDesc();
}
