# VerificationReport 契约

## 用途与路径

使用 `VerificationReport` 保存修改后的证据、测试结果和发布判断。默认只在回复中报告结果；仅当用户明确要求持久化，或仓库已有同类工程文档惯例时，写入项目相对路径 `docs/engineering/verification-report.md`。多个变更并存时在文件名加入与 manifest 对应的 `artifact_id`。

使用 [模板](../assets/verification-report-template.md) 生成文档。报告必须引用对应 `ChangeImpactManifest`；缺失时先重建最小清单并标记降级，不得假装已经完成改前分析。

## 通用信封

| 字段 | 要求 |
|---|---|
| `schema_version` | 当前固定为 `1.0` |
| `artifact_type` | 固定为 `VerificationReport` |
| `artifact_id` | 稳定、可搜索，并能关联 manifest |
| `project_root` | 实际仓库根目录 |
| `created_at` | 带时区的 ISO 8601 时间 |
| `mode` | 继承 manifest 的风险模式 |
| `status` | `Pass`、`Fail`、`Blocked`、`Not run` 或 `N/A` |
| `source_artifacts` | manifest、StackDecision、规范、CI 或测试报告路径 |
| `evidence` | 使用统一证据记录格式 |
| `unresolved` | 未决问题及其发布影响 |

每条 `evidence` 使用：`id`、`kind`、`locator`、`observation`、`confidence`。`kind` 取 `repository`、`file`、`command`、`runtime`、`screenshot` 或 `user`；`confidence` 取 `high`、`medium` 或 `low`。

## 状态语义

每项检查只能使用以下状态：

- `Pass`：实际执行或直接观察，结果满足预期并有证据。
- `Fail`：实际结果不满足预期并有证据。
- `Blocked`：尝试执行，但缺少环境、权限、依赖或安全前提。
- `Not run`：未尝试执行；必须说明原因，不能视为通过。
- `N/A`：经影响证据确认不适用；必须说明判定依据。

总体状态取最严重结果：存在新 `Fail` 则为 `Fail`；无 Fail 但关键项 `Blocked` 则为 `Blocked`；所有适用关键项 Pass 才为 `Pass`；没有执行任何适用验证时为 `Not run`。仅在没有适用检查时使用 `N/A`。

## 基线与命令发现

先记录仓库根、适用规则、dirty worktree、分支、技术栈与版本、现有 CI/测试失败。优先读取已有测试报告；需要运行基线时，只运行安全且与变更相关的最小命令。将既有失败与本次新增失败分开。

从仓库发现命令：读取 `package.json` scripts、锁文件、workspace 配置、`pyproject.toml`、`pom.xml`、Maven/Gradle wrapper、CI workflow 和项目文档。使用仓库实际包管理器和 wrapper，不臆造 `npm run test`、`mypy app` 等命令。

每次命令记录：`command`、`cwd`、`environment`、`started_at`、`duration`、`exit_code`、`status`、`evidence_id`。超时、信号终止和没有发现命令均不得记录为 Pass。

## 安全边界

执行前读取脚本定义，确认不会连接生产数据库、真实外部服务或发送通知。迁移、backfill、删除、写入型 E2E、付费 API 和需要真实凭据的测试必须使用隔离环境；安全前提不满足时标记 `Blocked`，不得用生产环境试跑。保留用户已有工作区修改，不清理或重置未知文件。

## 从小到大的验证顺序

1. 对照 manifest 与实际 diff，识别遗漏影响和意外修改。
2. 运行受影响文件的静态检查、类型检查或编译目标。
3. 运行复现原问题的回归测试和最小目标测试。
4. 按风险扩展到模块、契约、构建、集成或 E2E。
5. 在隔离环境验证 API/schema/event、cache/search/job/analytics、permissions、migration/backfill、rollout/rollback。

`local` 通常止于第 3 步；`module` 至少覆盖模块测试；`contract` 加入生产者/消费者契约；`data-migration` 验证迁移、回填、校验和恢复；`security-critical` 验证拒绝路径、越权、租户隔离、敏感数据与审计。

## 循环限制

继承 manifest 的 `verification_iteration`。失败需要修改时，可调用 `$change-impact-analysis` 重新评估并递增；同一任务最多两次。达到 `2` 后停止自动往返，将剩余项设为 `Blocked` 并请求用户决策。若 companion Skill 不可用，执行本 Skill 的最小影响复核并在 `source_artifacts` 标记 `degraded`。
