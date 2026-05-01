# Runtime Verification

Bootstrap 生成项目级 harness 时，必须把运行时和交互验证作为独立规则层，而不是只依赖 build、typecheck 或 lint。

## 生成要求

- 生成 `.agents/skills/<project>-harness-request/references/runtime-verification.md`。
- 生成 `.agents/skills/<project>-harness-request/references/functional-verification.md`，作为运行时和交互验证之前的功能点/核心流程验证层。
- 生成 `.agents/skills/<project>-harness-request/references/interaction-verification.md`，作为前端和 Electron 交互验证专项层。
- 生成 `.harness/environment.yaml`，集中记录运行、调试、前端入口、视口、测试数据和 MCP Playwright 可用性。
- 在项目级 request skill 的 Read First、Core Rule、planner、verifier 中引用运行时验证协议。
- 在 `.harness/project-profile.yaml` 和 `.harness/manifest.json` 中记录 `functional_verification`、`runtime_verification`、`interaction_verification` 或等价结构。
- 在 `task-file-contract.md` 中增加 `runtime-test-plan.md` 和 `interaction-test-plan.yaml` 的触发条件和状态门禁。
- 在 `task-observability.md` 中增加 `functional_checks`、`runtime_checks`、`interaction_checks` 和 functional/runtime/interaction 验证事件。

## 核心规则

- build、typecheck、lint 只能证明静态或打包层面，不证明行为正确。
- 行为验证必须分层执行：先按功能点和核心流程运行项目原生测试或任务内临时小脚本，再进入运行时、交互和视觉验证。
- 改变 UI、Electron、API、IPC、数据库、模型调用、文件系统、外部命令或跨项目联调的任务必须有运行时或交互验证计划。
- Electron 交互任务默认使用 MCP Playwright 或 Playwright 验证应用启动、页面可达、关键控件、状态变化、控制台错误和必要 IPC/文件流程。
- 前端或 Electron 交互任务必须用 `interaction-test-plan.yaml` 定义可执行场景、目标元素、预期状态和 snapshot/console/network/screenshot 证据。
- 缺少 MCP Playwright、Playwright、启动命令、测试数据或调试方法时，生成后的规则必须要求 Codex 暂停并询问用户。
- 用户确认替代验证方式后，必须记录到 `decision-log.md`、`verification-report.md` 和 `validations.json`。

## 自检重点

- 临时渲染后必须存在 `runtime-verification.md`。
- 临时渲染后必须存在 `functional-verification.md`，并要求生成 `functional-test-plan.md` 和 `validations.json.functional_checks`。
- 临时渲染后必须存在 `interaction-verification.md` 和 `.harness/environment.yaml`。
- `stage-checklist.md` 必须明确 verifier 不能只跑 build。
- `validations.json` 示例必须区分 `commands`、`functional_checks`、`runtime_checks`、`interaction_checks`、`visual_checks` 和 `manual_checks`。
- `ready_for_human_review` 之前必须完成必需运行时/交互验证，或记录用户确认的替代方案。
