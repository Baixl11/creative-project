# Task Observability Protocol

本文件定义 `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/` 的机器可观测协议，用于前端、脚本或后续 Codex 会话稳定读取任务进度。

## 原则

- Markdown 文件继续服务人类阅读。
- JSON、YAML、NDJSON 文件服务工具读取。
- 前端只能展示公开过程状态，不读取或要求 Codex 暴露内部推理。
- 每个阶段更新产物时，必须同步更新 `state.json`，并向 `events.ndjson` 追加事件。
- 文件缺失时，前端应显示 `contract_gap`，而不是猜测任务已经完成。

## 必需机器文件

每个正式任务必须包含：

```text
.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/
├── state.json
├── events.ndjson
├── agents.json
├── artifacts.json
├── validations.json
└── summary.md
```

## `state.json`

`state.json` 是前端展示当前任务状态的主入口。

```json
{
  "schema_version": "1.0",
  "task_key": "2026-04-27/feature/video-panel-redesign",
  "title": "复刻视频取证工具页面",
  "status": "coding",
  "current_stage": "coder",
  "branch": "harness/feature/video-panel-redesign",
  "created_at": "2026-04-27T20:00:00+08:00",
  "updated_at": "2026-04-27T20:30:00+08:00",
  "progress": {
    "planner": "done",
    "coder": "running",
    "verifier": "pending",
    "doc_gardener": "pending"
  },
  "blockers": [],
  "next_action": "继续实现右侧 AI 识别面板",
  "human_review_required": true
}
```

允许的 `status`：

- `planned`
- `needs_clarification`
- `blocked_on_decision`
- `coding`
- `needs_verification`
- `needs_visual_verification`
- `verification_failed`
- `ready_for_human_review`
- `accepted`
- `blocked`
- `cancelled`

允许的 `current_stage`：

- `planner`
- `coder`
- `verifier`
- `doc_gardener`
- `human_review`
- `done`

允许的 `progress` 值：

- `pending`
- `running`
- `done`
- `blocked`
- `failed`
- `skipped`

## `events.ndjson`

`events.ndjson` 是追加式事件流，一行一个 JSON 对象。

```json
{"time":"2026-04-27T20:01:00+08:00","stage":"planner","actor":"codex","type":"started","message":"开始问题拆解","artifacts":[]}
{"time":"2026-04-27T20:05:00+08:00","stage":"planner","actor":"codex","type":"artifact_written","message":"完成问题拆解","artifacts":["problem-decomposition.md","acceptance-criteria.md"]}
```

建议事件类型：

- `started`
- `resumed`
- `artifact_written`
- `decision_recorded`
- `research_started`
- `research_completed`
- `validation_started`
- `validation_passed`
- `validation_failed`
- `functional_validation_started`
- `functional_validation_passed`
- `functional_validation_failed`
- `runtime_validation_started`
- `runtime_validation_passed`
- `runtime_validation_failed`
- `interaction_validation_started`
- `interaction_validation_passed`
- `interaction_validation_failed`
- `interaction_snapshot_captured`
- `interaction_screenshot_captured`
- `visual_screenshot_captured`
- `visual_diff_completed`
- `visual_defect_found`
- `visual_repair_started`
- `visual_repair_completed`
- `visual_recheck_completed`
- `clarification_requested`
- `clarification_resolved`
- `blocked`
- `unblocked`
- `stage_completed`
- `status_changed`
- `commit_created`
- `handoff_written`

规则：

- 事件必须追加，不要重写旧事件。
- 每条事件必须有 `time`、`stage`、`actor`、`type`、`message`。
- `message` 写公开过程事实，不写内部推理。
- 命令输出摘要写入 `validations.json` 或 `verification-report.md`，不要把大段日志塞进事件流。

## `agents.json`

`agents.json` 记录角色级公开状态。即使实际由同一个 Codex 会话串行执行，也按角色写状态。

