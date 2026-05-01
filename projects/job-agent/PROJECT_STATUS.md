# Project Status

Last updated: 2026-04-29

## 当前阶段

项目已经超过 MVP，进入作品集交付包装阶段。

当前最重要的目标不是继续堆功能，而是保证：

- 本地 demo 稳定可跑。
- 项目价值能被非技术面试官快速理解。
- 技术实现能被技术面试官追问时讲清楚。
- 已知限制说得清楚，不夸大能力。

## 已完成能力

- CLI 主流程：读取 JD 和简历，生成 Markdown 与 JSON 报告。
- Agent 编排：输入读取、JD 解析、简历解析、匹配、改写建议、面试问题、报告输出。
- 输入支持：txt、md、rtf、macOS 文本包、PDF、图片 OCR。
- 中文 OCR：本机已安装 `chi_sim`，默认使用 `chi_sim+eng`，并补充 OCR 空格清洗。
- 中文匹配：支持智能化产品、AI、大模型、产品规划、研发协作、用户需求、市场洞察等能力词组。
- PDF 清洗：支持基础中文断行合并和联系方式过滤。
- 输出体验：中文口语化报告、结构化 bullet 改写建议、证据句解释。
- Web UI：本地 Streamlit 页面，支持样例、真实样例和上传文件分析。
- 评测集：高、中、低三组回归样例。
- 自动化测试：当前 41 个 unittest 通过。
- Harness：已有任务记录、验证命令、项目规则、架构说明和状态追踪。

## 当前确认状态

- Web UI 上传入口和按钮已人工检查，当前没有明显问题。
- 中文 OCR 已通过临时中文 JD 截图 smoke；真实用户截图测试本轮暂时跳过，不作为作品集包装阻塞项。
- 作品集页面内容正在补充，当前新增 `PORTFOLIO_CASE_STUDY.md` 作为页面稿和截图计划。

## 当前主动暂停

- 真实 LLM 接入暂时暂停。
- `.env` 应保持 `USE_MOCK_LLM=true`，保证项目零成本、可稳定演示。
- 后续可恢复 LLM，用于报告总结和简历 bullet 润色，但不阻塞当前作品集交付。

## 接下来 3 天建议

### Day 1：演示验收

- Web UI 入口和按钮已完成基本人工检查。
- 真实 JD 截图 OCR 本轮暂时跳过。
- 剩余可在截图整理时顺手检查报告展示、下载入口和复制体验。

### Day 2：作品集包装

- 按 `PORTFOLIO_CASE_STUDY.md` 整理页面结构。
- 截取 Web UI、报告、JSON、评测结果的关键截图。
- 准备简历里的项目描述和 30 秒/2 分钟介绍。

### Day 3：工程化收尾

- 初始化 git 仓库并形成第一版提交历史。
- 再跑一次全量验证命令。
- 决定是否恢复真实 LLM，或把 LLM 放到后续路线图。

## 总体还差什么

必须补齐：

- 最终作品集截图和演示脚本。
- Git 仓库初始化与提交历史。

建议补齐：

- 复杂 PDF 进一步清洗。
- 真实 JD 截图 OCR 人工验收。
- OCR 领域词纠错，例如 `AI` 被识别成 `Al`、`G端` 被识别成 `C端`。
- 真实 LLM bullet 润色，但需要 API key 和成本确认。

暂不建议优先做：

- 用户登录。
- 公网部署。
- 多岗位批量比较。
- 数据库历史记录。

这些适合第二阶段，不应该阻塞当前作品集闭环。

## 当前验证命令

```bash
.venv/bin/python -m unittest discover -s tests
.venv/bin/python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations
.venv/bin/python -m py_compile web_app.py
.venv/bin/python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json
```

## 面试中可以怎么定位

这是一个本地运行的求职场景 AI Agent 项目，不是单次 prompt。

它覆盖了：

- 需求定义
- 输入处理
- Agent 编排
- 规则匹配与证据解释
- 结构化输出
- Web UI
- 评测回归
- 真实数据迭代
- 作品集包装
