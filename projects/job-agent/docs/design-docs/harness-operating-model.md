# Harness Operating Model

## 目标

本项目的 harness 不是命令行产品，而是让 Codex 在当前对话中稳定接收需求、落地任务上下文、实施改动、执行验证、提交代码并回写经验。

## 主流程

```text
用户给需求
-> Codex 触发项目 skill
-> 根据 task-routing 读取 current-task 和 tasks/index
-> 读取 environment，确认运行、调试、前端入口和 MCP Playwright 能力
-> 读取 workspace-map，确认是否涉及父级/兄弟项目和跨项目命令图
-> 判定新建任务、续跑上一个任务、续跑指定任务或处理验收反馈
-> 创建或续跑 .harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>
-> 初始化 state.json / events.ndjson / agents.json / artifacts.json / validations.json
-> 同步 .harness/current-task.json 与 .harness/tasks/index.json
-> planner 先写 problem-decomposition 和 acceptance-criteria
-> 重要未知项进入 uncertainty gate，暂停并向用户确认
-> planner 基于问题拆解写 task-package 和 exec-plan
-> coder 开始写代码前，在主仓库和可编辑附属子仓库创建或切换 harness/<type>/<short-slug> 分支
-> coder 按计划做最小改动
-> 在模块或风险边界验证通过后本地提交
-> verifier 执行真实命令并记录证据
-> 功能变化任务先执行 functional-test-plan 中的功能点和核心流程测试
-> 行为变化任务执行 runtime-test-plan 中的运行时/交互验证
-> 前端交互任务执行 interaction-test-plan.yaml 中的 MCP Playwright 或 Playwright 场景
-> 视觉任务执行参考图对比、缺陷记录、自修复复验和缩放/窄屏验证
-> ready_for_human_review 等待行为验收
-> doc_gardener 同步长期文档与反馈飞轮
```

## 可观测性

- `current-task.json` 是“继续上一个任务”的入口。
- `environment.yaml` 是运行、调试、前端入口、视口和 MCP Playwright 能力入口。
- `workspace-map.yaml` 是跨项目边界和 dev/build/test 命令图入口。
- `tasks/index.json` 是任务列表和标题/slug 检索入口。
- `state.json` 是前端展示当前状态的主入口。
- `events.ndjson` 是追加式事件流，用于展示阶段推进、阻塞、验证和提交。
- `agents.json` 展示 planner、coder、verifier、doc_gardener 的公开状态。
- `artifacts.json` 展示任务产物是否存在、待补充或不适用。
- `validations.json` 展示机器验证、运行时检查、交互检查、视觉检查、跳过项和人工验收边界。
- 这些文件只记录公开事实，不记录 Codex 内部推理。

## 验收边界

- `verified` 只表示机器验证通过。
- build/typecheck/lint 不等于行为正确；涉及运行时行为时必须有运行时或交互验证证据，或记录用户确认的替代方式。
- MCP Playwright 不替代功能点验证；功能变化任务必须先用 `functional-test-plan.md` 和 `validations.json.functional_checks` 证明核心逻辑、关键流程和边界输入通过。
- Streamlit 前端交互验证必须有 `interaction-test-plan.yaml`、真实交互执行记录和 `validations.json.interaction_checks` 证据。
- `ready_for_human_review` 表示等待用户或负责人确认行为正确。
- `accepted` 才表示需求验收通过。
- 除非用户明确授权，否则 Codex 不自行把行为需求标记为 accepted。

## 传感器

- `unit_tests`：Run all project unit tests.，命令：`.venv/bin/python -m unittest discover -s tests`
- `evaluation_suite`：Run high/medium/low match regression checks.，命令：`.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`
- `web_compile`：Check Streamlit app syntax.，命令：`.venv/bin/python -m py_compile web_app.py`
- `real_sample_cli`：Run private real JD/PDF resume sample locally.，命令：`.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`
- `bootstrap_plan_validate`：Validate bootstrap plan and template mapping.，命令：`.venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .`

## 当前验证边界

- 项目已位于父级 Git monorepo，任务分支、分阶段本地提交和任务状态同步均已实际执行。
- mock 模式仍是安全默认值；没有 API key 时不运行真实 LLM/API 验证。
- `chi_sim+eng` 已可用，真实用户截图的清晰度和 OCR 领域词仍需按样本检查。
- Browser 插件不可用时，只有真实 Playwright/浏览器交互及完整证据可以作为替代；HTTP healthcheck 仍只代表服务可达。
