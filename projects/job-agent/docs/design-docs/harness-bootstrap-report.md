# Harness Bootstrap Report

## 检测结果

- 项目名称：job-agent
- 项目类型：python-ai-service
- 置信度：high
- Bootstrap 模式：standard
- 主要证据：

- README.md documents Python local AI Agent, CLI command, Streamlit Web UI, tests, and evaluation suite.
- requirements.txt lists pypdf, Pillow, pytesseract, streamlit, and PyYAML.
- app/ contains agents, services, utils, prompts, config, models, evaluation, and CLI entrypoint.
- web_app.py is a Streamlit Web UI with upload/sample modes.
- tests/ contains unittest coverage for Agent workflow, parser, matcher, input reader, rewriter, evaluation, and Web UI helpers.
- data/eval_cases/manifest.json defines high/medium/low regression cases.
- No package.json, go.mod, Electron, Docker, CI, or sibling-project command references were found in target project docs/config.

## 生成或合并的文件

- `.agents/skills/job-agent-harness-request/SKILL.md`：create
- `.agents/skills/job-agent-harness-request/agents/openai.yaml`：create
- `.agents/skills/job-agent-harness-request/references/functional-verification.md`：create
- `.agents/skills/job-agent-harness-request/references/git-workflow.md`：create
- `.agents/skills/job-agent-harness-request/references/interaction-verification.md`：create
- `.agents/skills/job-agent-harness-request/references/problem-decomposition.md`：create
- `.agents/skills/job-agent-harness-request/references/research-protocol.md`：create
- `.agents/skills/job-agent-harness-request/references/runtime-verification.md`：create
- `.agents/skills/job-agent-harness-request/references/stage-checklist.md`：create
- `.agents/skills/job-agent-harness-request/references/task-file-contract.md`：create
- `.agents/skills/job-agent-harness-request/references/task-observability.md`：create
- `.agents/skills/job-agent-harness-request/references/task-routing.md`：create
- `.agents/skills/job-agent-harness-request/references/uncertainty-gates.md`：create
- `.agents/skills/job-agent-harness-request/references/visual-task-profile.md`：create
- `.harness/bootstrap-config.yaml`：create
- `.harness/current-task.json`：create
- `.harness/environment.yaml`：create
- `.harness/human-gates.yaml`：create
- `.harness/invariants.yaml`：create
- `.harness/manifest.json`：create
- `.harness/project-profile.yaml`：create
- `.harness/tasks/README.md`：create
- `.harness/tasks/index.json`：create
- `.harness/workspace-map.yaml`：create
- `AGENTS.md`：create
- `ARCHITECTURE.md`：create
- `docs/HARNESS_GARDENING.md`：create
- `docs/QUALITY_SCORE.md`：create
- `docs/RELIABILITY.md`：create
- `docs/REVIEW_AND_MERGE.md`：create
- `docs/SECURITY.md`：create
- `docs/design-docs/harness-bootstrap-report.md`：create
- `docs/design-docs/harness-operating-model.md`：create
- `docs/generated/COMMANDS.md`：create
- `docs/generated/FEEDBACK_FLYWHEEL.md`：create
- `docs/generated/HARNESS_SELF_CHECK.md`：create

## 产物说明

### 入口与地图

- `AGENTS.md`：Codex 进入项目后的短规则地图。
- `ARCHITECTURE.md`：项目结构、领域边界、禁止事项和生成物说明。

### 项目级 skill

- `.agents/skills/job-agent-harness-request/SKILL.md`：后续正式需求的主入口。
- `references/task-file-contract.md`：任务目录和字段契约。
- `references/stage-checklist.md`：planner、coder、verifier、doc_gardener 的阶段动作。
- `references/git-workflow.md`：分支、commit、push 规则。
- `references/task-routing.md`：根据用户自然语言判断新建任务、续跑任务或处理验收反馈。
- `references/problem-decomposition.md`：正式任务的前置问题拆解协议，要求先定义问题、方案、工作包和验收边界。
- `references/research-protocol.md`：需求、问题、根因或方案不明确时的调研协议，要求记录本地证据、外部资料和项目适配结论。
- `references/uncertainty-gates.md`：重要流程的不确定性闸门，要求关键未知项暂停确认，不能靠猜测继续。
- `references/functional-verification.md`：分层功能验证协议，要求先拆功能点和核心流程，优先运行项目原生测试或任务内临时小脚本，再进入运行时和 MCP Playwright 验证。
- `references/runtime-verification.md`：运行时和交互验证协议，要求行为变化不能只依赖 build/typecheck/lint；Streamlit 前端默认使用 MCP Playwright 或 Playwright 验证核心交互，缺少工具时先询问用户。
- `references/interaction-verification.md`：前端交互验证协议，要求生成结构化 `interaction-test-plan.yaml`，并用 MCP Playwright 或项目 Playwright 记录 snapshot、console、network 和截图证据。
- `references/task-observability.md`：前端和工具读取任务进度的机器可观测协议。
- `references/visual-task-profile.md`：截图、设计图和一比一 UI 复刻任务的视觉规格、区域级截图对比、缩放验证、自修复复验和缺陷回流规则。

### Harness 配置

