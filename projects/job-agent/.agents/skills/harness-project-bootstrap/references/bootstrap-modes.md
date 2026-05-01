# Bootstrap Modes

不要对所有项目生成同样重的 harness。根据项目规模、风险和验证成熟度选择模式。

## Minimal

适合个人项目、原型、早期 demo。

生成：

- `AGENTS.md`
- `ARCHITECTURE.md`
- `.agents/skills/<project>-harness-request/`
- `.harness/environment.yaml`
- `.harness/project-profile.yaml`
- `.harness/tasks/README.md`
- `docs/design-docs/harness-operating-model.md`
- `docs/design-docs/harness-bootstrap-report.md`

特点：

- 不新增自定义 guard 脚本。
- 只记录已有 native sensors。
- 人工验收 gate 明确保留。

## Standard

适合多数团队项目。

在 Minimal 基础上增加：

- `.harness/manifest.json`
- `.harness/invariants.yaml`
- `.harness/human-gates.yaml`
- `docs/generated/COMMANDS.md`
- `docs/generated/FEEDBACK_FLYWHEEL.md`
- `docs/QUALITY_SCORE.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`
- 最小 harness 自检传感器。

## Strict

适合高风险项目、企业项目、多人协作项目。

在 Standard 基础上增加：

- 自定义边界 guard。
- PR/merge lifecycle。
- CI 集成建议。
- 安全和可靠性强 gate。
- 周期性 harness gardening 计划。

## 默认选择

- 无 git、无测试、个人 demo：Minimal。
- 有 git、已有测试/构建命令：Standard。
- 有 CI、发布、权限、数据迁移、生产依赖：Strict。
