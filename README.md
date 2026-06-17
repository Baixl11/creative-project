# Creative Project

这个仓库用于集中存放我的个人创意项目、AI 项目和作品集案例。

为了方便后续继续增加项目，仓库采用 monorepo 结构：每个项目都放在 `projects/` 下面的独立目录中，互不混淆。

## 项目索引

| 项目 | 目录 | 简介 |
| --- | --- | --- |
| Job Agent / 求职与职业转型助手 Agent | `projects/job-agent/` | 本地运行的求职场景 AI Agent，可读取 JD 和简历，生成匹配分析、证据句、简历 bullet 改写和面试准备建议。 |
| Desktop Pet / 桌面宠物 | `projects/desktop-pet/` | Electron + React + Three.js 桌面宠物应用，提供透明桌面宠物窗口、托盘控制、角色切换、设置面板和 Windows 打包流程。 |

## 目录结构

```text
creative-project/
  README.md
  projects/
    job-agent/
      README.md
      app/
      data/
      docs/
      tests/
      web_app.py
    desktop-pet/
      README.md
      electron/
      src/
      docs/
      scripts/
      package.json
```

## 当前项目亮点

- `projects/job-agent/`：完整 Python AI Agent 项目，包含 CLI、Streamlit Web UI、PDF/OCR 输入、中文匹配、评测集和自动化测试。
- `projects/job-agent/PORTFOLIO_CASE_STUDY.md`：作品集页面稿。
- `projects/job-agent/docs/portfolio/job_agent_case_study.pdf`：项目整体介绍 PDF。
- Streamlit Cloud 网页入口配置：`projects/job-agent/web_app.py`。
- `projects/desktop-pet/`：Electron + React + Three.js 桌面宠物项目，包含透明桌面宠物窗口、托盘控制、五个线稿宠物角色、中文设置面板和本地配置持久化。
- `projects/desktop-pet/PRD-desktop-pet.md`：桌面宠物 MVP 产品需求。
- `projects/desktop-pet/docs/codex/`：项目目标、决策记录、验证清单和交接文档。
- `projects/desktop-pet/docs/social/xhs-desktop-pet/`：小红书项目展示素材。

## Web 部署

如果要把 Job Agent 部署成即点即用网页，在 Streamlit Community Cloud 中填写：

```text
Repository: Baixl11/creative-project
Branch: main
Main file path: projects/job-agent/web_app.py
```

部署细节见 `projects/job-agent/DEPLOYMENT.md`。

## 隐私与安全

仓库不提交 `.env`、虚拟环境、真实个人 JD/简历、运行输出和系统缓存文件。真实测试数据只保留在本地。
