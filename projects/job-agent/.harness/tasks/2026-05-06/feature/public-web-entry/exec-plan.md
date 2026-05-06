# 执行计划

1. 修改 `web_app.py`，引入项目根路径 helper，避免 monorepo 部署时相对路径失效。
2. 补充 `tests/test_web_app.py`，验证路径 helper 和公开 demo fallback。
3. 增加 Streamlit Cloud 部署文件和说明文档。
4. 运行单元测试、评测、编译、公开 demo CLI 和 bootstrap plan 校验。
5. 克隆或刷新 GitHub monorepo 临时目录，把项目同步到 `projects/job-agent/`。
6. 在 monorepo 根目录运行部署形态 smoke。
7. 提交并 push 到 GitHub。
