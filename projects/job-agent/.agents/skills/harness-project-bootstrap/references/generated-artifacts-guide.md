# Generated Artifacts Guide

Bootstrap 完成后必须让用户理解每类文件的作用、维护者和更新时机。

## 入口与地图

- `AGENTS.md`
  Codex 进入项目后的短规则地图。只放入口、必读文件、关键边界、git 生命周期和必跑传感器。
- `ARCHITECTURE.md`
  项目结构、领域边界、禁止事项和生成物说明。新模块、新边界或长期架构约束变化时更新。

## 项目级 Skill

- `.agents/skills/<project>-harness-request/SKILL.md`
  后续正式需求的主入口，规定 planner、coder、verifier、doc_gardener 串行流程。
- `.agents/skills/<project>-harness-request/references/task-file-contract.md`
  任务目录和字段契约。
- `.agents/skills/<project>-harness-request/references/stage-checklist.md`
  各阶段必须完成的动作。
- `.agents/skills/<project>-harness-request/references/git-workflow.md`
  分支、commit、push 的规则。
- `.agents/skills/<project>-harness-request/references/task-routing.md`
  任务路由协议，规定如何根据“继续上一个任务”“基于某任务继续”“验收反馈”等自然语言输入复用已有任务。
- `.agents/skills/<project>-harness-request/references/problem-decomposition.md`
  正式任务的前置拆解协议，规定问题定义、证据、方案选项、工作拆分和验收拆分。
- `.agents/skills/<project>-harness-request/references/research-protocol.md`
  需求、问题、根因、方案或验收标准不明确时的调研协议，规定如何结合本地证据和外部资料选择项目适配方案。
- `.agents/skills/<project>-harness-request/references/uncertainty-gates.md`
  重要流程的不确定性闸门，规定初始化、需求、拆解、环境、验证、数据/安全/git 和视觉验收无法完全确认时必须暂停询问。
- `.agents/skills/<project>-harness-request/references/functional-verification.md`
  分层功能验证协议，规定行为变化必须先拆功能点和核心流程，优先运行项目原生测试或任务内临时小脚本，并把结果写入 `validations.json.functional_checks`。
- `.agents/skills/<project>-harness-request/references/runtime-verification.md`
  运行时和交互验证协议，规定 build/typecheck/lint 不足以证明行为正确，Electron 默认使用 MCP Playwright 或 Playwright 验证核心交互，缺少工具时先询问用户。
- `.agents/skills/<project>-harness-request/references/interaction-verification.md`
  前端和 Electron 交互验证专项协议，规定 `interaction-test-plan.yaml`、MCP Playwright 执行动作、snapshot/console/network/screenshot 证据和失败门禁。
- `.agents/skills/<project>-harness-request/references/task-observability.md`
  前端和工具读取任务进度的机器可观测协议，规定 `state.json`、`events.ndjson`、`agents.json`、`artifacts.json`、`validations.json` 的用途和字段边界。
- `.agents/skills/<project>-harness-request/references/visual-task-profile.md`
  截图、设计图、一比一复刻和视觉还原任务的专项流程，规定视觉规格、截图证据、区域级对照、Electron 缩放验证、自修复复验和缺陷回流。

## Harness 配置

- `.harness/bootstrap-plan.yaml`
  本次初始化的结构化执行计划。Codex 先写 plan，脚本再根据 plan 校验、预览和渲染文件。
- `.harness/bootstrap-config.yaml`
  后续重新 bootstrap 或调整 profile 时的可配置输入。
- `.harness/environment.yaml`
  运行、调试、前端入口、Electron 启动、视口、测试数据和 MCP Playwright 可用性的机器可读配置。前端、Electron、截图、运行时和交互验证任务必须先读。
- `.harness/workspace-map.yaml`
  初始化时发现的 workspace 边界、相关项目、`.harness` 状态、写入策略和 dev/build/test 命令图。涉及联调、构建、启动或跨项目修改时必须先读。
