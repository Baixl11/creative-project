# 问题拆解

## 用户目标

继续推进项目，同时在真实 LLM 暂停的情况下保证其他交付步骤不受影响。

## 当前状态

- CLI、Markdown/JSON 输出、PDF 输入、图片 OCR、中文匹配、Web UI、评测集和 harness 已经存在。
- `.env` 当前保持 `USE_MOCK_LLM=true`，主流程可零成本运行。
- 部分长期文档仍有过时表述，例如 README 的下一步升级、Portfolio 中中文 OCR 状态、Quality Score 的待评估项。

## 期望状态

- 有一个清晰的项目状态页，说明当前完成度、未闭环项和接下来几天要做什么。
- 作品集文档不再描述已经完成的能力为“待做”。
- 质量评分从“待评估”变成可解释的当前评分。

## 非目标

- 本轮不接入真实 LLM。
- 本轮不新增产品功能。
- 本轮不初始化 git 仓库。

## 硬约束

- 不泄露 API key 或私人简历/JD 内容。
- 不把 mock 模式说成真实 LLM 模式。
- 文档必须如实说明残余风险。

## 问题分类

主要类型：`docs`

次要类型：`quality`

## 已读取证据

- `README.md`：推荐升级列表含“add a simple web UI”，但 Web UI 已实现。
- `PORTFOLIO.md`：当前能力里仍写“中文截图 OCR 预留 OCR_LANG 配置”，但中文 OCR 已通过 smoke。
- `docs/QUALITY_SCORE.md`：仍为待评估。
- `.harness/tasks/index.json`：OCR 和复制按钮任务均待人工验收。

## 首选方案

新增 `PROJECT_STATUS.md` 作为当前项目状态总览，并同步 README、Portfolio、Demo Guide 和 Quality Score。

## 工作包拆分

| 工作包 | 目标 | 预计文件 | 依赖 | 验证 |
| --- | --- | --- | --- | --- |
| 状态页 | 汇总完成度、剩余事项、接下来几天安排 | `PROJECT_STATUS.md` | 无 | 人工检查 |
| 文档同步 | 修正 README/PORTFOLIO/DEMO_GUIDE 过时内容 | `README.md`, `PORTFOLIO.md`, `DEMO_GUIDE.md` | 状态页 | 文本检查 |
| 质量评分 | 写当前工程质量评分和缺口 | `docs/QUALITY_SCORE.md` | 状态页 | 文本检查 |
| 验证 | 保证 docs 改动后项目仍通过基础命令 | 无 | 文档同步 | unittest/compile |

## 风险与降级

- 如果后续恢复真实 LLM，需要再次更新项目状态页。
- 如果用户真实截图 OCR 表现不稳定，需要把 OCR 从“通过 smoke”降级为“受质量影响较大”。
