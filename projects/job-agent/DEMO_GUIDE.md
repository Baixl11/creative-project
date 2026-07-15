# Job Agent 演示指南

这份文档用于面试、作品集展示或自己复盘时快速演示项目。

## 演示目标

用 3 到 5 分钟展示这个项目不是一个简单脚本，而是一个完整的本地 AI Agent 工作流：

```text
上传或指定 JD 和简历
    ↓
Agent 自动读取和解析
    ↓
提取岗位要求和简历亮点
    ↓
计算匹配度并定位证据
    ↓
生成中文报告、简历 bullet 改写和 JSON 结果
    ↓
用评测集验证结果稳定性
    ↓
用 Web UI 展示成可试用产品
```

## 演示前准备

进入项目目录：

```bash
cd /Users/cyan/个人工作/2026-04-25-ai-ai
```

激活虚拟环境：

```bash
source .venv/bin/activate
```

确认测试通过：

```bash
python -m unittest discover -s tests
```

预期结果：

```text
Ran 61 tests ... OK
```

## 演示 1：运行内置样例

先用项目自带的英文样例跑一遍，证明基础流程稳定。

```bash
python -m app.main --jd data/sample_jd.txt --resume data/sample_resume.txt --output outputs/report.md --json-output outputs/report.json
```

查看报告：

```bash
cat outputs/report.md
```

可以讲：

```text
这是项目的基础样例。Agent 会读取 JD 和简历，提取岗位要求和简历亮点，再生成匹配分、证据句、简历 bullet 改写建议和面试问题。
```

## 演示 2：运行中文数据

公开演示优先使用仓库自带的中文 JD 和简历，确保克隆后可复现。

```bash
python -m app.main --jd data/demo_jd_cn.txt --resume data/demo_resume_cn.txt --output outputs/demo_cn_report.md --json-output outputs/demo_cn_report.json
```

如果本地另有未提交的私有 `data/my_*` 文件，也可以运行 PDF 简历路径：

```bash
python -m app.main --jd data/my_jd.txt --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json
```

查看中文报告：

```bash
cat outputs/demo_cn_report.md
```

重点展示这几部分：

```text
## 先看结论
## 我从 JD 里抓到的关键要求
## 我从简历里抓到的相关经历
## 一条条看匹配情况
## 可以直接改写到简历里的 bullet
```

可以讲：

```text
这里用的是可公开复现的中文 JD 和简历。项目最开始对中文匹配不准，样例分数只有 18/100。后来补了中文能力词组、中文 JD 解析、断行合并和联系方式过滤；当前公开样例为 94/100，每条岗位要求都能看到对应证据句。
```

如果要演示 JD 截图输入，先确认中文 OCR 语言包：

```bash
tesseract --list-langs
```

列表里需要有 `chi_sim`。如果没有，macOS 安装：

```bash
brew install tesseract-lang
```

然后可以把 JD 截图作为输入：

```bash
python -m app.main --jd data/my_jd.png --resume data/my_resume.pdf --output outputs/my_report.md --json-output outputs/my_report.json
```

## 演示 3：展示结构化 JSON

Markdown 是给人看的，JSON 是给程序继续处理的。

```bash
cat outputs/my_report.json
```

可以讲：

```text
除了报告，项目还会导出结构化 JSON。后面如果接 Web UI、数据库、评测系统或多岗位批量分析，可以直接复用这份结构化结果。
```

重点字段：

```text
workflow_result
match_report
requirement_evidence
best_resume_highlight
match_strength
resume_suggestions
rewrite_bullet
```

## 演示 4：运行评测集

评测集用于证明项目不是只对某一次输入有效。

```bash
python -m app.evaluate --manifest data/eval_cases/manifest.json --output-dir outputs/evaluations
```

查看评测总结：

```bash
cat outputs/evaluations/summary.md
```

预期结果：

```text
high_match: 88, PASS
medium_match: 60, PASS
low_match: 16, PASS
```

