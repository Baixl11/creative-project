# Stage Checklist

## Planner

- 读取仓库规则和需求输入。
- 读取 `.harness/environment.yaml`，确认运行、调试、前端入口、视口、测试数据和 MCP Playwright 可用性。
- 读取 `.harness/workspace-map.yaml`，确认 dev/build/test/lint/package/release 命令是否涉及父级或兄弟项目。
- 读取 `task-routing.md`、`.harness/current-task.json` 和 `.harness/tasks/index.json`，先判断新建还是续跑。
- 如果路由候选不唯一，只问一个确认问题；如果唯一匹配，直接续跑。
- 创建或续跑任务目录，并记录 `route_reason`。
- 读取 `uncertainty-gates.md`，识别初始化分析、需求分析、问题拆解、环境配置、验证命令、数据/安全/git 和视觉验收中的关键未知项。
- 读取 `research-protocol.md`，判断需求、问题、根因、方案、环境、依赖行为或验收标准是否需要调研。
- 读取 `problem-decomposition.md` 协议，并先产出 `problem-decomposition.md` 与 `acceptance-criteria.md`。
- 读取 `functional-verification.md`，判断是否需要先拆功能点和核心流程测试；涉及代码行为、状态计算、数据转换、API、IPC、文件读写、模型调用或跨项目联调时默认需要。
- 读取 `runtime-verification.md`，判断 build/typecheck/lint 之外是否需要运行时或交互验证；Electron、API、IPC、数据库、模型调用、跨项目联调和用户可见行为默认需要。
- 读取 `interaction-verification.md`，判断是否需要 `interaction-test-plan.yaml`；前端、Electron、页面、表单、按钮、菜单、弹窗、导航和视觉复刻默认需要。
- 读取 `task-observability.md` 协议，并初始化 `state.json`、`events.ndjson`、`agents.json`、`artifacts.json`、`validations.json`、`summary.md`。
- 如果问题定义、当前状态、期望状态、非目标、关键约束、根因或候选方案不清楚，先做本地调研；本地证据不足时使用工具检索官方文档、规范、issue、release note 或高质量实践，并写入 `research-notes.md`。
- 调研后必须结合当前项目架构、依赖版本、workspace 命令图和验证能力选择方案；外部方案不能直接套用。
- 调研后仍无法确认的高影响选择，向用户提出不超过 3 个问题。
- 重要决策无法从证据中完全确认时，状态必须进入 `needs_clarification` 或 `blocked_on_decision`，不得继续生成执行计划或进入编码。
- 如果需求包含截图、设计图、Figma、一比一复刻、页面实现或视觉还原，先读取 `visual-task-profile.md`。
- 如果是代码任务，规划 git 分支名和提交边界。
- 基于问题拆解产出 `task-package.yaml` 与 `exec-plan.md`，不要让执行计划替代问题拆解。
- 如果任务或验证命令涉及 related project，必须把相关项目的读取证据、`.harness` 状态、写入策略、同名分支策略和验证命令写入问题拆解与执行计划。
- related project 存在 `.harness` 时，写入策略必须是 `ask_before_write`；没有 `.harness` 时，写入策略必须是 `allowed_by_default` 并使用同名任务分支；无法确认时进入 `needs_clarification`。
- `exec-plan.md` 必须引用首选方案、工作包顺序、风险点和验收拆分。
- 涉及功能行为或核心流程时，必须产出 `functional-test-plan.md`，按功能点、风险等级、首选测试方式、测试数据和通过标准拆分；优先项目原生测试，允许任务内临时小脚本，但必须记录路径、输入、输出和是否保留。
- 涉及运行时行为或交互流程时，必须产出 `runtime-test-plan.md`，写明首选验证工具、启动方式、交互路径、可观察结果和工具缺失时的用户确认结果。
- 前端或 Electron 交互任务必须产出 `interaction-test-plan.yaml`，写明 MCP Playwright 或 Playwright 的入口、视口、步骤、预期结果、snapshot、console、network 和截图证据路径。
- 如果 `.harness/environment.yaml` 中的启动方式、入口 URL、Electron 调试方式、测试数据或 MCP/Playwright 可用性无法确认，先进入 `needs_clarification` 询问用户，不得直接把 build 作为唯一验证。
- 视觉任务必须额外产出 `visual-spec.md` 与 `visual-checklist.md`，明确参考图尺寸、目标视口、Electron 窗口尺寸、deviceScaleFactor、zoomFactor、缩放/窄屏退化视口，并把“无 open 状态 blocking/major 视觉缺陷”写入完成标准。
- 更新 `.harness/current-task.json`、`.harness/tasks/index.json`、`trace.md`、`state.json`、`agents.json`、`artifacts.json`、`summary.md`，并向 `events.ndjson` 追加 planner 事件。

