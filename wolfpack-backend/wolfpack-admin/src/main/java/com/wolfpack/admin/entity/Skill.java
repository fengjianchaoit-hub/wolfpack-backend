package com.wolfpack.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

/**
 * 技能实体类
 */
@Data
@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillStatus status = SkillStatus.ACTIVE;

    @Column(nullable = false)
    private String version;

    @Column(name = "code_url")
    private String codeUrl;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    private String author;

    @Column(name = "usage_count")
    private Integer usageCount = 0;

    @Column(length = 500)
    private String tags;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (lastUpdated == null) {
            lastUpdated = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SkillCategory {
        TESTING("测试"),
        MONITORING("监控"),
        AUTOMATION("自动化"),
        INTEGRATION("集成");

        private final String label;

        SkillCategory(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }

    public enum SkillStatus {
        ACTIVE("生产中"),
        INACTIVE("已停用"),
        DEVELOPMENT("开发中");

        private final String label;

        SkillStatus(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }
}
