# 调研记录

## 触发原因

用户希望把现有 Web 入口变成公网网页即点即用入口。部署平台、monorepo 子目录入口、依赖文件位置和云端运行方式会影响实现方案，因此需要调研。

## 本地证据

- 当前项目已有 `web_app.py`，使用 Streamlit。
- `requirements.txt` 已包含 `streamlit`、`pypdf`、`Pillow`、`pytesseract`。
- 远端仓库采用 `projects/job-agent/` 子目录承载当前项目。
- 当前 `web_app.py` 使用相对路径，部署到 monorepo 子目录时存在路径风险。

## 外部资料

- Streamlit Community Cloud 官方文档说明部署流程基于 GitHub 仓库、分支和主文件路径。
- Streamlit 官方依赖文档说明 Python 依赖通过 `requirements.txt` 管理，Linux 系统依赖可通过 `packages.txt` 管理。

## 候选方案

1. Streamlit Community Cloud
   - 适配性：高。项目已经是 Streamlit。
   - 成本：免费或低成本。
   - 风险：最终创建 app 需要用户账号授权。

2. 静态网页
   - 适配性：低。无法直接执行 Python Agent、PDF/OCR 和本地文件处理。

3. 自建服务器
   - 适配性：中。能运行，但维护成本高。

## 最终选择

选择 Streamlit Community Cloud 部署就绪方案。原因是它最符合当前项目技术栈、作品集展示目标、免费预算和 2 周学习节奏。

## 仍需用户确认

- 最终公网 URL 需要用户登录 Streamlit Community Cloud 后创建应用才能得到。
- 如果用户后续希望使用真实 LLM，需要再配置 Streamlit secrets 或环境变量。
