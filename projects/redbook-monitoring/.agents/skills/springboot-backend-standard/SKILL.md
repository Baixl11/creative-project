---
name: springboot-backend-standard
description: 为 Java Spring Boot 服务提供版本感知的初始化、现有项目修改和代码审查规范，覆盖模块边界、HTTP 契约、Spring Security、事务、JPA/MyBatis、数据库迁移、测试、可观测性和发布。用户明确使用 Spring Boot 并要求搭建、开发、重构或审查后端时使用；非 Spring Boot Java 项目、仅做技术选型或普通 Java 问答时不使用。
---

# Spring Boot 工程规范

以项目实际 Java、Spring Boot、Spring Framework、构建工具和依赖版本为准。不要为套用模板擅自升级 major、改 ORM、拆微服务或重组包结构。

## 选择模式

| 模式 | 行为 |
|---|---|
| `greenfield` | 基于业务边界和运维能力选择最小可维护架构。 |
| `existing-project` | 保持现有约定，先定位变更边界；迁移或重构单独授权。 |
| `review` | 输出带证据的问题、风险和验证建议，不直接修改。 |

## 按需读取

- 涉及模块、HTTP、持久化、事务和迁移时读取 [references/architecture-and-data.md](references/architecture-and-data.md)。
- 涉及安全、测试、可观测性和发布时读取 [references/security-and-quality.md](references/security-and-quality.md)。

## 第一步：识别真实项目

检查并记录：

- Java、Spring Boot、Spring Security、ORM/SQL 框架和数据库版本。
- Maven/Gradle wrapper、锁定策略、模块结构、profile 和配置来源。
- Controller、application/service、domain、repository/mapper 的实际边界。
- Servlet 或 reactive 栈；不要在同一规则中混用 MVC 与 WebFlux 假设。
- 认证方式、租户模型、数据库迁移、消息系统、缓存和任务调度。
- 测试命令、Testcontainers、CI、容器、探针、监控和发布方式。
- 当前 git 状态、用户已有修改和基线测试失败。

对认证、事务、数据驻留、多租户、消息一致性或发布约束不能安全假设时先确认。

## Greenfield 决策

| 决策 | 选择条件 |
|---|---|
| 模块化单体 | 团队和业务规模尚不需要独立部署，优先明确模块边界。 |
| 微服务 | 独立扩缩、故障隔离、数据所有权和团队自治收益已超过运维成本。 |
| Spring Data JPA | 聚合关系清晰、领域操作为主，团队能管理 fetch 和事务。 |
| MyBatis | SQL 控制、复杂报表或已有 SQL 资产是主要约束。 |
| Session/OIDC 登录 | 浏览器应用、SSO、MFA 或集中身份治理。 |
| OAuth2 Resource Server | API 接收受信发行方 access token。不要自行拼装 JWT 过滤器替代标准能力。 |

每个模块只选择一套主要持久化模式；混用必须有明确边界和测试。

## 模块与分层

1. 按业务能力组织模块，再在模块内划分 adapter/application/domain/infrastructure 或项目既有层次。
2. Controller 处理 HTTP 边界，不承载长事务、跨模块编排和复杂权限推导。
3. Application/service 表达 use case 和事务边界；domain 保持与传输和持久化细节解耦到项目所需程度。
4. Repository/mapper 是数据访问边界，不允许其他模块直接操作其表或内部实体。
5. DTO、领域对象和 Entity 可以不同；通过显式 mapper 控制敏感字段和兼容语义。
6. 小型服务不强制空洞分层；删除只转发、不增加边界价值的抽象。

## HTTP 与错误契约

- 为请求和响应使用明确 DTO 与 Bean Validation；Entity 不作为外部契约。
- 优先使用标准 HTTP 状态和项目既有错误契约；支持时采用 `ProblemDetail` 表达机器可读错误。
- 统一 envelope 只能在项目确有契约时使用，且不得破坏 204、304、文件、流、SSE 和错误状态语义。
- 每个 Controller、消息入口和 use case 都执行所需授权；路由可达不代表对象可访问。
- 契约变更同步 OpenAPI、消费者、SDK、测试和兼容策略。

