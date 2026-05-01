# Runtime Verification Protocol

本文件定义 build、typecheck、lint 之后的运行时和交互验证规则。目标是防止任务只以静态检查通过作为行为正确性的证明。

## 核心原则

- build、typecheck、lint 只能证明静态结构、类型约束或打包流程，不证明用户可见行为、交互流程、IPC、网络请求、状态流转、数据库写入或模型调用正确。
- 运行时验证必须在功能点和核心流程验证之后执行；`functional-test-plan.md` 中 blocking/high 风险项未通过时，不得用运行时验证掩盖低层失败。
- 涉及用户可见行为、页面、Electron、浏览器交互、API、IPC、数据库、文件系统、模型调用、跨项目联调或错误处理的任务，必须定义运行时或交互验证。
- 如果测试、调试、启动、账号、数据、外部服务、MCP 工具或验收路径无法完全确认，必须触发 `uncertainty-gates.md`，暂停并询问用户；不得自行假设“build 通过即可”。
- 缺少运行时验证工具时，可以选择用户确认的替代方案，例如人工验证路径、项目内 smoke test、单元/集成测试、临时自动化脚本或延后验证，但必须记录原因、确认结果和残余风险。
- 没有完成必需运行时/交互验证，且没有用户确认的替代方案时，任务不得进入 `ready_for_human_review`。

## 触发条件

满足任一条件时，必须创建或更新 `runtime-test-plan.md`：

- 需求改变 UI、路由、交互状态、表单、按钮、菜单、快捷键、拖拽、弹窗、导航或错误提示。
- 需求改变 Electron 主进程、渲染进程、preload、IPC、窗口尺寸、缩放、系统权限、文件选择、托盘、菜单或原生能力。
- 需求改变 API、数据库、缓存、队列、任务调度、文件读写、外部命令、模型调用或网络请求。
- 需求涉及多项目联调，dev/build/test 命令会触达父级或兄弟项目。
- 用户明确要求“一比一”“能用”“流程正确”“自动化验证”“回归验证”。
- 构建通过无法直接证明验收标准中的行为项。

## Electron 默认策略

- Electron UI 或交互任务默认使用 MCP Playwright 或项目内 Playwright 进行自动化验证。
- 至少验证应用可启动、目标页面可达、关键按钮/输入/菜单可操作、核心状态变化可观察、必要 IPC 或文件流程可完成、控制台和页面错误可检查。
- Electron 视觉任务还必须结合 `visual-task-profile.md`，记录窗口尺寸、CSS 视口、deviceScaleFactor、zoomFactor、系统缩放假设和至少一个缩放或窄屏退化视口。
- 如果缺少 MCP Playwright 或 Playwright 环境，先暂停询问用户：启用/安装工具、使用现有项目脚本、编写临时自动化脚本，或改为人工验证。
- 只执行 build、只打开页面、只截图、只保存截图，都不能作为 Electron 行为验证通过的证据。

## Web 前端默认策略

- 优先使用项目已有 E2E、组件测试或 Playwright/Cypress/Vitest Browser 等工具。
- 没有现成工具时，至少通过 MCP Playwright 或浏览器自动化完成关键路径 smoke test。
- 如果自动化工具不可用，必须询问用户是否接受临时测试脚本或人工验证，并把选择写入 `decision-log.md`。

## 后端和服务默认策略

- API 或服务任务不能只运行 build。至少补充单元测试、集成测试、HTTP smoke test、契约测试或可复现的本地调用。
- 如果服务依赖数据库、队列、对象存储、外部 API、模型服务或凭证，先确认测试环境和副作用边界。
- 如果无法安全运行集成验证，必须记录未验证项、替代验证和需要用户执行的命令。

## `runtime-test-plan.md`

触发运行时/交互验证时，任务目录必须包含：

```md
# Runtime Test Plan

## 触发原因

- 本任务改变了哪些运行时行为。
- build/typecheck 为什么不足以证明正确。

## 验证工具

- 首选工具：MCP Playwright / Playwright / 项目原生 E2E / 项目原生测试 / 其他。
- 可用性证据：已发现的配置、命令、MCP 能力或用户确认。
- 缺失工具时的确认结果：用户选择的替代方案。

## 验证环境

- 启动命令。
- 目标 URL、Electron 窗口或服务入口。
- 账号、测试数据、外部服务、凭证和副作用边界。

## 交互路径

| 路径 | 操作 | 预期可观察结果 | 记录位置 |
| --- | --- | --- | --- |
| smoke | 打开目标页面 | 页面加载且无控制台错误 | validations.json |

## 回归点

- 需要重点回归的旧行为。

## 阻塞与替代

- 无法执行的验证项。
- 用户确认的替代验证方式。
- 残余风险。
```

## 记录要求

- `validations.json.commands` 继续记录 build、lint、typecheck、unit test 等命令。
- `validations.json.functional_checks` 记录进入运行时验证前已经通过的功能点、核心流程、临时脚本或项目原生测试。
- `validations.json.runtime_checks` 记录应用启动、服务启动、API smoke、IPC 或外部流程验证。
- `validations.json.interaction_checks` 记录 Playwright/MCP/浏览器/Electron 交互路径。
- `events.ndjson` 必须追加 `runtime_validation_started`、`runtime_validation_passed`、`runtime_validation_failed`、`interaction_validation_started`、`interaction_validation_passed` 或 `interaction_validation_failed`。
- `verification-report.md` 必须说明哪些验收项已经由运行时证据覆盖，哪些仍需要人工验收。

## 前端交互专项门禁

前端、Electron 或用户可见交互任务还必须遵循 `interaction-verification.md`：

- Planner 先读取 `.harness/environment.yaml`，确认启动命令、入口 URL、Electron 调试方式、视口、测试数据和 MCP Playwright 可用性。
- Planner 生成 `interaction-test-plan.yaml`，把交互场景拆成可执行步骤、预期可观察结果和证据路径。
- Verifier 必须使用 MCP Playwright 或项目 Playwright 执行真实交互，至少包含 navigate、snapshot、click/type/fill、wait、console/network 检查和 screenshot。
- `validations.json.interaction_checks` 必须记录入口、工具、步骤、截图、控制台错误数量、网络失败数量和结论。
- 缺少 `interaction-test-plan.yaml`、缺少 MCP/Playwright 证据或存在阻塞级失败时，不得进入 `ready_for_human_review`。

## 状态门禁

- 缺少 `runtime-test-plan.md` 时，触发条件内的任务不得进入 `needs_verification` 之后的状态。
- 需要 `functional-test-plan.md` 但缺失，或 `validations.json.functional_checks` 中 blocking/high 风险项未通过时，不得开始运行时验证并把结果写成通过。
- 前端或 Electron 交互任务缺少 `interaction-test-plan.yaml` 时，不得进入 `needs_verification` 之后的状态。
- 运行时验证失败时，状态应为 `verification_failed`，并回到 coder 修复。
- 交互验证失败、关键元素不可达、状态未变化、控制台存在阻塞级错误或截图证据缺失时，状态应为 `verification_failed`，并回到 coder 修复。
- 工具缺失且未获得用户确认时，状态应为 `needs_clarification`。
- 用户确认只做静态验证时，必须在 `decision-log.md`、`verification-report.md` 和 `validations.json` 记录“行为未完全自动验证”的残余风险。
- 运行时/交互验证完成后仍默认进入 `ready_for_human_review`，不自动等同于用户验收通过。
