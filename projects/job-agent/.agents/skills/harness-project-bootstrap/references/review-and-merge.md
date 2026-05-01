# Review And Merge Lifecycle

本规则只在目标项目使用 git 和 PR/merge 流程时启用。

## 状态边界

- `verified`：机器验证已执行并记录，不代表需求验收通过。
- `ready_for_human_review`：Codex 认为可以交给人类 review。
- `accepted`：用户或项目负责人确认行为符合需求。
- `completed`：已 merge、关闭任务或进入发布流程。

## PR 规则

- PR 标题应表达变更内容，不必包含 task id。
- PR 描述必须引用 `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/`。
- PR 描述必须列出验证命令和残余风险。
- CI 失败时不得 merge，除非用户明确批准并记录原因。
- 不自动 push，不自动创建远端 PR，除非用户明确要求。

## Review Checklist

最小 review 应检查：

- 需求是否被正确理解。
- 变更是否在计划范围内。
- 是否夹带无关文件。
- 传感器是否真实执行。
- 架构、安全、可靠性文档是否需要同步。

## Merge 后

merge 或用户接受后：

- 将 active exec plan 移到 completed，或在 active 文件中标记完成状态。
- 更新 `trace.md`、`handoff.md` 和 `doc-sync-report.md`。
- 如果发现新长期经验，写入 `docs/generated/FEEDBACK_FLYWHEEL.md`。