```json
{
  "schema_version": "1.0",
  "mode": "serial",
  "agents": {
    "planner": {
      "status": "done",
      "last_update": "2026-04-27T20:05:00+08:00",
      "summary": "完成问题拆解、验收拆分和执行计划"
    },
    "coder": {
      "status": "running",
      "last_update": "2026-04-27T20:30:00+08:00",
      "summary": "正在实现 UI 布局"
    },
    "verifier": {
      "status": "pending",
      "last_update": null,
      "summary": ""
    },
    "doc_gardener": {
      "status": "pending",
      "last_update": null,
      "summary": ""
    }
  }
}
```

## `artifacts.json`

`artifacts.json` 是任务产物索引，方便前端展示哪些文件已经生成。

```json
{
  "schema_version": "1.0",
  "required": [
    {"path": "problem-decomposition.md", "kind": "planning", "status": "present"},
    {"path": "acceptance-criteria.md", "kind": "planning", "status": "present"},
    {"path": "exec-plan.md", "kind": "planning", "status": "present"},
    {"path": "verification-report.md", "kind": "verification", "status": "pending"}
  ],
  "optional": [
    {"path": "research-notes.md", "kind": "planning", "status": "not_applicable"},
    {"path": "functional-test-plan.md", "kind": "verification", "status": "not_applicable"},
    {"path": "interaction-test-plan.yaml", "kind": "verification", "status": "not_applicable"},
    {"path": "visual-defects.md", "kind": "visual", "status": "not_applicable"}
  ]
}
```

允许的 artifact `status`：

- `present`
- `pending`
- `missing`
- `not_applicable`

## `validations.json`

`validations.json` 记录机器验证和人工验收边界。

```json
{
  "schema_version": "1.0",
  "commands": [
    {
      "name": "typecheck",
      "command": "pnpm exec tsc --noEmit",
      "status": "passed",
      "started_at": "2026-04-27T20:40:00+08:00",
      "finished_at": "2026-04-27T20:40:12+08:00",
      "summary": "类型检查通过"
    }
  ],
  "functional_checks": [
    {
      "name": "任务名称校验",
      "kind": "unit_test",
      "command": "pnpm test -- task-name",
      "status": "passed",
      "risk": "high",
      "covers": ["空名称", "超长名称", "重复提交"],
      "summary": "功能点验证通过，错误路径返回明确提示",
      "failure_reason": null
    }
  ],
  "manual_checks": [
    {
      "name": "视觉一致性",
      "status": "needs_human_review",
      "summary": "需要用户确认最终视觉还原程度"
    }
  ],
  "runtime_checks": [
    {
      "name": "Electron 应用启动",
      "tool": "mcp_playwright",
      "status": "passed",
      "summary": "应用启动成功，目标页面可达，无阻塞级控制台错误"
    }
  ],
  "interaction_checks": [
    {
      "name": "核心识别流程",
      "tool": "mcp_playwright",
      "status": "passed",
      "entry": "http://localhost:5173",
      "steps": ["打开目标页面", "选择视频", "点击开始识别", "确认结果列表更新"],
      "expected": ["结果列表更新", "无阻塞级 console error", "无阻塞级 network failure"],
      "screenshot": "snapshots/interaction-core.png",
      "snapshot": "snapshots/interaction-core.snapshot.md",
      "console_errors": 0,
      "network_failures": 0,
      "failure_reason": null,
      "summary": "关键交互路径完成，状态变化符合预期"
    }
  ],
  "visual_checks": [
    {
      "name": "目标视口视觉对比",
      "reference": "input/reference.png",
      "actual": "snapshots/actual-final.png",
      "viewport": "2048x1152",
      "device_scale_factor": 1,
      "zoom_factor": 1,
      "status": "passed",
      "open_blocking": 0,
      "open_major": 0,
      "summary": "区域级对比完成，无 open blocking/major 缺陷"
    }
  ]
}
```