可以讲：

```text
我给项目加了高匹配、中匹配、低匹配三组样例。每次修改匹配规则后都会跑评测，确认分数档位没有被破坏。这是 AI 项目里非常重要的回归验证思路。
```

## 演示 5：启动 Web UI

用 Web 页面展示项目已经从命令行工具变成可试用 demo。

```bash
streamlit run web_app.py
```

打开浏览器里的本地地址，通常是：

```text
http://localhost:8501
```

可以讲：

```text
这个 Web UI 没有重写核心逻辑，而是复用了已经通过测试的 JobApplicationAgent。页面负责上传文件和展示结果，核心 Agent 负责读取、解析、匹配、改写和导出。
```

## 建议演示顺序

推荐顺序：

```text
1. 先讲项目目标
2. 跑真实数据
3. 打开中文报告
4. 解释证据句和缺口建议
5. 展示 JSON
6. 跑评测集
7. 打开 Web UI
8. 讲下一步规划
```

不要一开始就讲代码细节。先让对方看到用户价值，再讲技术实现。

## 可以重点讲的技术点

- 输入层支持 txt、Markdown、PDF、图片 OCR 入口和 macOS 文本包。
- Agent 编排层把读取、解析、匹配、建议、输出串成完整流程。
- 匹配层使用中英文能力词组，输出可解释证据句。
- 简历改写层会根据匹配证据重组动作、场景、方法和结果，生成可参考的中文 bullet。
- 输出层同时生成 Markdown 和 JSON。
- Web UI 用 Streamlit 承接上传、分析和结果展示。
- 评测层用高、中、低样例检查规则变化是否合理。
- 默认 mock 模式可本地运行，成本为 0。

## 当前限制也要主动说明

建议主动讲，不要等面试官问：

```text
当前版本主要是规则增强型 Agent，真实 LLM 润色暂时暂停，默认 mock 模式保证零成本可演示。
PDF 文本提取已经做了基础断行合并，但复杂排版 PDF 仍需要继续优化。
中文截图 OCR 已补齐本机 `chi_sim` 语言包，并增加了 OCR 空格清洗；截图清晰度仍会影响识别质量。
简历 bullet 改写目前是规则生成，已经能和当前依据做区分；后续可以接入大模型让表达更自然。
```

主动说明限制会显得你对项目边界很清楚。

## 30 秒介绍版本

```text
这是一个本地运行的求职匹配 Agent。用户给一份 JD 和简历，Agent 会自动读取文件、提取岗位要求、提取简历亮点、计算匹配度，并生成中文报告。报告里不仅有分数，还有每条岗位要求对应的简历证据和可参考的简历 bullet 改写。我还做了 Web UI、JSON 输出和评测集，用来支持作品集展示和持续迭代。
```

## 2 分钟介绍版本

```text
我做这个项目是为了完整练习 AI Agent 项目流程。它的场景是求职和职业转型，因为这个场景真实、容易解释，也和我自己的需求有关。

项目的输入是岗位 JD 和简历，支持 txt、PDF 和图片 OCR 入口。Agent 会先做输入校验，再解析 JD，提取岗位要求；然后解析简历，提取相关经历；接着通过中英文能力词组计算匹配度，并给每条岗位要求定位最相关的简历证据；最后生成一份包含简历 bullet 改写建议的中文 Markdown 报告和一份 JSON 结构化结果，也可以通过 Streamlit Web UI 展示。

我还做了高、中、低三组评测样例。每次改匹配规则都会跑评测，保证结果不会只对某一次输入有效。真实测试中，我遇到了 macOS 文本包、PDF 断句、联系方式误入报告、OCR 中文空格、中文匹配不准等问题，并做了对应修复。当前版本已经可以本地 mock 运行，也有本地 Web UI；后续计划是完成 Web UI 人工验收、继续增强复杂 PDF 清洗，并在 API 配置稳定后接入大模型优化改写质量。
```
