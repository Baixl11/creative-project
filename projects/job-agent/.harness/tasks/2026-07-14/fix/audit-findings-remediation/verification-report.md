# 验证报告

## 结论

已复现问题均完成针对性修复和回归覆盖。功能、评测、公开 CLI、Streamlit 运行时和真实 Chrome 核心交互通过，任务可进入用户验收。

## 必跑传感器

| 传感器 | 结果 | 摘要 |
| --- | --- | --- |
| 全量 unittest | PASS | 61 tests passed |
| 评测集 | PASS | high 88、medium 60、low 16，3/3 在预期区间 |
| Web 编译 | PASS | `web_app.py` 编译通过 |
| 私有样例 CLI | SKIPPED | 仓库中没有 `data/my_jd.txt` 和 `data/my_resume.pdf` |
| 公开中文 CLI | PASS | mock 模式，匹配分 94 |
| Harness 计划校验 | PASS | 36 个模板映射有效 |
| OCR 环境 | PASS | `chi_sim`、`eng`、`osd`、`snum` 可用 |

## 功能验证

- 简历改写不再凭空加入“主导”“G 端”“0-1”或新指标，并保留原文“参与”等职责边界。
- 联系方式不会从无亮点 fallback 回流；英文动作 bullet 可独立提取。
- 福利等忽略章节保持生效，直到进入下一个已知 JD 章节。
- 同义概念每组最多贡献一个支持单位，协作、交付、优化不再互相抬分；匹配强度限制在 0-1。
- 评测失败时 CLI 返回非零；非法 UTF-8 和 LLM JSON/schema/UTF-8 错误统一为项目错误。
- LLM 自动降级后的运行模式为 `mock-fallback`。
- Web 上传和报告只存在于 `TemporaryDirectory`，退出后删除；JSON 路径脱敏，结果在 Streamlit rerun 后仍可下载。

## 运行时与交互

- Streamlit 在 `http://localhost:8501` 启动，`/_stcore/health` 返回 `ok`。
- Browser 与 Chrome 插件都因 `Cannot redefine property: process` 无法初始化。
- 随后用一次性 Playwright 1.61 + 本机 Chrome 执行真实页面流程：上传、生成、Markdown/JSON 下载、切换模式触发 rerun、结果保留全部通过。
- console errors：0；page errors：0；network failures：0。
- 证据位于 `snapshots/` 与 `logs/`。

## 残余风险

- Playwright 是本轮测试环境依赖，未加入生产 `requirements.txt`；Browser 插件兼容问题仍待上游修复。
- 未验证真实 LLM/API，因为没有假设 API key 或外部成本授权。
- 私有样例缺失，规定的 `data/my_*` 传感器只能如实跳过。
- 真实用户 OCR 图片仍可能受到清晰度和领域词误识别影响。
- 项目尚未配置 CI、静态检查和依赖锁定策略。
