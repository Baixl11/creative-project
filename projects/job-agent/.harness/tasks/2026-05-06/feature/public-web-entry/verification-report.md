# 验证报告

## 已通过的低层验证

- 源项目单元测试：43 个测试通过。
- 源项目编译检查：`web_app.py` 通过。
- Harness bootstrap plan 校验：通过，36 个模板映射有效。
- 评测集：3 个 case 全部通过。
- 公开中文 demo CLI：mock 模式匹配分 95。
- 私有本地样例 CLI：mock 模式匹配分 95。
- monorepo 模拟目录中，`projects/job-agent/web_app.py` 可从仓库根目录被加载，`PROJECT_ROOT` 正确指向 `projects/job-agent`，公开 demo 数据可找到，输出目录指向 `projects/job-agent/outputs/web`。
- 远端 GitHub clone 结构中，单元测试、评测、编译、公开 demo、bootstrap plan 校验均通过。
- 从 monorepo 根目录启动 `streamlit run projects/job-agent/web_app.py --server.port 8511` 成功。
- Runtime healthcheck：`curl -I http://localhost:8511` 返回 `HTTP/1.1 200 OK`，仅证明服务可达。

## 交互验证纠正（2026-07-14）

- 原任务没有执行真实点击、上传、生成、console/network 检查或截图。
- 因此 HTTP smoke 不再记录为交互通过；对应状态改为 `needs_human_review`。

## 已发现并处理

- 初版 `.streamlit/config.toml` 同时设置 `enableCORS=false` 和 `enableXsrfProtection=true`，Streamlit 提示二者不兼容。已删除 `enableCORS=false`，保留 XSRF 保护。

## GitHub 结果

- 主体提交：`9283a38 Prepare Job Agent web deployment`。
- 已推送：`main -> git@github.com:Baixl11/creative-project.git`。

## 残余风险

- Streamlit Cloud 最终 URL 需要用户登录并创建 app。
- 云端 OCR 依赖安装和真实 JD 截图 OCR 效果需要部署后确认。
- 部署后的核心页面交互仍需要真实浏览器证据。
