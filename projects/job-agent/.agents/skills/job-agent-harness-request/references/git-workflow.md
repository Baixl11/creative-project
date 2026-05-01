# Git Workflow

## 适用范围

本规则只在当前项目是 git 仓库时执行。若 `git rev-parse --is-inside-work-tree` 失败，继续完成 harness 任务，但必须记录“当前目录不是 git 仓库，已跳过分支与提交”。

## 任务分支

- 正式代码需求开始前先检查 `git status --short`。
- 若存在任务外未归属改动，不要把这些改动纳入提交。
- coder 准备开始修改代码前，必须先创建或切换到任务分支；不得在写完代码后才创建 Agent 工作分支。
- 新任务默认创建独立分支：`harness/<type>/<short-slug>`。
- `type` 取 `feature`、`fix`、`refactor`、`docs`、`test`、`chore` 中最贴近任务性质的一项。
- `short-slug` 使用 2-6 个英文短词描述内容，不包含 task id。
- 不自动 push；远端推送必须由用户明确要求。

## 多仓库分支

- 读取 `.harness/workspace-map.yaml` 判断 related project 的 `harness_status` 和 `write_policy`。
- related project 存在 `.harness` 或 `harness_status: present` 时，视为独立 harness 项目，默认不编辑；需要跨仓库写入时必须先获得用户确认。
- related project 没有 `.harness` 或 `harness_status: absent` 时，视为当前主 harness 的附属子仓库，默认可编辑。
- 编辑附属子仓库前，必须在该子仓库内创建或切换与主仓库同名的任务分支：`harness/<type>/<short-slug>`。
- 附属子仓库分支创建失败、存在冲突或有未归属改动时，先暂停并记录阻塞，不得在错误分支继续写入。

## 提交边界

满足以下任一条件，且相关验证通过后，应考虑生成一次本地 commit：

- 一个独立模块或功能闭环完成。
- 公共 API、配置、数据结构或权限边界发生变化。
- 变更超过约 300-500 行。
- 文档、测试和实现已经形成可单独复核的最小闭环。

## 提交要求

- 每次提交前只暂存本任务相关文件。
- 提交前执行与本提交范围匹配的最小验证。
- commit message 遵守仓库 `AGENTS.md`。
- 提交后把 commit hash、验证命令和提交意图写入任务文件。
