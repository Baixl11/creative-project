# ChangeImpactManifest 契约

## 用途与路径

使用 `ChangeImpactManifest` 保存改动前的影响证据、风险等级和验证计划。默认只在回复中给出必要摘要；仅当用户明确要求持久化，或仓库已有同类工程文档惯例时，写入项目相对路径 `docs/engineering/change-impact-manifest.md`。不得覆盖其他变更的清单；需要并存时在文件名加入稳定的 `artifact_id`。

使用 [模板](../assets/change-impact-manifest-template.md) 生成文档。模板字段不得改名；无法确认的内容放入 `unresolved`，不得当作事实。

## 通用信封

| 字段 | 要求 |
|---|---|
| `schema_version` | 当前固定为 `1.0` |
| `artifact_type` | 固定为 `ChangeImpactManifest` |
| `artifact_id` | 稳定、可搜索，例如 `change-20260710-01` |
| `project_root` | 实际仓库根目录 |
| `created_at` | 带时区的 ISO 8601 时间 |
| `mode` | `local`、`module`、`contract`、`data-migration` 或 `security-critical` |
| `status` | `Ready` 或 `Blocked` |
| `source_artifacts` | 已读取的 StackDecision、规范、issue、ADR 或设计文档 |
| `evidence` | 使用统一证据记录格式 |
| `unresolved` | 未决问题及其对实施的影响 |

每条 `evidence` 使用：`id`、`kind`、`locator`、`observation`、`confidence`。`kind` 取 `user`、`repository`、`file`、`command`、`runtime` 或 `official-doc`；`confidence` 取 `high`、`medium` 或 `low`。

## 风险模式

按最高风险归类，不按修改文件数量降级：

| 模式 | 判定 |
|---|---|
| `local` | 单一所有权单元内的局部行为，不改变共享数据或契约 |
| `module` | 同一业务模块内跨多个文件、页面或组件 |
| `contract` | 改变 API、schema、事件、公共类型、搜索索引、任务载荷或外部消费者 |
| `data-migration` | 改变持久化结构、数据语义、迁移、回填、保留或删除策略 |
| `security-critical` | 改变认证、授权、租户隔离、权限、密钥、隐私或审计边界 |

证据不足时向更高风险模式升级。纯分析请求不得修改代码；用户要求实现时，也应先完成清单再进入实施。

## 基线

记录仓库根、适用的 `AGENTS.md`/项目规则、dirty worktree、当前分支、技术栈和版本、现有失败及其证据。不得覆盖或还原用户已有修改。没有安全且成本合理的基线命令时，将其标记为 `Not run`，说明原因。

## 数据所有权

不要要求只有一个物理数据表示。对每个核心对象记录：

- `canonical`：最终定义或拥有业务事实的系统、schema 或模块。
- `derived`：DTO、生成类型、视图模型、索引、分析宽表等派生表示及生成方式。
- `cache`：缓存所有者、key、TTL、失效和回源策略。
- `consumers`：读取者、兼容窗口和同步边界。

发现冲突时记录权威判定依据；无法判定时将状态设为 `Blocked`，不得自行选一个版本。

## 影响维度

逐项检查并允许 `N/A`：页面和组件、API、schema、事件、缓存、搜索索引、后台 job、分析统计、权限与审计、配置与 feature flag、迁移与 backfill、外部消费者、测试、文档、发布与回滚。对每项记录定义位置、引用位置、影响、证据、是否修改和验证方式。

契约变更必须说明向前/向后兼容、版本或弃用窗口。数据迁移必须说明 expand/migrate/contract 顺序、幂等、回填校验、失败恢复和回滚限制。安全关键变更必须说明越权、租户隔离、敏感数据和审计验证。

## 验证计划与循环限制

验证计划必须映射每个验收标准和高风险影响项，按“小范围静态检查与目标测试 -> 模块/契约测试 -> 构建/集成/E2E”排列。命令由仓库配置发现，不在清单中猜测。

`verification_iteration` 初始为 `0`。验证失败后最多重新进入影响分析和修复两次；每次递增并只处理有证据的遗漏。达到 `2` 仍失败时停止循环，将状态设为 `Blocked`，报告剩余风险并请求决策。
