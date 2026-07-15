---
name: change-impact-analysis
description: "在修改现有代码、配置、数据结构或共享行为之前，分析受影响的模块、契约、数据、消费者、安全边界和验证计划。用于用户要求实现需求、修复 bug、重构，或改变字段、API、schema、事件、权限、迁移和跨页面行为时；不要用于纯技术选型、新项目 greenfield 决策、修改完成后的独立验证，或用户明确要求只解释代码且不计划修改时。"
---

# 变更影响分析

## 目标与边界

在动手前建立有证据的 `ChangeImpactManifest`，避免只修改表面入口而遗漏共享契约、派生数据和消费者。分析请求保持只读；实现请求完成分析后再按范围修改。

开始前读取：

- [ChangeImpactManifest 契约](references/change-impact-manifest.md)：风险模式、数据所有权、影响维度和循环上限。
- [ChangeImpactManifest 模板](assets/change-impact-manifest-template.md)：仅在需要持久化或完整交接时使用。

## 风险模式

选择且只选择最高风险模式：

- `local`：单一所有权单元内的局部行为。
- `module`：同一业务模块内跨文件或跨入口。
- `contract`：API、schema、事件、公共类型、搜索索引、job 载荷或外部消费者。
- `data-migration`：持久化结构、语义、迁移、backfill、保留或删除。
- `security-critical`：认证、授权、权限、租户、密钥、隐私或审计边界。

不确定是否跨契约、数据或安全边界时，向更高风险模式升级。不要根据“只改一行”降级风险。

## 执行流程

### 1. 确认意图和验收标准

复述原始目标，列出可验证的验收标准和明确不在范围内的内容。区分：

- 只分析：保持只读，交付 manifest 或摘要。
- 分析并实现：先完成 manifest，再实施有证据支持的修改。

信息不足但可安全推断时记录假设；涉及数据丢失、兼容性、安全或不可逆发布时，必须先获取阻塞性信息。

### 2. 建立仓库基线

修改或执行测试前：

1. 定位仓库根，读取适用的 `AGENTS.md`、开发规范、ADR 和相关 StackDecision。
2. 检查当前分支、dirty worktree 和已有 diff；保留用户修改，不还原未知文件。
3. 从 manifest、锁文件和配置识别语言、框架、运行时、包管理器及版本。
4. 读取 CI、测试报告或 issue 中的已有失败；需要运行基线时，只运行安全的最小检查。
5. 将未能确认的失败状态标为 `Not run`，不得假设基线干净。

如果约定的 `docs/engineering/` 产物不存在，直接从仓库事实重建所需上下文并标记 `degraded`，不要阻塞于文档缺失。

### 3. 定位核心对象和所有权

从变更请求识别业务对象、字段、接口、schema、事件、权限标识和用户流程。先定位定义，再沿引用、调用者、消费者和生成链路扩展搜索。

为每个核心对象记录：

- `canonical` owner：拥有业务事实或契约的模块/系统。
- `derived`：DTO、生成类型、formatter、索引、报表、分析表及生成方式。
- `cache`：缓存 owner、key、TTL、失效和回源。
- `consumers`：页面、服务、job、外部系统和兼容窗口。

允许多个派生表示；目标是明确所有权与同步规则，不是强制把所有内容抽到一个文件。所有权冲突无法判定时设为 `Blocked`。

### 4. 搜索影响

使用仓库支持的搜索、语言服务、依赖图和构建配置。优先搜索稳定符号、类型和定义；对 `status`、`name` 等高噪声词组合业务对象和上下文。遵守 ignore 配置，排除依赖、构建产物和无关生成文件，但检查生成源及其再生成命令。

逐项检查并记录证据或 `N/A`：

- 页面、组件、表单、筛选、导出、国际化和可访问性。
- API、schema、公共类型、序列化、错误和外部消费者。
- 事件、队列、定时 job、重试、幂等和死信处理。
- cache、搜索索引、实时订阅和状态恢复。
- analytics、统计口径、埋点、监控和告警。
- authentication、permissions、租户隔离、隐私和审计。
- migration、backfill、约束、时区、精度、空值和历史数据。
- 配置、feature flag、部署、rollout、rollback、文档和测试。

### 5. 设计兼容与发布

`contract` 模式说明生产者/消费者、向前/向后兼容、版本或弃用窗口。`data-migration` 模式说明 expand/migrate/contract、幂等 backfill、校验、失败恢复与不可逆限制。`security-critical` 模式说明拒绝路径、越权、租户和敏感数据验证。

字段重命名或语义变更必须分别列出定义/运行时 schema、序列化、生成客户端、旧客户端、mock/fixture、导入导出、搜索/缓存、analytics/报表和外部消费者；不得用没有证据的“已同步所有消费者”代替清单。

优先修改 canonical 定义并通过明确机制更新 derived 和 cache。不要为顺手消除重复而扩大范围；与验收目标无关的重构记录为技术债，除非它是安全实施的前提或用户明确批准。

### 6. 制定验证计划

将每个验收标准和高风险影响映射到验证方法。只记录从仓库可发现的命令来源，不臆造命令。按以下顺序规划：

1. 相关静态检查、类型检查或编译目标。
2. 原问题复现和最小目标测试。
3. 模块或生产者/消费者契约测试。
4. 构建、集成、E2E、迁移和安全验证。

标出需要隔离数据库、测试账号、外部服务替身或用户批准的步骤。

### 7. 交付和实施

输出模式、基线、实际证据、影响清单、兼容策略、实施顺序、验证计划和未决项。状态为 `Blocked` 时，不实施不可逆或安全关键步骤。

默认只在回复中给出必要摘要。`contract` 字段重命名/语义变更例外：摘要必须用紧凑清单分别报告定义与运行时 schema、序列化、生成客户端、旧客户端、mock/fixture、导入导出、搜索/缓存、analytics/报表和外部消费者，逐项附证据、`unknown` 或有证据的 `N/A`，不得合并为“所有消费者”。仅在用户明确要求或仓库已有同类惯例时，按模板写入 `docs/engineering/change-impact-manifest.md`；保护已有文件并用 `artifact_id` 避免覆盖其他变更。

实施完成后调用 `$data-consistency-regression-test`。若不可用，按 manifest 执行最小验证并标记 `degraded`；不得声称已调用缺失 Skill。

## 循环与完成条件

验证返回遗漏时，可重新进入本 Skill，递增 `verification_iteration`，并只处理有证据的新影响。同一任务最多两次；达到 `2` 仍失败时停止自动循环，设为 `Blocked` 并请求决策。

结束前确认：

- 风险模式没有因改动小而降级。
- dirty worktree、版本和已有失败已记录。
- canonical、derived、cache 和 consumers 均已判定或明确未知。
- API/schema/serialization/generated client/old client/mock/import-export/event/cache/search/job/analytics/reporting/external consumer/permissions/migration/backfill/rollout/rollback 均有结论。
- 每项计划可追溯到验收标准或风险证据。
- 没有借影响分析扩大无关重构范围。