## Coder

- 先读 `problem-decomposition.md`、`acceptance-criteria.md` 和 `exec-plan.md`。
- 如果 `.harness/workspace-map.yaml` 显示当前工作包涉及 related project，先读取该项目的 README、构建配置和相关源码。
- 如果问题拆解缺失、方案未选择或验收标准不可判断，先回到 planner，不要直接实现。
- 如果问题拆解声明触发了调研，但缺少 `research-notes.md` 或方案没有说明项目适配性，先回到 planner，不要直接实现。
- 如果实现中发现新的关键未知项，例如接口语义、数据结构、环境变量、依赖策略或视觉验收标准不明确，必须回到 planner 触发不确定性闸门。
- 如果当前是 git 仓库，先创建或切换到任务分支，再开始任何代码修改。
- 如果当前工作包需要编辑无 `.harness` 的附属子仓库，先在这些子仓库检查工作区并创建或切换同名任务分支，再开始代码修改。
- 如果 related project 存在 `.harness`，不得直接编辑；必须先获得用户确认并记录到 `decision-log.md`。
- 如果附属子仓库有未归属改动、分支创建失败或 `.harness` 状态无法确认，必须暂停并回到 planner 触发不确定性闸门。
- 实施最小代码改动。
- 按工作包顺序执行，不要跨越拆解边界做无关重构。
- 视觉任务先复刻整体网格、栏宽、模块边界和内容密度，再处理局部组件细节。
- 视觉任务必须按 `visual-spec.md` 实现目标视口和缩放/窄屏退化策略，不能只在当前截图尺寸下硬编码。
- 视觉任务优先使用项目已有图标、内联 SVG、CSS 图形或图片资源；不要用 Unicode 字符替代图标，除非参考图本身就是字符。
- 如果 `visual-defects.md` 中存在 open 状态的 `blocking` 或 `major` 缺陷，优先修复这些缺陷，不得新增无关功能。
- 在模块闭环、风险边界或约 300-500 行变更量处执行验证并本地提交。
- 更新 `.harness/current-task.json`、`.harness/tasks/index.json`、`decision-log.md`、`handoff.md`、`trace.md`、`state.json`、`agents.json`、`artifacts.json`、`summary.md`，并向 `events.ndjson` 追加 coder 事件。

## Verifier

