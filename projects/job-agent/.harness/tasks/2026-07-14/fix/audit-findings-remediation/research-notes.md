# 调研记录

## 当前项目证据

- `ResumeRewriter` 的专用模板会硬编码“主导”“G 端”“0-1”等措辞；最小输入已能复现职责和领域升级。
- `ResumeParser.parse()` 在无亮点时直接使用 `lines[:6]`，联系方式输入会进入 highlights。
- `JDParser` 遇到“员工福利”后把当前章节清空，后续正文又满足默认保留条件。
- `MatchEngine` 的 AI 同义词组重复且协作、交付、优化概念混在同一组，支持单位可重复累计。
- `app.evaluate` 只写失败计数，不根据失败结果设置非零退出码。
- `ReportGenerator` 在 LLM 调用异常后生成 mock 摘要，却保留 `live-api:<model>` 标签。
- `web_app.py` 在 `outputs/web/uploads` 和 `outputs/web/reports` 写入用户文件，未清理。
- 历史 `public-web-entry/validations.json` 用 `curl -I` 作为交互通过证据，但计划中的截图、console 和 network 文件不存在。

## 方案选择

- 改写采用证据保守策略：只重排原始事实和目标要求，不添加职责级别、业务领域或数值。
- 匹配采用“概念组最多贡献一个支持单位 + 相关度均值”策略，避免别名堆叠和亮点数量刷分。
- Web 使用标准库 `TemporaryDirectory`；报告文本和 JSON 在清理前读入内存并存入 session state，不引入新依赖。
- LLM 边界统一包装成项目错误类型，报告层显式区分 `mock`、`live-api:<model>` 与 `mock-fallback`。

## 验证工具状态

- 项目要求用真实浏览器执行 Streamlit 点击、输入、console/network 和截图验证。
- 2026-07-14 初始化 Browser 插件两次均失败：`Cannot redefine property: process`；重置运行时后结果不变。
- 该错误只影响最终真实交互证据，不影响业务实现、单元测试和服务启动验证。不得用 HTTP smoke 冒充交互通过。