- `.harness/project-profile.yaml`
  长期配置源，记录项目类型、边界、传感器、git lifecycle 和文档真相源。
- `.harness/manifest.json`
  面向工具和自动检查的结构化索引。
- `.harness/current-task.json`
  当前活跃或最近任务指针，用于续跑上一个任务。
- `.harness/invariants.yaml`
  不变量，记录任何任务都不能破坏的长期规则。
- `.harness/human-gates.yaml`
  需要人工确认的高风险操作和高影响未知项。
- `.harness/tasks/index.json`
  任务摘要索引，用于按标题、slug、状态、关键词和更新时间检索任务。
- `.harness/tasks/README.md`
  任务目录说明。

## 文档

- `docs/design-docs/harness-operating-model.md`
  本项目 harness 如何工作的说明。
- `docs/generated/COMMANDS.md`
  项目命令与 harness 传感器索引。
- `docs/QUALITY_SCORE.md`
  当前工程化质量基线和演进空间。
- `docs/RELIABILITY.md`
  当前可靠性机制、缺口和后续建议。
- `docs/SECURITY.md`
  当前安全边界和高风险区域。
- `docs/design-docs/harness-bootstrap-report.md`
  本次初始化报告，说明检测结果、生成文件、假设、跳过项和后续动作。

## Bootstrap Report 必须包含

- 检测到的技术栈和置信度。
- 生成或合并了哪些文件。
- 每类文件的用途。
- 选中的 native sensors。
- Workspace 相关项目和 dev/build/test 命令图。
- 没有运行或无法确认的命令。
- 向用户提出过的问题和最终采用的答案。
- 后续正式需求如何触发项目级 request skill。

## 维护规则

- `AGENTS.md` 保持短，不超过约 100 行。
- 具体操作细则放 skill references。
- 追加反馈无法命中正确任务时，先检查 `task-routing.md`、`current-task.json` 和 `tasks/index.json`。
- 项目命令变化时同步 `project-profile.yaml` 和 `docs/generated/COMMANDS.md`。
- 运行、调试、前端入口、Electron 启动、测试数据或 MCP Playwright 能力变化时同步 `.harness/environment.yaml`。
- dev/build/test 命令涉及的父级或兄弟项目变化时同步 `.harness/workspace-map.yaml`。
- related project 新增或 `.harness` 状态变化时同步 `.harness/workspace-map.yaml`；无 `.harness` 的附属子仓库默认使用同名任务分支协同编辑，有 `.harness` 的独立项目写入前必须确认。
- 架构边界变化时同步 `ARCHITECTURE.md`。
- 任务反复返工时，先检查 `problem-decomposition.md` 是否缺少问题定义、非目标、方案取舍或验收拆分。
- 方案反复不适配时，先检查 `research-notes.md` 是否结合了当前项目证据，而不是直接套用外部方案。
- 任务因为猜测导致偏差时，先检查 `uncertainty-gates.md` 和 `.harness/human-gates.yaml` 是否把关键未知项转成暂停确认点。
- 任务到 MCP Playwright 才暴露基础功能错误时，先检查 `functional-verification.md`、`functional-test-plan.md` 和 `validations.json.functional_checks` 是否先覆盖了功能点和核心流程。
- 任务 build 通过但交互、运行流程或 Electron 行为仍出错时，先检查 `runtime-verification.md` 和 `runtime-test-plan.md` 是否覆盖了真实启动、关键操作、状态变化和工具缺失确认。
- 前端任务只截图不点击、不检查 console/network 或没有复验时，先检查 `interaction-verification.md`、`interaction-test-plan.yaml` 和 `validations.json.interaction_checks` 是否落地。
- 前端或工具无法稳定展示任务状态时，先检查 `task-observability.md` 是否落实到任务目录的机器文件。
- 新增长期失败模式时同步 `docs/generated/FEEDBACK_FLYWHEEL.md` 或对应质量文档。
- 视觉任务出现反复偏差时，同步项目级 `visual-task-profile.md`，把缺陷模式转成更具体的区域对比、自修复复验或缩放检查项。
