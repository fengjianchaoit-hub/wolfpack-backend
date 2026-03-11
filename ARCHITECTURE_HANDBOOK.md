# 狼牙团队工程重构手册（最终版）

**版本**: V2.0 最终版  
**生效日期**: 2026-03-11  
**架构师**: 狼头（高级架构师）  
**规范标准**: 阿里巴巴Java开发手册（嵩山版）+ 互联网大厂最佳实践  
**适用范围**: 狼牙团队所有Java工程（wolfpack-backend及后续项目）  

---

## 🎯 架构师宣言

> 代码是写给人看的，只是恰好能运行。
> 
> —— 狼头架构准则

**核心价值观**:
- 🧹 **代码洁癖**: 不允许任何魔法数字、无意义注释、重复代码
- 🔒 **质量优先**: 宁可延期交付，也不妥协代码质量
- 📐 **规范至上**: 所有代码必须符合本手册规范，无例外
- 🏗️ **长期主义**: 今天的代码要能被6个月后的自己轻松理解

---

## 一、工程架构规范（强制）

### 1.1 分层架构（严格四层）

```
┌─────────────────────────────────────────────────────────────┐
│                     应用层 (Application)                      │
│  ├─ Controller    HTTP请求入口，参数校验，调用Service          │
│  ├─ Assembler     DTO/VO/Entity转换（禁止在Service层转换）    │
│  └─ Scheduler     定时任务调度                                 │
├─────────────────────────────────────────────────────────────┤
│                     领域层 (Domain)                           │
│  ├─ Service       业务逻辑，事务管理，领域编排                 │
│  ├─ Domain        领域实体，值对象，领域服务                   │
│  └─ Repository    仓储接口（定义，非实现）                     │
├─────────────────────────────────────────────────────────────┤
│                   基础设施层 (Infrastructure)                  │
│  ├─ RepositoryImpl 仓储实现（JPA/MyBatis）                    │
│  ├─ Mapper        数据库映射                                   │
│  ├─ Config        配置类（Redis、WebSocket等）                │
│  └─ External      外部服务调用（Feign、HTTP Client）          │
├─────────────────────────────────────────────────────────────┤
│                    公共层 (Common)                            │
│  ├─ Exception     全局异常、错误码                             │
│  ├─ Utils         工具类（禁止业务逻辑）                       │
│  └─ Constants     常量定义                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 模块划分规范

**当前问题**: wolfpack-api包含entity/vo/enums，模块职责不清

**目标结构**:
```
wolfpack-backend/
├── wolfpack-domain/          # ✅ 新增：领域层（实体、枚举、值对象）
│   ├── src/main/java/com/wolfpack/domain/
│   │   ├── entity/           # JPA实体
│   │   ├── enums/            # 枚举
│   │   ├── valueobject/      # 值对象
│   │   └── repository/       # 仓储接口
│   └── pom.xml
│
├── wolfpack-api/             # 修改：只含DTO、Feign接口
│   ├── src/main/java/com/wolfpack/api/
│   │   ├── dto/              # 入参DTO（Request）
│   │   ├── vo/               # 出参VO（Response）
│   │   └── client/           # Feign客户端接口
│   └── pom.xml
│
├── wolfpack-application/     # ✅ 新增：应用层（Controller、定时任务）
│   ├── src/main/java/com/wolfpack/application/
│   │   ├── controller/       # REST API入口
│   │   ├── scheduler/        # 定时任务
│   │   └── assembler/        # 对象转换
│   └── pom.xml
│
├── wolfpack-service/         # 保留：业务逻辑层
│   ├── src/main/java/com/wolfpack/service/
│   │   ├── impl/             # Service实现
│   │   └── converter/        # MapStruct转换器
│   └── pom.xml
│
├── wolfpack-infrastructure/  # ✅ 新增：基础设施层
│   ├── src/main/java/com/wolfpack/infrastructure/
│   │   ├── repository/       # JPA Repository实现
│   │   ├── mapper/           # MyBatis Mapper
│   │   ├── config/           # 配置类
│   │   └── external/         # 外部服务调用
│   └── pom.xml
│
└── wolfpack-common/          # 保留：公共工具
    └── src/main/java/com/wolfpack/common/
