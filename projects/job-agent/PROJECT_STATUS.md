# Project Status

Last updated: 2026-07-14

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
- 自动化测试：当前 61 个 unittest 通过。
- Harness：已有任务记录、验证命令、项目规则、架构说明和状态追踪。

## 当前确认状态

- Web UI 已完成真实 Chrome 交互验证：上传、生成、Markdown/JSON 下载和 Streamlit rerun 结果保留均通过，console/page/network 错误为 0。
- Web 上传与报告改为单次临时目录，任务结束后清理；下载 JSON 不再暴露服务器绝对路径。
- 解析、改写和匹配已增加证据保守边界，避免联系方式回流、职责升级和弱同义词重复计分。
- 中文 OCR 已确认本机存在 `chi_sim+eng`；真实用户截图质量仍需按具体图片人工验收。
- 项目位于父级 Git monorepo，正式任务使用 `harness/<type>/<slug>` 分支和本地提交。

## 当前主动暂停

- 真实 LLM 接入暂时暂停。
- `.env` 应保持 `USE_MOCK_LLM=true`，保证项目零成本、可稳定演示。
- 后续可恢复 LLM，用于报告总结和简历 bullet 润色，但不阻塞当前作品集交付。

## 后续建议

- 按 `PORTFOLIO_CASE_STUDY.md` 更新截图和演示讲稿。
- 使用真实用户截图继续校验 OCR 清晰度和领域词纠错。
- 需要真实 LLM 时再确认 API key、成本和失败降级验收标准。
- 增加 CI、ruff/mypy 和依赖锁定属于下一阶段工程化工作。

## 总体还差什么

必须补齐：

- 用户对本轮修复结果做最终行为验收。
- 对外展示前刷新作品集截图和演示脚本。

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
.venv/bin/python -m app.main --jd data/demo_jd_cn.txt --resume data/demo_resume_cn.txt --output outputs/demo_cn_report.md --json-output outputs/demo_cn_report.json
.venv/bin/python .agents/skills/harness-project-bootstrap/scripts/validate_plan.py --plan .harness/bootstrap-plan.yaml --target .
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
