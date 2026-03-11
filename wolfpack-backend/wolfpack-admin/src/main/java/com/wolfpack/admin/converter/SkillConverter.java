package com.wolfpack.admin.converter;

import com.wolfpack.admin.entity.Skill;
import com.wolfpack.api.vo.SkillVO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Skill转换器
 * 
 * @author 狼头
 * @since 1.0.0
 */
@Component
public class SkillConverter {

    /**
     * Entity转VO
     */
    public SkillVO toVO(Skill skill) {
        if (skill == null) {
            return null;
        }
        SkillVO vo = new SkillVO();
        vo.setId(skill.getId());
        vo.setName(skill.getName());
        vo.setDescription(skill.getDescription());
        vo.setCategory(skill.getCategory() != null ? skill.getCategory().getLabel() : null);
        vo.setStatus(skill.getStatus() != null ? skill.getStatus().getLabel() : null);
        vo.setSkillType(skill.getSkillType() != null ? skill.getSkillType().getLabel() : null);
        vo.setVisibility(skill.getVisibility() != null ? skill.getVisibility().getLabel() : null);
        vo.setVersion(skill.getVersion());
        vo.setCodeUrl(skill.getCodeUrl());
        vo.setAuthor(skill.getAuthor());
        vo.setUsageCount(skill.getUsageCount());
        vo.setIcon(skill.getIcon());
        vo.setDisplayOrder(skill.getDisplayOrder());
        vo.setMcpEndpoint(skill.getMcpEndpoint());
        vo.setLastUpdated(skill.getLastUpdated());
        return vo;
    }

    /**
     * List转换
     */
    public List<SkillVO> toVOList(List<Skill> skills) {
        if (skills == null) {
            return null;
        }
        return skills.stream()
            .map(this::toVO)
            .collect(Collectors.toList());
    }
}