```

### 1.3 包命名规范（强制）

```java
// ✅ 正确
package com.wolfpack.domain.entity;        // 领域实体
package com.wolfpack.domain.enums;         // 枚举
package com.wolfpack.api.vo;               // 视图对象
package com.wolfpack.application.controller; // 控制器
package com.wolfpack.service.impl;         // 服务实现
package com.wolfpack.infrastructure.repository; // 仓储实现
package com.wolfpack.common.utils;         // 工具类
package com.wolfpack.common.exception;     // 异常

// ❌ 错误
package com.wolfpack.admin.entity;         // 避免用admin/domain等模糊命名
package com.wolfpack.entity;               // 太浅，无法区分层次
package com.wolfpack.controller;           // 缺少application层标识
```

---

## 二、代码规范（强制）

### 2.1 命名规范（阿里手册第1章）

#### 类名规范
```java
// ✅ 正确
public class SkillServiceImpl implements SkillService { }  // 实现类加Impl
public class SkillVO { }                                    // 视图对象
public class SkillDTO { }                                   // 数据传输对象
public class SkillConverter { }                             // 转换器
public class SkillNotFoundException extends BusinessException { } // 异常
public enum SkillStatus { }                                 // 枚举

// ❌ 错误
public class skillService { }      // 首字母小写
public class Skillservice { }      // 驼峰错误
public class skill { }             // 实体类无后缀
public class ISkillService { }     // 接口加I前缀（Java不这样命名）
```

#### 方法名规范
```java
// ✅ 正确
public SkillVO getSkillById(String id);           // 查询单个
public List<SkillVO> listSkillsByType(String type); // 查询列表
public PageResult<SkillVO> pageSkills(PageParam param); // 分页
public void createSkill(SkillCreateDTO dto);      // 创建
public void updateSkill(String id, SkillUpdateDTO dto); // 更新
public void deleteSkill(String id);               // 删除
public void enableSkill(String id);               // 启用（业务动作）

// ❌ 错误
public SkillVO getById(String id);                // 缺少主体
public List<SkillVO> getAll();                    // 太泛
public SkillVO query(String id);                  // query不规范
public void save(Skill skill);                    // save太泛，分不清create/update
public void deleteByPrimaryKey(String id);        // 过时命名
```

#### 变量名规范
```java
// ✅ 正确
private String skillName;                         // 小驼峰
private Integer usageCount;                       // 计数加Count后缀
private LocalDateTime createTime;                 // 时间加Time后缀
private Boolean isActive;                         // 布尔值加is前缀
private static final int MAX_RETRY_TIMES = 3;     // 常量全大写下划线
private static final String DEFAULT_STATUS = "ACTIVE";

// ❌ 错误
private String SkillName;                         // 大写开头
private String skill_name;                        // 下划线（Python风格）
private String name;                              // 无主体，歧义
private Integer count;                            // count什么？
private int i, j, k;                              // 无意义循环变量（短循环除外）
```

### 2.2 注释规范（阿里手册第2章）

#### 类注释（强制）
```java
/**
 * 技能实体类
 * 
 * <p>表示系统中的技能定义，包含技能元数据、状态、类型等信息</p>
 * 
 * @author 狼头
 * @since 1.0.0
 * @version 1.2.0
 * 
 * @see SkillService
 * @see SkillController
 */
@Entity
@Table(name = "wp_skill")
public class Skill extends BaseEntity {
    // ...
}
```

#### 方法注释（强制）
```java
/**
 * 根据ID获取技能详情
 * 
 * <p>优先从缓存获取，缓存未命中则查询数据库</p>
 * 
 * @param id 技能ID，不能为空
 * @return 技能视图对象，不存在则抛{@link BusinessException}
 * @throws BusinessException 当技能不存在时抛出，错误码{@link ErrorCode#SKILL_NOT_FOUND}
 * 
 * @example
 * <pre>
 * SkillVO skill = skillService.getSkillById("skill_001");
 * </pre>
 */
