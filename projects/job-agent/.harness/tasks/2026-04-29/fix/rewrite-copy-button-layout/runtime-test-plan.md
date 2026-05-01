# 运行时测试计划

## 触发原因

这是用户可见的 Web UI 行为变化，仅靠编译不能证明页面仍能启动。

## 验证工具

- 项目原生 unittest。
- `py_compile`。
- Streamlit 本地服务 + `curl -I` 健康检查。

## 验证环境

- 工作目录：项目根目录。
- 启动命令：`.venv/bin/streamlit run web_app.py --server.headless true --server.port 8506 --browser.gatherUsageStats false`。
- 健康检查：`curl -I http://localhost:8506`。

## 残余风险

当前未执行真实浏览器点击复制验证，最终视觉和复制体验需要用户打开页面确认。
