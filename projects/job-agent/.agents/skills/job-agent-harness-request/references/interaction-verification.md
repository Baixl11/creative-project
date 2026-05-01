# Interaction Verification Protocol

本文件定义前端、Electron 和用户可见交互任务的 MCP Playwright 验证协议。它是 `runtime-verification.md` 的前端专项层，目标是让 verifier 真正执行点击、输入、状态观察和错误检查，而不是只截图。

## 触发条件

满足任一条件时，任务目录必须创建 `interaction-test-plan.yaml`：

- 需求改变页面、组件、按钮、表单、菜单、弹窗、导航、拖拽、快捷键、列表状态或错误提示。
- 需求改变 Electron 窗口、preload、IPC、文件选择、菜单、系统能力或渲染进程行为。
- 用户提供设计图、截图、Figma 或要求一比一复刻、页面实现、交互正确、自动化验证。
- `acceptance-criteria.md` 中存在任何用户可见行为验证项。

## 环境来源

Planner 必须先读取 `.harness/environment.yaml`，确认以下信息：

- 前端或 Electron 启动命令。
- Web URL、Electron 窗口或调试入口。
- 目标视口、deviceScaleFactor、zoomFactor 和缩放/窄屏回归视口。
- 测试数据、账号、外部服务、文件路径和副作用边界。
- MCP Playwright 或项目 Playwright 是否可用。

如果上述信息无法确认，状态必须进入 `needs_clarification`，不能继续到编码或验证。

## `interaction-test-plan.yaml`

任务目录中的 `interaction-test-plan.yaml` 至少包含：

```yaml
schema_version: "1.0"
source:
  environment: ".harness/environment.yaml"
  acceptance: "acceptance-criteria.md"
  runtime_plan: "runtime-test-plan.md"
tool:
  preferred: "mcp_playwright"
  fallback: "ask_user_before_manual_or_project_script"
  availability: "confirmed"
entry:
  kind: "web"
  command: "pnpm dev"
  url: "http://localhost:5173"
  working_dir: "."
viewport:
  width: 2048
  height: 1152
  device_scale_factor: 1
  zoom_factor: 1
scenarios:
  - name: "核心交互路径"
    steps:
      - action: "navigate"
        target: "http://localhost:5173"
        expected: "页面加载完成"
      - action: "snapshot"
        target: "body"
        expected: "目标控件可被 MCP 识别"
      - action: "click"
        target: "开始按钮"
        expected: "状态进入处理中"
    expected:
      - "没有 console error"
      - "没有阻塞级 network failure"
      - "目标状态变化可观察"
    evidence:
      snapshot: "snapshots/interaction-core.snapshot.md"
      screenshot: "snapshots/interaction-core.png"
      console: "logs/interaction-core-console.json"
      network: "logs/interaction-core-network.json"
```

## MCP Playwright 执行要求

执行 MCP Playwright 前必须先确认 `functional-test-plan.md` 中必需功能点和核心流程测试已经通过，或在 `decision-log.md` 中记录用户确认的替代策略。MCP Playwright 是高层验证，不替代低层功能测试。

Verifier 必须按场景执行真实工具动作：

- `browser_navigate` 或等价动作打开入口。
- `browser_snapshot` 读取可访问结构，先确认元素真实存在。
- `browser_click`、`browser_type`、`browser_fill_form`、`browser_press_key` 或等价动作执行交互。
- `browser_wait_for` 等待关键状态变化。
- `browser_console_messages` 检查控制台错误。
- `browser_network_requests` 检查阻塞级网络失败。
- `browser_take_screenshot` 保存交互后截图。

只调用截图工具、只打开页面、只保存图片，不能算交互验证通过。

## 证据写入

每个场景执行后必须更新：

- `validations.json.interaction_checks`：记录场景、工具、入口、步骤、状态、截图、控制台和网络结果。
- `verification-report.md`：说明哪些验收项被交互证据覆盖，哪些仍需人工确认。
- `events.ndjson`：追加 `interaction_validation_started`、`interaction_validation_passed` 或 `interaction_validation_failed`。
- `artifacts.json`：记录 `interaction-test-plan.yaml`、截图、日志和报告是否存在。

## 硬门禁

- 缺少 `interaction-test-plan.yaml` 时，前端/Electron 交互任务不得进入 `needs_verification` 之后的状态。
- 需要功能点验证但缺少 passed 的 `validations.json.functional_checks` 证据时，不得把 MCP Playwright 场景写成最终通过。
- MCP Playwright 或项目 Playwright 不可用且用户未确认替代方案时，状态必须是 `needs_clarification`。
- 任一场景存在阻塞级 console error、关键元素找不到、关键点击失败、预期状态未变化或截图缺失时，状态必须是 `verification_failed`，并回到 coder。
- `validations.json.interaction_checks` 没有 passed 记录时，不得进入 `ready_for_human_review`，除非用户明确确认替代验证方式并记录残余风险。