public SkillVO getSkillById(@NotBlank String id) {
    // ...
}
```

#### 字段注释（强制）
```java
/** 技能名称，全局唯一，长度1-64字符 */
@Column(name = "name", length = 64, nullable = false, unique = true)
private String name;

/** 输入参数JSONSchema定义，最大2000字符，用于MCP工具参数校验 */
@Column(name = "input_schema", length = 2000)
private String inputSchema;

/** 展示排序，默认0，数值越小排序越靠前 */
@Column(name = "display_order", nullable = false)
private int displayOrder = 0;
```

#### 禁止的注释
```java
// ❌ 禁止：无意义注释
private String name; // 姓名
public void save() { // 保存方法

// ❌ 禁止：过期注释
// TODO: 待优化（写了半年还在）

// ❌ 禁止：误导性注释
// 创建技能（实际上是更新）
public void createSkill() { }

// ❌ 禁止：注释掉的代码
// public void oldMethod() { }
```

### 2.3 常量定义规范

```java
/**
 * 技能常量定义
 */
public final class SkillConstants {
    
    private SkillConstants() { }
    
    // 状态常量
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";
    public static final String STATUS_DEVELOPMENT = "DEVELOPMENT";
    
    // 类型常量
    public static final String TYPE_TOOL = "TOOL";
    public static final String TYPE_MCP_TOOL = "MCP_TOOL";
    public static final String TYPE_MCP_SERVER = "MCP_SERVER";
    
    // 数值常量（带单位注释）
    /** 技能名称最大长度：64字符 */
    public static final int NAME_MAX_LENGTH = 64;
    
    /** Schema最大长度：2000字符 */
    public static final int SCHEMA_MAX_LENGTH = 2000;
    
    /** 默认排序值 */
    public static final int DEFAULT_DISPLAY_ORDER = 0;
    
    /** 缓存过期时间：60秒 */
    public static final int CACHE_EXPIRE_SECONDS = 60;
}
```

---

## 三、分层设计规范（强制）

### 3.1 Controller层规范

**职责**: HTTP请求入口、参数校验、调用Service、返回统一响应

```java
/**
 * 技能管理API
 */
@RestController
@RequestMapping("/api/v1/skills")
@Validated  // ✅ 开启方法参数校验
@Tag(name = "技能管理", description = "技能的增删改查及状态管理")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    /**
     * 获取技能列表
     */
    @GetMapping
    @Operation(summary = "获取技能列表", description = "支持按类型、状态筛选")
    public R<List<SkillVO>> listSkills(
            @RequestParam(required = false) String skillType,
            @RequestParam(required = false) String status) {
        List<SkillVO> list = skillService.listSkills(skillType, status);
        return R.ok(list);
    }

    /**
     * 获取技能详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取技能详情")
    public R<SkillVO> getSkillById(
            @PathVariable @NotBlank(message = "技能ID不能为空") String id) {
        SkillVO skill = skillService.getSkillById(id);
        return R.ok(skill);
    }

    /**
     * 创建技能
     */
    @PostMapping
    @Operation(summary = "创建技能")
    public R<SkillVO> createSkill(
            @RequestBody @Valid SkillCreateDTO dto) {  // ✅ @Valid开启DTO校验
        SkillVO skill = skillService.createSkill(dto);
        return R.ok(skill);
    }

    /**
     * 更新技能
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新技能")
    public R<SkillVO> updateSkill(
            @PathVariable @NotBlank String id,
            @RequestBody @Valid SkillUpdateDTO dto) {
        SkillVO skill = skillService.updateSkill(id, dto);
        return R.ok(skill);
    }

    /**
     * 删除技能
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除技能")
    public R<Void> deleteSkill(
            @PathVariable @NotBlank String id) {
        skillService.deleteSkill(id);
        return R.ok();
    }
}
```

**Controller层禁止事项**:
- ❌ 禁止包含业务逻辑
- ❌ 禁止直接调用Repository
- ❌ 禁止手动设置HTTP状态码（200/500等）
- ❌ 禁止返回Entity对象
- ❌ 禁止在Controller层处理异常（交给GlobalExceptionHandler）

### 3.2 Service层规范

**职责**: 业务逻辑编排、事务管理、领域对象操作

```java
/**
 * 技能服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final SkillConverter skillConverter;
    private final CacheManager cacheManager;

    /**
     * 获取技能详情
     */
    @Override
    @Cacheable(value = "skill", key = "#id")  // ✅ 方法级缓存
    public SkillVO getSkillById(String id) {
        // 1. 参数校验（防御性编程）
        Assert.notBlank(id, () -> new BusinessException(ErrorCode.PARAM_ERROR, "技能ID不能为空"));
        
        // 2. 查询数据
        Skill skill = skillRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.SKILL_NOT_FOUND));
        
        // 3. 转换并返回
        return skillConverter.toVO(skill);
    }

    /**
     * 创建技能
     */
    @Override
    @Transactional(rollbackFor = Exception.class)  // ✅ 显式指定回滚异常
    @CacheEvict(value = "skillList", allEntries = true)  // ✅ 清空列表缓存
    public SkillVO createSkill(SkillCreateDTO dto) {
        // 1. 业务校验
        checkDuplicateName(dto.getName());
        
        // 2. 创建实体（禁止直接使用DTO）
        Skill skill = skillConverter.toEntity(dto);
        skill.setStatus(SkillStatus.DEVELOPMENT);
        skill.setUsageCount(0);
        skill.setCreateTime(LocalDateTime.now());
        
        // 3. 保存
        Skill saved = skillRepository.save(skill);
        
        // 4. 记录审计日志
        log.info("[技能创建] id={}, name={}, operator={}", 
            saved.getId(), saved.getName(), SecurityUtils.getCurrentUser());
        
        return skillConverter.toVO(saved);
    }

    /**
     * 更新技能
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(
        evict = {
            @CacheEvict(value = "skill", key = "#id"),
            @CacheEvict(value = "skillList", allEntries = true)
        }
    )
    public SkillVO updateSkill(String id, SkillUpdateDTO dto) {
        // 1. 查询
        Skill skill = skillRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.SKILL_NOT_FOUND));
        
        // 2. 校验名称唯一性（如果修改了名称）
        if (!skill.getName().equals(dto.getName())) {
            checkDuplicateName(dto.getName());
        }
        
        // 3. 更新（使用Converter选择性复制）
        skillConverter.updateEntity(dto, skill);
        skill.setUpdateTime(LocalDateTime.now());
        
        // 4. 保存
        Skill updated = skillRepository.save(skill);
        
        return skillConverter.toVO(updated);
    }

    /**
     * 删除技能
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSkill(String id) {
        // 1. 查询
        Skill skill = skillRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.SKILL_NOT_FOUND));
        
        // 2. 业务校验：运行中的技能不能删除
        if (skill.getStatus() == SkillStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.SKILL_STATUS_INVALID, "运行中的技能不能删除，请先停用");
        }
        
        // 3. 删除
        skillRepository.deleteById(id);
        
        log.info("[技能删除] id={}, name={}", id, skill.getName());
    }

    // ========== 私有方法 ==========
    
    private void checkDuplicateName(String name) {
        if (skillRepository.existsByName(name)) {
            throw new BusinessException(ErrorCode.SKILL_NAME_EXISTS);
        }
    }
}
```

**Service层禁止事项**:
- ❌ 禁止返回Entity（必须返回VO/DTO）
- ❌ 禁止接收Entity参数（必须接收DTO）
- ❌ 禁止在Service层组装HTTP响应
- ❌ 禁止使用魔法数字/字符串
- ❌ 禁止catch异常后仅打印日志（要么处理，要么抛出）

### 3.3 Repository层规范

**职责**: 数据访问，只负责CRUD，无业务逻辑

```java
/**
 * 技能仓储接口（定义）
 */
