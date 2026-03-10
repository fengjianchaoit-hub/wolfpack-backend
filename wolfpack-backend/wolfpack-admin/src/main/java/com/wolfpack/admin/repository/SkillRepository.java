package com.wolfpack.admin.repository;

import com.wolfpack.admin.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 技能数据访问层
 */
@Repository
public interface SkillRepository extends JpaRepository<Skill, String> {
    
    List<Skill> findByStatus(Skill.SkillStatus status);
    
    List<Skill> findByCategory(Skill.SkillCategory category);
    
    List<Skill> findByStatusOrderByUsageCountDesc(Skill.SkillStatus status);
}
