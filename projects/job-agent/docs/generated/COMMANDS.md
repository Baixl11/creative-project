# Commands

## 首选入口

- 在当前 Codex 对话中直接提出需求，优先触发项目级 skill `job-agent-harness-request`。

## 项目命令

- `.venv/bin/python -m unittest discover -s tests` - Run all project unit tests.
- `.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations` - Run high/medium/low match regression checks.
- `.venv/bin/python -m py_compile web_app.py` - Check Streamlit app syntax.
- `.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json` - Run private real JD/PDF resume sample locally.

## 运行与调试环境

这些命令来自 `.harness/environment.yaml`，用于启动、调试和交互验证入口。

- `install`（setup，一次性）：`.venv/bin/python -m pip install -r requirements.txt`，目录：`.`，用途：Install project dependencies for PDF/OCR/Web UI/harness plan validation.
- `unit_tests`（test，一次性）：`.venv/bin/python -m unittest discover -s tests`，目录：`.`，用途：Run all unit tests for parsers, matching, Agent workflow, Web UI helpers, and evaluation helpers.
- `evaluation_suite`（evaluation，一次性）：`.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`，目录：`.`，用途：Run high/medium/low match regression cases and write evaluation summaries.
- `real_sample_cli`（runtime，一次性）：`.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`，目录：`.`，用途：Run the current private Chinese JD/PDF resume sample locally.
- `web_compile`（static，一次性）：`.venv/bin/python -m py_compile web_app.py`，目录：`.`，用途：Check Streamlit Web UI syntax/import validity.
- `web_dev`（dev，长驻）：`.venv/bin/streamlit run web_app.py`，目录：`.`，用途：Launch the local Streamlit Web UI.
- `web_smoke`（runtime，一次性）：`curl -I http://localhost:8501`，目录：`.`，用途：Check that Streamlit returns HTTP 200 after web_dev starts.

## 命令图

- .venv/bin/python -m unittest discover -s tests：README.md Run the baseline tests
- .venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations：README.md Run the evaluation suite
- .venv/bin/python -m app.main --jd data/sample_jd.txt --resume data/sample_resume.txt --output outputs/report.md --json-output outputs/report.json：README.md Quick start
- .venv/bin/streamlit run web_app.py：README.md and WEB_DEMO.md local Web UI launch command

## Harness 说明

这些命令用于 Codex 自验证，不是正式需求的用户入口。命令涉及相关项目时，先读 `.harness/workspace-map.yaml`。
