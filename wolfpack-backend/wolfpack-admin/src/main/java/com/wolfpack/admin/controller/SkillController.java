package com.wolfpack.admin.controller;

import com.wolfpack.admin.entity.Skill;
import com.wolfpack.admin.service.SkillService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 技能管理API控制器
 */
@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    /**
     * 获取所有技能
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSkills() {
        List<Skill> skills = skillService.getAllSkills();
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", skills);
        return ResponseEntity.ok(response);
    }

    /**
     * 根据ID获取技能
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSkillById(@PathVariable String id) {
        Skill skill = skillService.getSkillById(id)
            .orElseThrow(() -> new RuntimeException("技能不存在"));
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", skill);
        return ResponseEntity.ok(response);
    }

    /**
     * 创建新技能
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSkill(@RequestBody Skill skill) {
        Skill saved = skillService.createSkill(skill);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "创建成功");
        response.put("data", saved);
        return ResponseEntity.ok(response);
    }

    /**
     * 更新技能
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateSkill(
            @PathVariable String id,
            @RequestBody Skill skill) {
        Skill updated = skillService.updateSkill(id, skill);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "更新成功");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    /**
     * 更新技能状态
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateSkillStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        Skill updated = skillService.updateSkillStatus(id, request.getStatus());
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "状态更新成功");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    /**
     * 删除技能
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSkill(@PathVariable String id) {
        skillService.deleteSkill(id);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "删除成功");
        return ResponseEntity.ok(response);
    }

    /**
     * 从GitHub同步技能
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncFromGithub() {
        skillService.syncFromGithub();
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "同步任务已启动");
        return ResponseEntity.ok(response);
    }

    @Data
    public static class StatusUpdateRequest {
        private Skill.SkillStatus status;
    }
}
