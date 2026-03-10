package com.wolfpack.admin.service;

import com.wolfpack.admin.entity.Skill;
import com.wolfpack.admin.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 技能管理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    /**
     * 获取所有技能
     */
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    /**
     * 根据ID获取技能
     */
    public Optional<Skill> getSkillById(String id) {
        return skillRepository.findById(id);
    }

    /**
     * 创建新技能
     */
    @Transactional
    public Skill createSkill(Skill skill) {
        skill.setStatus(Skill.SkillStatus.DEVELOPMENT);
        skill.setUsageCount(0);
        skill.setLastUpdated(LocalDateTime.now());
        Skill saved = skillRepository.save(skill);
        log.info("创建新技能: {}", skill.getName());
        return saved;
    }

    /**
     * 更新技能
     */
    @Transactional
    public Skill updateSkill(String id, Skill skillUpdate) {
        Skill skill = skillRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("技能不存在: " + id));
        
        skill.setName(skillUpdate.getName());
        skill.setDescription(skillUpdate.getDescription());
        skill.setCategory(skillUpdate.getCategory());
        skill.setVersion(skillUpdate.getVersion());
        skill.setCodeUrl(skillUpdate.getCodeUrl());
        skill.setAuthor(skillUpdate.getAuthor());
        skill.setTags(skillUpdate.getTags());
        skill.setLastUpdated(LocalDateTime.now());
        
        Skill saved = skillRepository.save(skill);
        log.info("更新技能: {}", skill.getName());
        return saved;
    }

    /**
     * 更新技能状态（启用/停用/开发中）
     */
    @Transactional
    public Skill updateSkillStatus(String id, Skill.SkillStatus status) {
        Skill skill = skillRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("技能不存在: " + id));
        
        skill.setStatus(status);
        skill.setLastUpdated(LocalDateTime.now());
        
        Skill saved = skillRepository.save(skill);
        log.info("更新技能状态: {} -> {}", skill.getName(), status);
        return saved;
    }

    /**
     * 删除技能
     */
    @Transactional
    public void deleteSkill(String id) {
        skillRepository.deleteById(id);
        log.info("删除技能: {}", id);
    }

    /**
     * 增加使用次数
     */
    @Transactional
    public void incrementUsage(String id) {
        Skill skill = skillRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("技能不存在: " + id));
        skill.setUsageCount(skill.getUsageCount() + 1);
        skillRepository.save(skill);
    }

    /**
     * 从GitHub同步技能
     * 这是一个模拟方法，实际实现需要调用GitHub API
     */
    @Transactional
    public void syncFromGithub() {
        log.info("开始从GitHub同步技能...");
        // TODO: 实现GitHub API调用
        // 这里可以集成GitHub API获取仓库列表
    }
}