- 执行 `.harness/project-profile.yaml` 中的真实传感器命令。
- 如果传感器命令会触发 related project 构建或测试，必须记录涉及的项目和失败归属。
- 如果验证命令、运行环境、副作用、凭证、外部服务或验收含义无法完全确认，先触发不确定性闸门，不得伪造或猜测验证结果。
- 如果存在 `functional-test-plan.md`，必须先执行功能点测试和核心流程测试，并写入 `validations.json.functional_checks`；blocking/high 风险项未通过前不得执行 MCP Playwright 作为通过依据。
- 对涉及用户可见行为、Electron、API、IPC、数据库、模型调用或跨项目联调的任务，必须执行 `runtime-test-plan.md` 中的运行时或交互验证；只执行 build/typecheck/lint 不得视为完成。
- 前端或 Electron 交互任务必须执行 `interaction-test-plan.yaml`；默认使用 MCP Playwright 或 Playwright 验证应用启动、页面可达、关键控件操作、状态变化、控制台错误、网络失败和必要 IPC/文件流程。
- MCP Playwright 验证必须先使用 snapshot 确认元素结构，再执行 click/type/fill/wait 等交互，并保存交互后截图；只截图不操作视为验证失败。
- 如果缺少 MCP Playwright、Playwright、测试数据、启动方式或调试方法，先把状态置为 `needs_clarification` 并询问用户；只有用户确认后，才能改用人工验证或编写项目内测试脚本。
- 对照 `acceptance-criteria.md` 逐项记录机器验证、行为验证和人工验收边界。
- 把命令、结果、失败原因、未验证项和残余风险写入 `verification-report.md`。
- 同步更新 `validations.json`，并向 `events.ndjson` 追加验证开始、通过、失败或跳过事件。
- 功能点和核心流程验证必须同步写入 `validations.json.functional_checks`，并追加 functional 验证事件；临时脚本验证必须记录命令、输入范围、输出摘要和清理策略。
- 运行时或交互验证必须同步写入 `validations.json.runtime_checks` 或 `validations.json.interaction_checks`，并追加 runtime/interaction 验证事件。
- `validations.json.interaction_checks` 必须包含工具、入口、场景、步骤、预期结果、截图、console_errors、network_failures 和失败原因；缺少这些证据时不得写 `passed`。
- 视觉任务必须保存浏览器或 Electron 截图到 `snapshots/`，并写入 `visual-review.md` 与 `visual-defects.md`。
- 视觉任务不得只用“截图已生成”作为通过依据，必须按区域对比参考图和实际图，写明参考图表现、实际截图表现、差异、严重度和修复动作。
- 视觉任务必须至少保存 `actual-initial.png` 和 `actual-final.png`；发生修复时保存 `actual-after-fix-N.png`。
- Electron 视觉任务必须记录窗口尺寸、CSS 视口、deviceScaleFactor、zoomFactor 和系统缩放假设，并至少验证目标视口与一个缩放/窄屏退化视口。
- 若 `visual-defects.md` 存在 open 状态的 `blocking` 或 `major` 缺陷，必须回到 coder 迭代并复验，不得进入 `ready_for_human_review`。
- 修复后必须重新截图并更新 `visual-review.md`、`visual-defects.md` 和 `validations.json`；没有复验记录时视为验证失败。
- 记录当前分支、commit hash 或跳过 git 生命周期的原因。
- 更新 `.harness/current-task.json`、`.harness/tasks/index.json`、`state.json`、`agents.json`、`artifacts.json`、`summary.md`。
- 机器验证通过后只能进入 `ready_for_human_review`，除非用户明确授权自动接受。

## Doc Gardener

- 判断是否需要同步长期文档。
- 更新 `doc-sync-report.md`。
- 必要时同步 `ARCHITECTURE.md`、`docs/QUALITY_SCORE.md`、`docs/RELIABILITY.md`、`docs/SECURITY.md`。
- 如果发现长期失败模式，同步 `docs/generated/FEEDBACK_FLYWHEEL.md` 或 `docs/HARNESS_GARDENING.md`。
- 更新 `.harness/current-task.json`、`.harness/tasks/index.json`、`state.json`、`agents.json`、`artifacts.json`、`summary.md`，并向 `events.ndjson` 追加 doc_gardener 事件。

## 失败处理

- 任一阶段失败时，不要静默退出。
- 先把失败原因写入 `trace.md` 与 `handoff.md`。
- 同步把失败状态写入 `.harness/current-task.json`、`.harness/tasks/index.json`、`state.json`、`agents.json`、`summary.md`，并向 `events.ndjson` 追加 `blocked` 或 `validation_failed` 事件。
- 如果失败影响验证结论，在 `verification-report.md` 明确写出。
