# Harness Self Check

Bootstrap 后应尽量提供一个最小自检传感器，防止 harness 文件漂移。

## 检查项

- 必需文件存在。
- `AGENTS.md` 不超过约 100 行。
- `.harness/project-profile.yaml` 中的 native sensors 有名称、命令和用途。
- `.harness/environment.yaml` 存在，且记录运行、调试、前端入口或无法确认项。
- `.harness/workspace-map.yaml` 存在，且记录 target project、related projects 和 command graph。
- `.harness/current-task.json` 和 `.harness/tasks/index.json` 可解析。
- `.agents/skills/<project>-harness-request/SKILL.md` frontmatter 有 `name` 和 `description`，且 `description` 不超过 1024 字符。
- `task-file-contract.md`、`stage-checklist.md`、`git-workflow.md`、`task-routing.md`、`problem-decomposition.md`、`research-protocol.md`、`uncertainty-gates.md`、`functional-verification.md`、`runtime-verification.md`、`interaction-verification.md`、`task-observability.md` 存在。
- `research-protocol.md` 明确要求需求、问题或方案不明确时先调研并记录项目适配结论。
- `uncertainty-gates.md` 明确要求重要流程无法完全确认时暂停询问用户。
- `functional-verification.md` 明确要求功能变化先生成 `functional-test-plan.md`，并在运行时或 MCP Playwright 验证前写入 `validations.json.functional_checks`。
- `runtime-verification.md` 明确要求行为变化不能只用 build/typecheck/lint 证明，Electron 交互默认使用 MCP Playwright 或 Playwright，缺少工具时先询问用户。
- `interaction-verification.md` 明确要求前端交互任务生成 `interaction-test-plan.yaml`，并记录 snapshot、console、network 和截图证据。
- `task-file-contract.md` 明确要求任务目录包含 `state.json`、`events.ndjson`、`agents.json`、`artifacts.json`、`validations.json`、`summary.md`。
- `visual-task-profile.md` 明确要求参考图对比、自修复复验、最终截图和缩放/窄屏验证。
- `docs/design-docs/harness-bootstrap-report.md` 存在。

## Profile 化实现

- Node 项目：可用小型 JS 脚本。
- Go 项目：可用 `go test` 中的文件存在性测试。
- Python 项目：可用 `pytest` 测试。
- 无合适运行时：只写入人工检查清单，不新增脚本。

## 错误信息

错误信息必须包含修复路径：

```text
FAIL: AGENTS.md has 143 lines.
Fix: keep AGENTS.md as a short map and move details to .agents/skills/<project>-harness-request/references/.
```

## 注意

自检不是业务正确性验证。它只证明 harness 结构还可读、可用、可维护。
