# Job Agent Web Demo

这份文档说明如何启动本地 Web UI、如何部署公网网页，以及演示时应该重点讲什么。

## 公网网页入口

如果项目已经同步到 GitHub monorepo，可以用 Streamlit Community Cloud 部署成网页。

部署时填写：

```text
Repository: Baixl11/creative-project
Branch: main
Main file path: projects/job-agent/web_app.py
```

部署完成后，Streamlit 会生成一个 `*.streamlit.app` 链接。这个链接就是作品集里最适合放给面试官点击的入口。

完整部署步骤见：

```text
DEPLOYMENT.md
```

## 启动方式

### 方式 1：双击启动

在 Finder 里双击：

```text
start_web.command
```

它会自动进入项目目录、激活虚拟环境并启动 Web 页面。

如果第一次启动时终端出现 Streamlit 的 Email 提示，不需要填写邮箱，直接按回车跳过即可。

如果 macOS 提示没有权限，可以在终端运行一次：

```bash
chmod +x start_web.command
```

### 方式 2：命令行启动

进入项目目录：

```bash
cd /Users/cyan/个人工作/2026-04-25-ai-ai
```

激活虚拟环境：

```bash
source .venv/bin/activate
```

启动 Web 页面：

```bash
streamlit run web_app.py
```

如果是在 `creative-project` 这个 GitHub monorepo 的根目录启动，命令是：

```bash
streamlit run projects/job-agent/web_app.py
```

启动后浏览器会打开本地页面。通常地址是：

```text
http://localhost:8501
```

如果 8501 被占用，可以指定端口：

```bash
streamlit run web_app.py --server.port 8502
```

## 页面支持的 3 种输入方式

- 使用内置样例：跑项目自带的英文 JD 和简历，适合证明基础流程稳定。
- 使用真实样例：优先跑本地私有中文 JD 和 PDF 简历；如果这些文件没有放在本机，则自动使用公开中文 demo 样例，适合 GitHub 克隆后直接演示。
- 上传自己的文件：上传 JD 和简历，适合让别人现场试用。页面保留两个简洁上传入口，并用中文轻量说明支持格式；中文截图 OCR 默认使用 `chi_sim+eng`，需要本机已安装 `tesseract-lang`。

如果上传中文 JD 截图时报缺少 `chi_sim`，先在终端确认：

```bash
tesseract --list-langs
```

如果列表里没有 `chi_sim`，在 macOS 上安装：

```bash
brew install tesseract-lang
```

## 页面展示什么

页面会展示以下结果：

- 首屏产品说明：读懂岗位、定位证据、生成改写。
- 醒目的匹配分、匹配档位解释、已匹配要求数、待补强要求数。
- JD 关键要求和简历相关经历。
- 每条 JD 要求对应的简历证据。
- 可以参考的简历 bullet 改写，这是最适合作品集截图的区域；复制 icon 已放到文本框外侧，避免遮挡内容。
- 内置英文样例会在页面展示层转成中文，避免演示时中英文混杂。
- 面试前可以准备的问题。
- Markdown 和 JSON 产物下载入口。

## 这一步在 AI Agent 项目里的意义

命令行版本证明项目逻辑能跑通，Web UI 证明项目可以被真实用户理解和试用。

这一步不是重写 Agent，而是在稳定的 Agent 工作流外面加一层产品界面：

```text
用户上传文件
    ↓
Web UI 保存输入
    ↓
调用 JobApplicationAgent
    ↓
展示结构化分析结果
    ↓
下载 Markdown / JSON 产物
```

## 面试时可以这样讲

```text
我先做了命令行版本，保证 Agent 的读取、解析、匹配、报告生成和评测都稳定。
然后我加了一个 Streamlit Web UI，让非技术用户可以上传 JD 和简历，直接看到匹配分、证据句、简历改写建议和面试准备问题。
这个 UI 没有重写核心逻辑，而是复用了已经通过测试的 JobApplicationAgent，所以展示层和业务逻辑是分离的。
```
