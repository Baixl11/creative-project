# 运行时验证计划

## 触发原因

本任务改变用户访问方式和部署入口。编译通过只能证明语法正确，不能证明网页能从 monorepo 子目录启动，也不能证明公开 demo 可以运行。

## 验证工具

- 首选：项目原生命令 + Streamlit 本地服务 smoke。
- 交互验证：如 MCP Playwright/browser automation 可用，则执行页面加载和核心入口检查；否则记录人工验收边界。

## 验证环境

- 本地项目根：`/Users/cyan/个人工作/2026-04-25-ai-ai`
- 远端同步临时仓库：`/private/tmp/creative-project-public-web-entry`
- 本地入口：`http://localhost:8501`
- 部署入口文件：`projects/job-agent/web_app.py`

## 交互路径

1. 从 monorepo 根目录启动 `streamlit run projects/job-agent/web_app.py`。
2. 打开 `http://localhost:8501`。
3. 页面出现 Job Agent 标题和“开始分析”区域。
4. 用户可选择内置样例、真实样例或上传文件。

## 工具缺失处理

如果无法使用浏览器自动化，则用 HTTP smoke 证明服务可达，并将最终点击验收留给用户。

## 残余风险

- Streamlit Cloud 最终 URL 需要用户账号创建，Codex 不能代替账号授权。
- 云端 OCR 需要部署后再用真实截图确认。
