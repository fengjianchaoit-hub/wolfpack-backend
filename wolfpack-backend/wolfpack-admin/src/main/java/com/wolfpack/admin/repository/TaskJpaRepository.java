package com.wolfpack.admin.repository;

import com.wolfpack.admin.entity.Task;
import com.wolfpack.api.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 任务数据访问层 - JPA
 */
@Repository
public interface TaskJpaRepository extends JpaRepository<Task, String> {
    
    List<Task> findByAssigneeId(String assigneeId);
    
    List<Task> findByStatus(TaskStatus status);
    
    List<Task> findByIsCronJobTrue();
    
    long countByStatus(TaskStatus status);
}
