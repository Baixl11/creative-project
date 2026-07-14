# 功能测试计划

| 功能点 | 风险 | 验证方式 | 覆盖输入 |
| --- | --- | --- | --- |
| 证据保守改写 | blocking | 单元测试 | 参与 AI 测试、竞品分析、普通产品设计 |
| PII 过滤 | blocking | 单元测试 | 纯电话邮箱、联系方式加有效经历 |
| JD 忽略章节 | high | 单元测试 | 福利标题及正文、后续有效章节 |
| 匹配概念计数 | high | 单元测试 + 评测 | AI/LLM、协作/落地、空需求 |
| 评测退出码 | high | 单元测试 + 子进程/入口验证 | 通过和失败 manifest |
| LLM 错误与降级模式 | high | 单元测试 | HTTP、非法 JSON、schema、fallback |
| 文本解码错误 | medium | 单元测试 | 非 UTF-8 文件 |
| Web 临时文件与下载 | blocking | 单元测试 + Streamlit 交互 | 上传、生成、rerun、下载 JSON |

## 必跑命令

- `.venv/bin/python -m unittest discover -s tests`
- `.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations`
- `.venv/bin/python -m py_compile web_app.py`
- `.venv/bin/python -m app.main --jd data/demo_jd_cn.txt --resume data/demo_resume_cn.txt --output outputs/demo_cn_report.md --json-output outputs/demo_cn_report.json`
- `.venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .`
