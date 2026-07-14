# 文档同步报告

## 已同步

- `PROJECT_STATUS.md`：更新日期、61 个测试、真实交互、Git 状态和后续建议。
- `docs/QUALITY_SCORE.md`、`docs/RELIABILITY.md`：更新验证能力、残余风险和 monorepo 事实。
- `docs/design-docs/harness-operating-model.md`：移除“不是 Git 仓库”和“仅 curl”这两项当前状态。
- `.harness/environment.yaml`、`.harness/workspace-map.yaml`、`.harness/project-profile.yaml`：更新临时文件写入边界、Git 根和 Playwright 证据。
- `DEMO_GUIDE.md`、`PORTFOLIO_CASE_STUDY.md`：更新测试数、公开中文 demo 分数和评测分数。
- `scripts/generate_portfolio_pdf.py` 与 `docs/portfolio/job_agent_case_study.pdf`：更新为 61 个测试、94 分中文 demo 和 88/60/16 评测结果，并完成 PNG 渲染抽查。

## 历史 Harness 纠错

- `2026-05-06/feature/public-web-entry` 原来把 `curl -I` 记为交互通过，现已改为 `needs_human_review`。
- 同步修复该任务的 `state.json`、`agents.json`、`artifacts.json` 和 `validations.json` 协议字段。
- 任务索引中的历史任务状态已改为 `needs_clarification`；远端 push 和低层验证历史事实保留。
