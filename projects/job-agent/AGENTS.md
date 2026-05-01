# job-agent Working Agreement

## 入口

正式需求以当前 Codex 对话 + 项目级 skill 为主入口。

- 项目级 skill：`.agents/skills/job-agent-harness-request/`
- 用户直接在对话里给需求，当前会话负责落任务文件、实现、验证、提交和回写。

## 必读地图

正式任务前先读：

1. `ARCHITECTURE.md`
2. `.harness/project-profile.yaml`
3. `.harness/environment.yaml`
4. `.harness/workspace-map.yaml`
5. `.harness/invariants.yaml`
6. `.harness/human-gates.yaml`
7. `.harness/current-task.json`
8. `.harness/tasks/index.json`
9. `.harness/tasks/README.md`
10. `docs/design-docs/harness-operating-model.md`

具体任务还要读：

1. `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/task-package.yaml`
2. `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/exec-plan.md`
3. `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/decision-log.md`
4. `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/handoff.md`
5. `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/state.json`

## Git 生命周期

- 如果当前目录是 git 仓库，正式代码任务开始前必须检查工作区状态。
- 新任务默认使用 `harness/<type>/<short-slug>` 独立分支，并使用 `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/` 作为任务目录。
- coder 准备开始改代码前必须先创建或切换到任务分支；不能等代码写完后再创建 Agent 工作分支。
- 如果任务会编辑无 `.harness` 的附属子仓库，必须在这些子仓库中同步创建或切换同名任务分支。
- 不得夹带任务外未归属改动。
- 按模块边界、风险边界或约 300-500 行变更量拆分本地 commit。
- 不自动 push，远端推送必须由用户明确要求。

## 任务路由

- 用户说“继续上一个任务”“刚才那个”“基于某任务继续”时，先读 `.harness/current-task.json` 和 `.harness/tasks/index.json`。
- 能唯一匹配已有任务时直接续跑，不要求用户提供任务路径。
- 路由候选不唯一时，只问一个确认问题。
- 新建、续跑、状态变化和完成时必须同步 `.harness/current-task.json` 与 `.harness/tasks/index.json`。

## 不确定性闸门

- 初始化分析、需求分析、问题拆解、环境配置、验证命令、数据/安全/git、视觉验收等重要流程，如果无法从证据中完全确认，必须暂停并询问用户。
- 关键未知项不得写成 `assumptions` 后继续执行；任务应进入 `needs_clarification` 或 `blocked_on_decision`。
- 用户确认后，把答案写入任务目录的 `decision-log.md`、`problem-decomposition.md` 或 bootstrap report，再继续下一阶段。

## 问题调研

- 需求、问题、根因、方案、环境、依赖行为或验收标准不明确时，先按 `research-protocol.md` 调研。
- 调研必须包含当前项目证据；可使用外部工具搜索官方文档、规范、issue、release note 或高质量实践。
- 选择方案前必须写 `research-notes.md`，说明为什么该方案适合当前项目，不能直接套用外部方案。

## 多项目联动

- 涉及 dev、build、test、lint、package、release 或联调时，先读 `.harness/workspace-map.yaml`。
- 涉及 Streamlit 前端运行、交互验证、截图或 MCP Playwright 时，先读 `.harness/environment.yaml`。
- 如果命令图显示父级或兄弟项目参与构建，必须一并分析对应项目的 README、配置和关键脚本。
- 相关项目目录存在 `.harness` 时，视为独立 harness 项目，默认只读；需要写入时必须先说明影响范围并征得用户确认。
- 相关项目目录没有 `.harness` 时，视为当前主 harness 的附属子仓库，默认可在同一任务内协同编辑，并使用同名任务分支和同一验证闭环。
- 无法确认相关项目是否存在 `.harness` 时，状态进入 `needs_clarification`，不得猜测写入权限。

## 前端交互验证

- 测试验证阶段先拆功能点和核心流程，优先运行项目原生单元测试、组件测试、服务测试、API/IPC smoke 或任务内临时小脚本，全部必要项通过后再进入运行时和 MCP Playwright 高层验证。
- Streamlit 前端或用户可见交互变更必须生成 `interaction-test-plan.yaml`。
- Verifier 必须优先使用 MCP Playwright 或项目 Playwright 执行真实点击、输入、等待、snapshot、console/network 检查和截图。
- 缺少启动方式、入口 URL、测试数据或 MCP Playwright 可用性时，状态进入 `needs_clarification`，不得用 build/compile 通过替代行为验证。

## 必跑传感器

- .venv/bin/python -m unittest discover -s tests
- .venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations
- .venv/bin/python -m py_compile web_app.py
- .venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json
- .venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .

无法执行时，必须写入 `verification-report.md` 并在最终回复说明。

## 可观测状态

- 每个正式任务必须维护 `state.json`、`events.ndjson`、`agents.json`、`artifacts.json`、`validations.json`、`summary.md`。
- Markdown 文件面向人工，机器文件面向前端和工具；不要让前端从自由文本猜测任务状态。
- 观测文件只记录公开事实、阶段、命令、结果和阻塞项，不记录内部推理。

## 交付

完成任务时必须留下：

- 做了什么
- 为什么这么做
- 运行了哪些验证
- 还有什么残余风险
- 下一个会话应先读什么
