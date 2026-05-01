# Review And Merge

## 状态定义

- `verified`：机器验证已执行并记录。
- `ready_for_human_review`：等待人工 review。
- `accepted`：用户或负责人确认行为符合需求。
- `completed`：已 merge、关闭任务或进入发布流程。

## PR 要求

- PR 标题表达变更内容，不强制包含 task id。
- PR 描述必须引用 `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/`。
- PR 描述必须列出验证命令、commit 摘要和残余风险。
- CI 失败时不得 merge，除非用户明确批准并记录原因。
- 不自动 push，不自动创建远端 PR，除非用户明确要求。

## Review Checklist

- 需求是否被正确理解。
- 变更是否在计划范围内。
- 是否夹带无关文件。
- 传感器是否真实执行。
- 文档、可靠性、安全性是否需要同步。
