# 运行时测试计划

## 环境恢复

1. 在项目内创建 `.venv`。
2. 按 `requirements.txt` 安装既有依赖，不新增生产依赖。
3. 确认 Tesseract 与 `chi_sim` 语言包可见。

## 服务验证

1. 以无头模式启动 `streamlit run web_app.py`，使用独立端口。
2. 等待 Streamlit health endpoint 就绪。
3. 检查启动日志无导入、路径或配置错误。
4. 保持服务运行，交给真实浏览器执行交互计划；完成后正常停止进程。

## 失败边界

- 缺少私有 `data/my_*` 时只记录该传感器 skipped，不改成公开样例后伪称原命令通过。
- 浏览器工具不可用时，运行时启动可单独记 passed，交互项必须记 failed 或 needs_human_review。
