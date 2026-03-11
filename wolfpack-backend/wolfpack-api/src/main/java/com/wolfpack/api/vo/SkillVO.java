package com.wolfpack.api.vo;

import com.wolfpack.admin.entity.Skill;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 技能视图对象
 * 
 * @author 狼头
 * @since 1.0.0
 */
@Data
public class SkillVO {

    private String id;
    private String name;
    private String description;
    private String category;
    private String status;
    private String skillType;
    private String visibility;
    private String version;
    private String codeUrl;
    private String author;
    private Integer usageCount;
    private String icon;
    private Integer displayOrder;
    private String mcpEndpoint;
    private LocalDateTime lastUpdated;

    /**
     * 实体转VO
     */
    public static SkillVO fromEntity(Skill skill) {
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
}