public interface SkillRepository extends JpaRepository<Skill, String> {
    
    /**
     * 根据名称查询（唯一索引，返回Optional）
     */
    Optional<Skill> findByName(String name);
    
    /**
     * 检查名称是否存在
     */
    boolean existsByName(String name);
    
    /**
     * 根据类型查询列表
     */
    List<Skill> findBySkillType(SkillType skillType);
    
    /**
     * 根据状态查询列表
     */
    List<Skill> findByStatus(SkillStatus status);
    
    /**
     * 分页查询（带条件）
     */
    Page<Skill> findBySkillTypeAndStatus(SkillType skillType, SkillStatus status, Pageable pageable);
}
```

---

## 四、DTO/VO/Entity转换规范（强制）

### 4.1 使用MapStruct进行转换

```java
/**
 * Skill转换器
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SkillConverter {

    SkillConverter INSTANCE = Mappers.getMapper(SkillConverter.class);

    /**
     * Entity -> VO
     */
    @Mappings({
        @Mapping(target = "category", expression = "java(entity.getCategory() != null ? entity.getCategory().getLabel() : null)"),
        @Mapping(target = "status", expression = "java(entity.getStatus() != null ? entity.getStatus().getLabel() : null)"),
        @Mapping(target = "skillType", expression = "java(entity.getSkillType() != null ? entity.getSkillType().getLabel() : null)")
    })
    SkillVO toVO(Skill entity);

    /**
     * DTO -> Entity（创建）
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "usageCount", ignore = true)
    @Mapping(target = "createTime", ignore = true)
    @Mapping(target = "updateTime", ignore = true)
    Skill toEntity(SkillCreateDTO dto);

    /**
     * DTO -> Entity（更新，选择性复制）
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "usageCount", ignore = true)
    @Mapping(target = "createTime", ignore = true)
    @Mapping(target = "updateTime", ignore = true)
    void updateEntity(SkillUpdateDTO dto, @MappingTarget Skill entity);

    /**
     * List转换
     */
    List<SkillVO> toVOList(List<Skill> entities);
}
```

### 4.2 DTO定义规范

```java
/**
 * 技能创建请求
 */
