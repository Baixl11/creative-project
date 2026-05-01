# 验证报告

## 已执行

- `.venv/bin/python -m unittest tests.test_web_app`：通过，9 个测试成功。
- `.venv/bin/python -m unittest discover -s tests`：通过，34 个测试成功。
- `.venv/bin/python -m py_compile web_app.py`：通过。
- `.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`：通过，3 个 case 全部成功。
- `.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json`：通过，真实样本 mock 得分 95。

## 未完全执行

- Streamlit 运行时健康检查需要本地端口授权，启动命令两次授权超时，未能执行 `curl -I`。
- 未执行真实浏览器点击复制验证；最终视觉和复制体验需要用户打开页面确认。
