package com.wolfpack.api.vo;

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
}