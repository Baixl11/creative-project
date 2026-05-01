# Reliability

## 当前定义

这个项目当前的可靠性主要依赖：

- `unit_tests`：Run all project unit tests.，命令：`.venv/bin/python -m unittest discover -s tests`
- `evaluation_suite`：Run high/medium/low match regression checks.，命令：`.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`
- `web_compile`：Check Streamlit app syntax.，命令：`.venv/bin/python -m py_compile web_app.py`
- `real_sample_cli`：Run private real JD/PDF resume sample locally.，命令：`.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`
- `bootstrap_plan_validate`：Validate bootstrap plan and template mapping.，命令：`.venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .`

## 当前缺口

- No git branch or commit operations were run because the target directory is not a git repository.
- No live LLM/API verification was run because mock mode is the safe default and no secret should be assumed.
- Chinese screenshot OCR smoke now passes with a temporary Chinese JD image after installing `chi_sim`; real user screenshots still need manual quality checks.
- No full browser interaction test was run during bootstrap; only Streamlit launch and curl healthcheck were previously validated.

## 后续建议

- 根据后续任务反馈补充传感器
