# StackDecision 契约

## 用途与路径

使用 `StackDecision` 记录可复核的技术栈与架构决策。默认只在回复中给出摘要；仅当用户明确要求持久化，或仓库已有同类工程文档惯例时，写入项目相对路径 `docs/engineering/stack-decision.md`。不得覆盖已有文件，先读取后合并或提出更新建议。

使用 [模板](../assets/stack-decision-template.md) 生成文档。模板字段不得改名；没有证据的字段标记为 `unknown`，不得猜测。

## 通用信封

三个工程产物统一使用以下字段：

| 字段 | 要求 |
|---|---|
| `schema_version` | 当前固定为 `1.0` |
| `artifact_type` | 固定为 `StackDecision` |
| `artifact_id` | 稳定、可搜索，例如 `stack-20260710-01` |
| `project_root` | 仓库根目录；无仓库时为 `N/A` |
| `created_at` | 带时区的 ISO 8601 时间 |
| `mode` | `decision-only` 或 `greenfield` |
| `status` | `Ready`、`Blocked` 或 `Unsupported` |
| `source_artifacts` | 已读取的项目规范、ADR、清单和相关产物路径 |
| `evidence` | 使用统一证据记录格式 |
| `unresolved` | 未决问题及其对结论的影响 |

每条 `evidence` 使用：`id`、`kind`、`locator`、`observation`、`confidence`。`kind` 取 `user`、`repository`、`file`、`command` 或 `official-doc`；`confidence` 取 `high`、`medium` 或 `low`。

## 模式

- `decision-only`：只比较和推荐，不创建项目、不安装依赖、不修改仓库。
- `greenfield`：为尚未实现的项目制定初始化决策。只有用户明确要求实现后，才进入写入或初始化阶段。

现有项目若技术栈已确定，不使用本 Skill 推翻现有选择。只有用户明确要求迁移或重新评估时，使用 `decision-only`，并把迁移成本列为硬约束。

## 支持目录

默认只把下列有配套规范的栈列为可推荐方案；执行时先确认相应 Skill 实际可用：

| 技术方向 | 配套 Skill |
|---|---|
| React + TypeScript Web | `$react-typescript-web-standard` |
| Vue + TypeScript Web | `$vue-typescript-web-standard` |
| Next.js 全栈 | `$nextjs-fullstack-standard` |
| Flutter 移动端 | `$flutter-mobile-standard` |
| Electron 桌面端 | `$electron-desktop-standard` |
| FastAPI 后端 | `$fastapi-backend-standard` |
| Spring Boot 后端 | `$springboot-backend-standard` |

用户硬约束要求 React Native、原生移动端、Tauri、Qt、.NET、NestJS、Go、Rust、小程序或其他未覆盖栈时，将标准支持标记为 `unsupported`。可以说明技术上可能合适，但不得声称存在对应规范；给出新增规范 Skill 或采用项目现有规范的缺口处理方案。

## 加权决策

先淘汰违反硬约束的候选，再按 0-5 分评分。默认权重仅作起点，必须根据用户目标调整并说明：

| 维度 | 默认权重 | 需要评估 |
|---|---:|---|
| 硬约束与运行端 | 25 | 平台、离线、性能、集成能力 |
| 团队与维护能力 | 20 | 熟练度、招聘、长期所有权 |
| 架构与非功能要求 | 20 | 规模、可靠性、实时性、可观测性 |
| 安全与合规 | 15 | 数据驻留、隐私、审计、许可证 |
| 交付周期 | 10 | 原型速度、发布渠道、工具成熟度 |
| 总体成本 | 10 | 开发、基础设施、运维、迁移和锁定成本 |

总分使用 `sum(score * weight) / 5`，同时保留原始评分与证据。硬约束不允许用高总分抵消。

## 架构决策

至少判断部署边界、模块边界、数据所有权、接口边界、同步/异步通信和可观测性。优先选择满足需求的最简单架构：默认从模块化单体或单体客户端开始；只有独立扩缩容、隔离部署、团队自治或强故障边界有证据时才建议微服务。涉及离线写入时说明同步与冲突策略；涉及多端时说明共享契约而不是强行共享 UI。

## 完成条件

只有在硬约束已确认、候选均有证据、标准支持已核实、主要风险与未决项已披露时，将状态设为 `Ready`。缺少阻塞性信息时设为 `Blocked`；最佳候选没有配套规范且用户要求完整规范组合时设为 `Unsupported`。