@Data
@Schema(description = "技能创建请求")
public class SkillCreateDTO {

    @NotBlank(message = "技能名称不能为空")
    @Size(max = 64, message = "技能名称长度不能超过64字符")
    @Schema(description = "技能名称，全局唯一", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotBlank(message = "技能描述不能为空")
    @Size(max = 500, message = "技能描述长度不能超过500字符")
    @Schema(description = "技能描述")
    private String description;

    @NotNull(message = "技能分类不能为空")
    @Schema(description = "技能分类")
    private SkillCategory category;

    @NotBlank(message = "版本号不能为空")
    @Pattern(regexp = "^\\d+\\.\\d+\\.\\d+$", message = "版本号格式必须为x.x.x")
    @Schema(description = "版本号，格式x.x.x")
    private String version;

    @URL(message = "代码仓库URL格式不正确")
    @Schema(description = "代码仓库URL")
    private String codeUrl;

    @NotBlank(message = "作者不能为空")
    @Schema(description = "作者")
    private String author;
}
```

---

## 五、异常处理规范（强制）

### 5.1 异常体系

```
Throwable
├── Error（系统级错误，不处理）
└── Exception
    ├── RuntimeException
    │   ├── BusinessException（业务异常，预期内）
    │   ├── ValidationException（参数校验异常）
    │   └── SystemException（系统异常，预期外）
    └── CheckedException（尽量不抛出）
```

### 5.2 使用规范

```java
// ✅ 业务异常（用户可理解的错误）
if (skill == null) {
    throw new BusinessException(ErrorCode.SKILL_NOT_FOUND);
}

// ✅ 参数校验异常（自动由@Valid触发）
@NotBlank(message = "名称不能为空")
private String name;

// ✅ 系统异常（预期外，记录详细日志）
try {
    apiClient.call();
} catch (IOException e) {
    log.error("[外部API调用失败] url={}", url, e);
    throw new SystemException("外部服务暂时不可用，请稍后重试");
}

// ❌ 禁止使用
throw new RuntimeException("错误");                    // 太泛
throw new Exception("错误");                           // 强制捕获
```

---

## 六、日志规范（强制）

### 6.1 日志格式

```
[时间|线程|级别|类名|TraceID|操作人|动作|对象|耗时|结果|附加信息]
```

### 6.2 使用示例

```java
// 业务操作日志
log.info("[{}|{}|INFO|SkillService|{}|{}|CREATE|{}|{}ms|SUCCESS|name={}]",
    DateUtil.now(),
    Thread.currentThread().getName(),
    MDC.get("traceId"),
    SecurityUtils.getCurrentUser(),
    savedSkill.getId(),
    stopWatch.getTotalTimeMillis(),
    savedSkill.getName()
);

// 异常日志
log.error("[{}|{}|ERROR|SkillService|{}|{}|GET|{}|{}ms|FAIL|err={}]",
    DateUtil.now(),
    Thread.currentThread().getName(),
    MDC.get("traceId"),
    SecurityUtils.getCurrentUser(),
    id,
    duration,
    e.getMessage(),
    e  // 异常对象放最后，打印堆栈
);
```

---

## 七、数据库规范（强制）

### 7.1 表命名规范

```sql
-- ✅ 正确
wp_skill                -- 模块前缀_表名，小写，下划线分隔
wp_skill_category       -- 关联表
wp_skill_execution_log  -- 多单词用下划线

-- ❌ 错误
skill                   -- 无前缀
Skill                   -- 大写
skillCategory           -- 驼峰
wp_skillcategory        -- 无分隔符
```

### 7.2 字段命名规范

```java
@Column(name = "create_time")      // 时间字段：xx_time
@Column(name = "is_deleted")       // 布尔字段：is_xx
@Column(name = "skill_type")       // 枚举字段：xx_type
@Column(name = "config_json")      // JSON字段：xx_json
```

### 7.3 索引规范

```java
@Entity
@Table(name = "wp_skill", 
    indexes = {
        @Index(name = "idx_skill_type", columnList = "skill_type"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_name", columnList = "name", unique = true),
        @Index(name = "idx_type_status", columnList = "skill_type,status")  // 复合索引
    }
)
public class Skill { }
```

---

## 八、接口设计规范（强制）

### 8.1 RESTful API规范

```java
// ✅ 正确
GET    /api/v1/skills              # 列表
GET    /api/v1/skills/{id}         # 详情
POST   /api/v1/skills              # 创建
PUT    /api/v1/skills/{id}         # 全量更新
PATCH  /api/v1/skills/{id}         # 部分更新
DELETE /api/v1/skills/{id}         # 删除
POST   /api/v1/skills/{id}/enable  # 业务动作

// ❌ 错误
GET /api/v1/getSkill               # 动词开头
GET /api/v1/skillList              # List后缀
POST /api/v1/addSkill              # add前缀
POST /api/v1/deleteSkill           # POST删除
```

### 8.2 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { },
  "timestamp": "2026-03-11T13:00:00"
}
```

---

## 九、重构路线图

### Phase 1: 基础规范（本周完成）✅
- [x] 统一响应R<T>
- [x] 全局异常处理
- [x] 业务异常体系
- [ ] Service返回VO
- [ ] 参数校验@Valid

### Phase 2: 架构重构（下周完成）
- [ ] 模块拆分（domain/api/application）
- [ ] 包结构迁移
- [ ] MapStruct转换器
- [ ] 数据库索引优化

### Phase 3: 质量提升（本月完成）
- [ ] 单元测试（覆盖率>80%）
- [ ] 集成SpringDoc
- [ ] 日志规范统一
- [ ] 代码审查Checklist

### Phase 4: 长期优化
- [ ] DDD领域建模
- [ ] 事件驱动架构
- [ ] 性能压测优化

---

## 十、代码审查Checklist（每次PR必查）

- [ ] 命名是否符合规范
- [ ] 是否包含无意义注释
- [ ] 是否有魔法数字/字符串
- [ ] Controller是否返回R<T>
- [ ] Service是否返回VO（非Entity）
- [ ] 是否有全局异常处理
- [ ] 事务注解是否正确
- [ ] 日志格式是否规范
- [ ] 是否包含单元测试
- [ ] 数据库字段是否有索引

---

## 📌 执行纪律

**违规后果**:
- 🔴 P0级违规：强制重写
- 🟡 P1级违规：限期3天内修复
- 🟢 P2级违规：下次迭代前修复

**豁免条件**:
无。所有代码必须通过架构师审查。

---

**手册维护**: 狼头（架构师）  
**生效日期**: 2026-03-11  
**版本**: V2.0 最终版
