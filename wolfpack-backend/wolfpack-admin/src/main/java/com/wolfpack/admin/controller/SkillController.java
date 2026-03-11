package com.wolfpack.admin.controller;

import com.wolfpack.admin.converter.SkillConverter;
import com.wolfpack.admin.entity.Skill;
import com.wolfpack.admin.service.SkillService;
import com.wolfpack.api.vo.SkillVO;
import com.wolfpack.common.exception.BusinessException;
import com.wolfpack.common.exception.ErrorCode;
import com.wolfpack.common.utils.R;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * 技能管理API控制器
 * 
 * @author 狼头
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;
    private final SkillConverter skillConverter;

    /**
     * 获取所有技能
     */
    @GetMapping
    public R<List<SkillVO>> getAllSkills() {
        List<Skill> skills = skillService.getAllSkills();
        return R.ok(skillConverter.toVOList(skills));
    }

    /**
     * 根据ID获取技能
     */
    @GetMapping("/{id}")
    public R<SkillVO> getSkillById(@PathVariable @NotBlank String id) {
        Skill skill = skillService.getSkillById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.SKILL_NOT_FOUND));
        return R.ok(skillConverter.toVO(skill));
    }

    /**
     * 创建新技能
     */
    @PostMapping
    public R<SkillVO> createSkill(@RequestBody @Valid Skill skill) {
        Skill saved = skillService.createSkill(skill);
        return R.ok(skillConverter.toVO(saved));
    }

    /**
     * 更新技能
     */
    @PutMapping("/{id}")
    public R<SkillVO> updateSkill(
            @PathVariable @NotBlank String id,
            @RequestBody @Valid Skill skill) {
        Skill updated = skillService.updateSkill(id, skill);
        return R.ok(skillConverter.toVO(updated));
    }

    /**
     * 更新技能状态
     */
    @PutMapping("/{id}/status")
    public R<SkillVO> updateSkillStatus(
            @PathVariable @NotBlank String id,
            @RequestBody @Valid StatusUpdateRequest request) {
        Skill updated = skillService.updateSkillStatus(id, request.getStatus());
        return R.ok(skillConverter.toVO(updated));
    }

    /**
     * 删除技能
     */
    @DeleteMapping("/{id}")
    public R<Void> deleteSkill(@PathVariable @NotBlank String id) {
        skillService.deleteSkill(id);
        return R.ok();
    }

    /**
     * 从GitHub同步技能
     */
    @PostMapping("/sync")
    public R<Void> syncFromGithub() {
        skillService.syncFromGithub();
        return R.ok();
    }

    /**
     * 状态更新请求
     */
    @Data
    public static class StatusUpdateRequest {
        @NotBlank(message = "状态不能为空")
        private Skill.SkillStatus status;
    }
}