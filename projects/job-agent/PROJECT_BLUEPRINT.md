# AI Agent 项目蓝图

## 项目名称

求职与职业转型助手 Agent

## 项目定位

这是一个本地运行的 AI Agent 项目，目标是帮助用户完成求职与职业转型过程中的一系列自动化任务，例如：

- 解析岗位 JD
- 提取岗位要求
- 分析简历匹配度
- 生成定制化简历建议
- 生成面试问题与回答提纲
- 输出结构化结果到本地文件

这个项目适合用来熟悉一个完整 AI 项目的工作流程：

- 需求定义
- 产品设计
- 技术选型
- Prompt 设计
- Tool 设计
- 多步骤 Agent 编排
- 结果评测
- 调试与优化
- 文档沉淀
- 本地运行与演示

## 为什么选这个题目

这个题目同时满足你的几个目标：

- 适合作为作品集：场景真实，容易讲清楚业务价值
- 适合转 AI：覆盖 Agent、LLM、Prompt、工具调用、评测
- 适合找工作：和你的真实求职过程直接相关
- 适合两周完成：能做出完整 MVP，不会过于庞大
- 适合低成本：可用本地规则 + 单模型 API，前期费用可控

## MVP 范围

第一版只做一个最小可用闭环：

输入：

- 一份岗位 JD 文本
- 一份用户简历文本

Agent 自动执行：

1. 提取岗位核心要求
2. 提取简历中的相关经历
3. 计算岗位匹配分析
4. 生成简历优化建议
5. 生成面试问题清单
6. 生成一份本地 Markdown 报告

输出：

- `outputs/report.md`

## 暂不做

为了保证两周内完成，以下内容先不做：

- 自动投递简历
- 浏览器 RPA
- 多用户系统
- 复杂前端
- 数据库持久化
- 长期记忆
- 多 Agent 协作网络

## 推荐技术栈

- 语言：Python
- 环境管理：`venv`
- Web 框架：先不强制上 Web，优先做 CLI 版本
- LLM 调用：OpenAI 兼容接口或其他低成本模型 API
- Agent 编排：第一版自己写简单编排逻辑，不强依赖 LangChain
- 配置管理：`.env`
- 数据格式：Markdown + JSON
- 测试：`pytest`

## 为什么先做 CLI

对零基础来说，CLI 版本更容易跑通完整闭环，可以把精力集中在：

- Agent 思路
- Prompt 设计
- 工具调用
- 输出质量
- 项目结构

等第一版跑通之后，再加一个简单 Web 界面会更稳。

## 建议目录结构

```text
job-agent/
  app/
    __init__.py
    main.py
    config.py
    models.py
    prompts/
      extractor.txt
      matcher.txt
      interview.txt
      report.txt
    services/
      llm_service.py
      jd_parser.py
      resume_parser.py
      match_engine.py
      report_generator.py
    agents/
      job_application_agent.py
    utils/
      file_io.py
      text_cleaner.py
  data/
    sample_jd.txt
    sample_resume.txt
  outputs/
  tests/
    test_match_engine.py
  .env.example
  requirements.txt
  README.md
```

## 核心模块说明

### 1. 输入层

负责读取 JD 和简历文本。

你会学到：

- 本地文件读取
- 文本预处理
- 输入校验

### 2. Agent 编排层

负责把整个任务拆成多个步骤并按顺序执行。

你会学到：

- 什么是 Agent
- Agent 和普通脚本的区别
- 任务拆解与状态传递

### 3. LLM 能力层

负责调用模型完成提取、分析、生成。

你会学到：

- Prompt 设计
- 结构化输出
- 失败重试
- 成本控制

### 4. 工具层

第一版工具很简单：

- 读文件
- 写报告
- 文本清洗

你会学到：

- Tool 的定义方式
- 如何让 Agent 使用工具完成任务

### 5. 输出层

把分析结果写成结构清晰的 Markdown 报告。

你会学到：

- 如何让 AI 输出可交付结果
- 如何做结果格式控制

### 6. 评测层

评估 Agent 的结果是不是靠谱。

你会学到：

- 主观评测
- 样例回归测试
- Prompt 调优方法

## 两周开发路线

### 第 1-2 天：需求与方案

- 明确项目目标
- 画出工作流
- 定义 MVP
- 搭好目录结构

### 第 3-4 天：输入与基础模块

- 读取 JD 与简历
- 完成文本清洗
- 定义数据结构

### 第 5-7 天：LLM 与 Agent 主流程

- 接入模型 API
- 写提取 Prompt
- 写匹配 Prompt
- 串起主流程

### 第 8-9 天：报告输出

- 生成结构化 Markdown 报告
- 优化输出稳定性

### 第 10-11 天：评测与修正

- 用 3 到 5 组样例测试
- 修 Prompt
- 补测试

### 第 12-13 天：项目包装

- 写 README
- 补运行说明
- 准备作品集说明

### 第 14 天：演示与复盘

- 本地演示完整流程
- 总结你学会了什么
- 提炼成简历项目描述

## 作品集亮点写法

项目完成后，你可以把它包装成：

“基于 Python 构建本地运行的求职场景 AI Agent，支持岗位解析、简历匹配、面试问题生成与报告输出，完整覆盖需求设计、Prompt 工程、Agent 编排、评测优化与项目交付流程。”

## 成本控制建议

- 第一阶段只接一个模型
- 限制输入长度
- 做本地样例调试
- 优先调 Prompt，再增加复杂框架
- 先不用向量数据库

## 我们下一步要做什么

下一步直接开始搭建第一版项目骨架：

1. 创建目录结构
2. 创建 `requirements.txt`
3. 创建 `.env.example`
4. 创建样例 JD 和样例简历
5. 写一个最小可运行主程序

## 当前默认假设

- 项目名使用 `job-agent`
- 第一版是命令行版本
- 第一版输出 Markdown 报告
- 第一版以单 Agent 串行流程为主
- 第一版支持本地文本文件输入