- `.harness/project-profile.yaml`：长期配置源，记录项目类型、边界、传感器和 git 生命周期。
- `.harness/environment.yaml`：运行、调试、前端入口、视口、测试数据和 MCP Playwright 可用性的机器可读配置。
- `.harness/workspace-map.yaml`：workspace 边界、相关项目和 dev/build/test 命令图。
- `.harness/manifest.json`：面向工具和自动检查的结构化索引。
- `.harness/current-task.json`：当前活跃或最近任务指针。
- `.harness/invariants.yaml`：任何任务都不能破坏的长期规则。
- `.harness/human-gates.yaml`：需要人工确认的高风险操作和高影响未知项。
- `.harness/tasks/index.json`：任务摘要索引。
- `.harness/tasks/README.md`：任务目录说明。

### 文档

- `docs/design-docs/harness-operating-model.md`：本项目 harness 如何工作。
- `docs/generated/COMMANDS.md`：项目命令与 harness 传感器索引。
- `docs/QUALITY_SCORE.md`：工程化质量基线。
- `docs/RELIABILITY.md`：可靠性机制与缺口。
- `docs/SECURITY.md`：安全边界与高风险区域。

## 选中的传感器

- `unit_tests`：Run all project unit tests.，命令：`.venv/bin/python -m unittest discover -s tests`
- `evaluation_suite`：Run high/medium/low match regression checks.，命令：`.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`
- `web_compile`：Check Streamlit app syntax.，命令：`.venv/bin/python -m py_compile web_app.py`
- `real_sample_cli`：Run private real JD/PDF resume sample locally.，命令：`.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`
- `bootstrap_plan_validate`：Validate bootstrap plan and template mapping.，命令：`.venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .`

## 本次验证结果

- `bootstrap_plan_validate`：通过，plan valid，映射模板 36 个。
- `web_compile`：通过，`web_app.py` 可编译。
- `unit_tests`：通过，29 个 unittest 全部成功。
- `evaluation_suite`：通过，3 个评测 case 全部成功，summary 写入 `outputs/evaluations/summary.md`。
- `real_sample_cli`：通过，读取 `data/my_jd.txt` 与 `data/my_resume.pdf`，输出 `outputs/my_report.md` 与 `outputs/my_report.json`，mock 模式得分 95。
- `web_smoke`：通过，临时启动 Streamlit 于 `http://localhost:8505`，`curl -I` 返回 HTTP 200。

## 运行与调试入口

- `install`（setup，一次性）：`.venv/bin/python -m pip install -r requirements.txt`，目录：`.`，用途：Install project dependencies for PDF/OCR/Web UI/harness plan validation.
- `unit_tests`（test，一次性）：`.venv/bin/python -m unittest discover -s tests`，目录：`.`，用途：Run all unit tests for parsers, matching, Agent workflow, Web UI helpers, and evaluation helpers.
- `evaluation_suite`（evaluation，一次性）：`.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`，目录：`.`，用途：Run high/medium/low match regression cases and write evaluation summaries.
- `real_sample_cli`（runtime，一次性）：`.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`，目录：`.`，用途：Run the current private Chinese JD/PDF resume sample locally.
- `web_compile`（static，一次性）：`.venv/bin/python -m py_compile web_app.py`，目录：`.`，用途：Check Streamlit Web UI syntax/import validity.
- `web_dev`（dev，长驻）：`.venv/bin/streamlit run web_app.py`，目录：`.`，用途：Launch the local Streamlit Web UI.
- `web_smoke`（runtime，一次性）：`curl -I http://localhost:8501`，目录：`.`，用途：Check that Streamlit returns HTTP 200 after web_dev starts.

## Workspace 与命令图

### 相关项目

- 未发现 README、requirements、脚本或文档引用父级/兄弟项目；当前按单项目 workspace 管理。

### 核心命令图

- .venv/bin/python -m unittest discover -s tests：README.md Run the baseline tests
- .venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations：README.md Run the evaluation suite
- .venv/bin/python -m app.main --jd data/sample_jd.txt --resume data/sample_resume.txt --output outputs/report.md --json-output outputs/report.json：README.md Quick start
- .venv/bin/streamlit run web_app.py：README.md and WEB_DEMO.md local Web UI launch command

## 人工验收与 Merge

机器验证通过后进入 ready_for_human_review；不自动 push，不自动 merge。

## 假设

- Bootstrap mode selected as standard because the project has native tests, evaluation suite, Web UI, and a growing portfolio workflow, despite no git repository in target.
- Python 3.14.4 is the observed local runtime; future setup may choose another compatible Python 3 version if dependencies support it.
- Streamlit default local URL is treated as http://localhost:8501 based on docs and observed smoke tests.
- MCP Playwright/browser automation availability is not guaranteed and must be confirmed before formal interaction verification.

## 已跳过事项

- No git branch or commit operations were run because the target directory is not a git repository.
- No live LLM/API verification was run because mock mode is the safe default and no secret should be assumed.
- No Chinese screenshot OCR end-to-end check was run because Chinese Tesseract language data availability is unresolved.
- No full browser interaction test was run during bootstrap; only Streamlit launch and curl healthcheck were previously validated.

## 后续使用方式

后续正式需求直接在 Codex 对话中提出，并使用项目级 skill：

```text
Use $job-agent-harness-request to implement: <需求描述>
```

Codex 应创建或续跑 `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/`，按 planner、coder、verifier、doc_gardener 串行流程执行，并持续更新 `state.json` 与 `events.ndjson`。
