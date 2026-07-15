# Reliability

## 当前定义

这个项目当前的可靠性主要依赖：

- `unit_tests`：Run all project unit tests.，命令：`.venv/bin/python -m unittest discover -s tests`
- `evaluation_suite`：Run high/medium/low match regression checks.，命令：`.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`
- `web_compile`：Check Streamlit app syntax.，命令：`.venv/bin/python -m py_compile web_app.py`
- `real_sample_cli`：Run private real JD/PDF resume sample locally.，命令：`.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`
- `bootstrap_plan_validate`：Validate bootstrap plan and template mapping.，命令：`.venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .`

## 当前状态与缺口

- 项目已位于父级 Git monorepo；正式任务使用独立 `harness/*` 分支和分阶段本地提交。
- 本轮 61 个 unittest、3 个评测 case、公开中文 CLI、Web 编译和 Harness 计划校验通过。
- Streamlit 已完成真实 Chrome 上传、生成、下载和 rerun 验证，并保留截图、页面快照、console 与 network 证据。
- 私有 `data/my_*` 样例当前不在仓库中，因此对应传感器只能记录为 skipped；公开中文 demo 已通过。
- 未运行真实 LLM/API 验证，因为 mock 模式是安全默认值且不能假设 secret 存在。
- 中文 OCR 语言包可用，真实用户截图仍需按图像质量人工检查。

## 后续建议

- 根据后续任务反馈补充传感器
