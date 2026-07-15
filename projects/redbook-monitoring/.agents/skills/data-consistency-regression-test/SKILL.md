---
name: data-consistency-regression-test
description: "在代码、配置、契约或数据变更已经实施后，依据实际 diff 和 ChangeImpactManifest 验证数据所有权、派生表示、缓存、消费者、功能回归与发布准备度。用于修改完成后的验证、回归检查、发布前检查或用户明确要求核对变更完整性时；不要用于改动前影响规划、纯技术选型、尚未实施的需求设计或没有任何变更对象的通用测试建议。"
---

# 数据一致性与回归验证

## 目标与边界

消费 `ChangeImpactManifest`，用实际证据判断修改是否完整且可发布。不得用“已检查”代替命令、运行时观察或文件证据，也不得把未运行测试描述为通过。

开始前读取：

- [VerificationReport 契约](references/verification-report.md)：状态、命令发现、安全边界、风险覆盖和循环限制。
- [VerificationReport 模板](assets/verification-report-template.md)：仅在需要持久化或完整报告时使用。

## 输入和风险模式

优先读取对应 manifest，并继承其 `artifact_id` 关联、风险模式和 `verification_iteration`：

- `local`：局部行为验证。
- `module`：模块内多入口和共享行为。
- `contract`：生产者/消费者契约。
- `data-migration`：迁移、backfill 和数据恢复。
- `security-critical`：认证、权限、租户、隐私和审计。

manifest 缺失时，先根据实际请求与 diff 重建最小影响清单，标记 `degraded`，不要假装改前分析已经执行。无法识别变更对象时停止并说明所需输入。

## 执行流程

### 1. 重建验证基线

执行任何命令前：

1. 定位仓库根并读取适用的 `AGENTS.md`、项目规范和 StackDecision。
2. 检查当前分支、dirty worktree 和所有实际 diff；保护用户已有修改。
3. 从 manifest、锁文件和配置识别语言、框架、运行时、包管理器及版本。
4. 读取改动前记录、CI 历史或测试报告中的已有失败。
5. 将无法证明为既有的问题视为“来源未确认”，不得擅自归咎于本次修改或忽略。

如果无法获得改动前基线，仍可验证当前结果，但必须在报告中标记基线限制。

### 2. 对照计划与实际修改

比较 manifest 预测影响、验收标准和实际 diff：

- 标记已计划且已修改、已计划但遗漏、未计划却修改、确认无需修改的项。
- 检查生成源与生成产物、配置与代码、文档与行为是否对应。
- 对意外文件或超出范围的重构要求证据；不要自动还原用户修改。

发现新的 contract、data-migration 或 security-critical 影响时，先升级风险并调用 `$change-impact-analysis` 复核，不得在低风险计划下继续宣告通过。

### 3. 验证数据所有权和传播

对每个核心对象验证：

- `canonical` 定义是否按预期改变。
- `derived` DTO、生成类型、视图模型、索引和分析表示是否按机制更新。
- `cache` key、TTL、失效、回源和旧值兼容是否正确。
- `consumers` 页面、服务、事件订阅者、job 和外部系统是否兼容。

不要以“存在多份表示”为失败条件；只有所有权不清、生成/同步链断裂或内容不一致时才失败。

逐项覆盖 API、schema、event、cache、search、job、analytics、permissions、migration、backfill、rollout 和 rollback；不适用项使用 `N/A` 并附判定证据。

### 4. 发现并审查命令

从仓库实际配置发现命令：

- JavaScript/TypeScript：读取锁文件、workspace 和 `package.json` scripts。
- Python：读取 `pyproject.toml`、锁文件、测试配置和任务工具。
- JVM：优先使用仓库的 Maven/Gradle wrapper，并读取 profile 和 CI。
- 其他栈：读取对应 manifest、构建文件、CI 和项目文档。

运行前查看脚本定义、工作目录、依赖服务和环境变量。不得猜测不存在的 script，也不得仅因为某类项目通常使用某命令就执行它。

### 5. 保护测试环境

确认命令不会连接生产数据库、真实用户、真实通知渠道或付费外部服务。迁移、backfill、删除、写入型 E2E 和需要真实凭据的测试只在隔离环境执行。

安全前提不足时使用 `Blocked`，说明缺少的环境或批准。不要通过切换到生产环境“验证”，不要清理未知文件，不要隐藏测试造成的状态变化。

### 6. 从小到大执行

按成本和风险逐级执行：

1. 检查实际 diff、格式、静态分析、相关类型检查或编译目标。
2. 运行复现原问题的测试和受影响单元的最小目标测试。
3. 扩展到模块测试、契约测试和受影响构建目标。
4. 仅在风险需要且环境安全时运行集成、E2E、性能或安全验证。
5. 在隔离环境验证 migration/backfill、事件、cache/search/job/analytics、权限、rollout 和 rollback。

前一级失败时先判断后续测试是否仍能提供独立证据；不要无意义地执行全部命令。`local` 不强制全量 E2E，`contract` 必须覆盖消费者，`data-migration` 必须覆盖数据校验与恢复，`security-critical` 必须覆盖拒绝路径和越权。

### 7. 记录证据和状态

每个检查使用且只使用：

- `Pass`：已执行或直接观察，符合预期并有证据。
- `Fail`：结果不符合预期并有证据。
- `Blocked`：已尝试但缺环境、权限、依赖或安全前提。
- `Not run`：未尝试；必须说明原因。
- `N/A`：有证据确认不适用。

每个命令记录 `command`、`cwd`、`environment`、`duration`、`exit_code`、`status` 和 `evidence_id`。命令不存在、超时、被终止或没有输出证据时不得记为 Pass。

分开报告既有失败、本次新增失败和来源未确认失败。只有所有适用的关键验收项都有 Pass 证据时，总体状态才可为 `Pass`。

### 8. 输出和交接

至少输出：

1. 变更摘要、风险模式、基线限制和实际修改范围。
2. manifest 对照结果及遗漏或意外修改。
3. canonical/derived/cache/consumers 一致性。
4. 按状态列出的命令和人工检查证据。
5. 新增失败、Blocked、Not run、N/A 及原因。
6. rollout 前提、rollback 限制、剩余风险和最终状态。

默认在回复中报告。仅在用户明确要求或仓库已有同类惯例时，按模板写入 `docs/engineering/verification-report.md`；使用关联 `artifact_id`，保护已有报告。

## 循环与完成条件

需要补改时调用 `$change-impact-analysis`，递增 `verification_iteration` 后只修复有证据的遗漏。companion Skill 缺失时执行最小影响复核并标记 `degraded`。同一任务最多往返两次；达到 `2` 后停止自动循环，将未解决关键项设为 `Blocked` 并请求决策。

结束前确认：

- 仓库、dirty worktree、版本和已有失败已记录。
- 测试命令来自仓库且已审查安全前提。
- 验证顺序从小到大，与风险模式相称。
- 所有检查状态符合统一语义并带 evidence。
- API/schema/event/cache/search/job/analytics/permissions/migration/backfill/rollout/rollback 均有结果或有证据的 `N/A`。
- 没有把未运行、被阻塞或既有失败包装成通过。
