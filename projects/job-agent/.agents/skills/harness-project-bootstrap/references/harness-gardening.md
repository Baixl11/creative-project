# Harness Gardening

Harness 不是一次性产物。它会随着模型、工具链、项目结构和团队习惯变化而腐烂。

## 目标

- 定期清理不再承重的规则。
- 把重复失败模式沉淀为文档、传感器或人工 gate。
- 避免 `AGENTS.md`、skill 和 docs 越堆越长。
- 在模型升级或工具升级后复查 harness 假设。

## 触发条件

出现以下情况时，应启动 harness gardening：

- 同一类错误在两个以上任务中重复出现。
- 同一类问题拆解缺口反复出现，例如问题定义不清、方案选项缺失或验收标准不可判断。
- 同一类运行时验证缺口反复出现，例如只跑 build、没有验证真实应用启动、关键交互、API smoke、IPC 或跨项目联调。
- Codex 经常忽略某条规则。
- 某个传感器长期不运行、误报或成本过高。
- 项目结构、技术栈、CI 或发布流程发生变化。
- 模型或 Codex 运行时能力明显变化。
- `AGENTS.md` 超过约 100 行，或 request skill 变成大段百科。

## 必备产物

Bootstrap 时应生成：

- `docs/generated/FEEDBACK_FLYWHEEL.md`
- `docs/HARNESS_GARDENING.md`

## 反馈回路

```text
任务失败或人工 review 反馈
-> doc_gardener 记录反馈
-> 判断是否是长期模式
-> 更新 skill reference / architecture / sensor / human gate
-> 后续任务自动继承
```

## 不应做的事

- 不要把一次性问题写进 `AGENTS.md`。
- 不要为低频问题新增高成本传感器。
- 不要让 bootstrap 每次 sync 覆盖用户手工调整。
- 不要用新规则掩盖需求本身不清晰的问题。