允许的验证 `status`：

- `pending`
- `running`
- `passed`
- `failed`
- `skipped`
- `needs_human_review`

运行时/交互任务的 `runtime_checks` 和 `interaction_checks` 必须记录工具、入口、关键步骤、预期结果、可观察结果、截图、snapshot、console/network 检查和失败原因。只执行 build/typecheck/lint 或只截图不交互时，不得把运行时或交互检查写成 `passed`。

功能行为任务的 `functional_checks` 必须记录功能点、风险等级、测试类型、命令或脚本、覆盖输入、状态、失败原因和摘要。blocking/high 风险功能点未通过时，不得进入 runtime、interaction 或 visual 验证通过态。

视觉任务的 `visual_checks` 必须记录参考图、实际截图、视口、缩放参数、open blocking/major 数量和复验结论。只截图未对比时，`status` 必须为 `failed` 或 `needs_human_review`，不得写 `passed`。

## `summary.md`

`summary.md` 是给前端详情页和后续会话快速读取的短摘要，应保持简短：

```md
# 复刻视频取证工具页面

- 当前阶段：coder
- 当前状态：coding
- 最近进展：完成主布局，正在处理右侧 AI 识别面板。
- 阻塞项：无
- 下一步：运行前端构建并截图对照。
```

## 写入时机

- planner 创建任务时：初始化全部机器文件。
- planner 触发调研时：写入或更新 `research-notes.md`，更新 `artifacts.json`，追加 `research_started` 和 `research_completed` 事件。
- planner 完成问题拆解时：更新 `state.json`、`agents.json`、`artifacts.json`，追加 `events.ndjson`。
- 任一阶段触发不确定性闸门时：更新 `state.json.status`、`state.json.blockers`、`summary.md`、`handoff.md`，追加 `clarification_requested` 事件。
- 用户确认关键未知项后：更新 `decision-log.md`、`problem-decomposition.md` 或 `harness-bootstrap-report.md`，追加 `clarification_resolved` 事件。
- coder 每完成一个工作包时：更新 `state.json`、`agents.json`、`artifacts.json`，追加事件。
- verifier 每次运行命令时：更新 `validations.json.commands`，追加验证事件。
- verifier 完成功能点或核心流程验证时：更新 `validations.json.functional_checks`，追加 functional 验证事件。
- verifier 完成运行时或交互验证时：更新 `validations.json.runtime_checks` 或 `validations.json.interaction_checks`，追加 runtime/interaction 验证事件。
- verifier 使用 MCP Playwright 捕获页面结构或截图时：追加 `interaction_snapshot_captured` 或 `interaction_screenshot_captured` 事件，并把证据路径写入 `validations.json.interaction_checks`。
- verifier 完成视觉截图、差异分析、自修复复验时：更新 `validations.json.visual_checks`，追加 `visual_screenshot_captured`、`visual_diff_completed`、`visual_recheck_completed` 事件。
- doc_gardener 完成文档同步时：更新 `agents.json`、`artifacts.json`，追加事件。
- 最终回复前：确保 `state.json.updated_at`、`summary.md` 和 `handoff.md` 反映最新状态。

## 前端读取规则

- 优先读取 `.harness/manifest.json` 定位任务根目录、当前任务和索引文件。
- 当前任务卡片优先读取 `.harness/current-task.json`。
- 任务列表优先读取 `.harness/tasks/index.json`，再用每个任务目录的 `state.json` 校正状态。
- 时间线读取 `events.ndjson`，遇到坏行时标记为 `parse_error` 并继续读取后续行。
- 产物矩阵读取 `artifacts.json`，并用实际文件存在性做二次校验。
- 验证面板读取 `validations.json`，详细日志仍链接到 `verification-report.md`。
- 如果机器文件缺失，前端应显示缺口并链接 `task-observability.md`，不要从 Markdown 猜测完整状态。
