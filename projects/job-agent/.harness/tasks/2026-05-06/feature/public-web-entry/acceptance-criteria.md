# 验收标准

## 机器验证

- `.venv/bin/python -m unittest discover -s tests` 通过。
- `.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations` 通过。
- `.venv/bin/python -m py_compile web_app.py` 通过。
- `.venv/bin/python -m app.main --jd data/demo_jd_cn.txt --resume data/demo_resume_cn.txt --output outputs/demo_cn_report.md --json-output outputs/demo_cn_report.json` 通过。
- `.venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .` 通过。

## 行为验证

- 从 monorepo 根目录运行 `streamlit run projects/job-agent/web_app.py` 时，Web UI 能加载。
- “使用真实样例”在没有私有 `data/my_*` 文件时，能回退到公开中文 demo。
- Web UI 写入产物时使用 Job Agent 项目目录下的 `outputs/web`，不依赖调用命令所在目录。
- GitHub 仓库包含部署说明，明确写出 Streamlit Cloud 的 repository、branch 和 main file path。

## 人工验收

- 用户确认 GitHub 页面目录结构清晰，未来仍能放其他项目。
- 用户登录 Streamlit Community Cloud 创建 app 后，确认网页 URL 可以打开。
- OCR 截图上传在云端环境中的效果需要部署后用真实截图确认。