## 数据、事务与消息

- 事务围绕 use case，而不是笼统规定“所有 Service 方法”。明确传播、隔离、只读和超时。
- 避免在数据库事务中执行不可控远程调用；跨资源一致性使用 outbox、状态机、幂等消费者或补偿。
- 数据库变更使用项目选定的 Flyway 或 Liquibase，并采用 expand/backfill/switch/contract。
- 对并发更新使用数据库约束、版本列、条件更新或明确锁策略。
- 检查 JPA N+1、无界集合、错误 cascade、懒加载越界和分页 count 成本。
- 明确缓存 key、TTL、失效、穿透和多租户隔离；缓存不是新的权威数据源。

## 安全

- 使用 `SecurityFilterChain` 和框架标准认证能力；版本相关配置以已安装文档为准。
- cookie/session 请求保留适当 CSRF 防护；bearer API 仍需 origin/CORS、token audience 和权限检查。
- 方法级或 use-case 授权必须结合对象/tenant 约束，防止只检查角色的越权。
- 秘密、token、个人信息和原始敏感 payload 不进入日志、异常或 metrics 标签。
- 文件、URL、反序列化、表达式和模板入口设置白名单、大小、超时和资源限制。

## 测试与运行

- 从 wrapper 和 CI 发现命令；先运行目标模块，再按风险扩大到 slice、集成、契约和端到端测试。
- 使用 Testcontainers 或等价隔离环境验证真实数据库、迁移、消息和缓存语义。
- 覆盖授权、事务回滚、并发、幂等、迁移、序列化、时区和外部依赖失败。
- 使用 Actuator/Micrometer/OpenTelemetry 或现有体系提供结构化日志、metrics、trace、readiness 和 liveness。
- 验证优雅关闭、连接排空、消息重平衡、配置校验、发布顺序和回滚条件。

## 变更安全

选择且只选择命中的最高风险模式：

- `local`：单一 Controller、mapper 或同一所有权单元内的局部行为。
- `module`：同一业务模块内跨 Controller、service、repository 或 job 的共享行为。
- `contract`：HTTP/OpenAPI、消息、公共 DTO、任务载荷或外部消费者。
- `data-migration`：数据库结构/语义、migration、backfill、保留或删除。
- `security-critical`：认证授权、租户、支付、秘密、隐私或审计边界。

按 `security-critical > data-migration > contract > module > local` 升级，不因改动文件少而降级。

- `existing-project` 实现模式以及 greenfield 开始写入代码前使用 `$change-impact-analysis` 并传递风险模式；`local` 只需轻量影响清单，纯 greenfield 决策和不计划修改的 review 不调用。
- 任何模式只要实施了修改，完成后都使用 `$data-consistency-regression-test` 并继承同一风险模式。
- 验证发现新的 `contract`、`data-migration` 或 `security-critical` 影响时，先升级风险并回到 `$change-impact-analysis`；最多往返两次。

companion Skill 缺失时，重建最小影响清单或执行最小验证，并标记 `degraded`；不得声称已调用。缺少隔离数据库、安全前提或两次循环后仍有关键失败时使用 `Blocked`。不要借当前修复顺带拆服务、改 ORM 或重写公共响应结构。

## 输出契约

报告执行模式、检测到的 Java/Spring Boot/Security/数据访问版本、风险模式、改动文件、契约与数据影响、命令及人工检查证据、人工验收项和回滚方法。每个测试或检查状态必须且只能使用 `Pass`、`Fail`、`Blocked`、`Not run`、`N/A`；未执行不得记为 `Pass`。review 模式按严重度给出文件与行号证据。

## 完成标准

- 规则匹配已检测的 Java/Spring 版本和项目执行模型。
- 授权、事务、迁移、消息、缓存和错误边界均有验证或明确缺口。
- API 与数据变更具有兼容、发布和回滚策略。
- 测试结果符合输出契约并附实际证据。
