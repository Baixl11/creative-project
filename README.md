# Creative Project

这个仓库用于集中存放个人创意项目、AI 项目和作品集案例。当前采用 monorepo 结构：每个项目都放在 `projects/` 下独立维护，彼此保留自己的 README、源码、测试、文档和运行说明。

## 项目索引

| 项目 | 目录 | 当前状态 |
| --- | --- | --- |
| Job Agent / 求职与职业转型助手 Agent | `projects/job-agent/` | 本地 Python AI Agent 项目，提供 CLI、Streamlit Web UI、Mock 模式、JD/简历匹配分析、证据句提取、简历 bullet 改写、面试问题生成、评估集和部署说明。 |
| Desktop Pet / 桌面宠物 | `projects/desktop-pet/` | Electron + React + Three.js 桌面宠物 MVP，包含透明桌面宠物窗口、托盘控制、五个线稿宠物角色、中文设置页、本地配置持久化、预览图生成兜底和 Windows 打包校验脚本。 |
| Redbook Monitoring / 小红书账号监控平台 | `projects/redbook-monitoring/` | 本地 Express + Playwright + SQLite 创作者数据看板，支持多账号配置、登录授权、定时/手动采集、笔记监控、趋势分析、采集任务追踪、安全响应头、错误脱敏、数据库迁移和 UI smoke 测试。 |

## 目录结构

```text
creative-project/
  README.md
  projects/
    README.md
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
      scripts/
      docs/
      pet-manifest.json
      package.json
    redbook-monitoring/
      README.md
      assets/
      docs/
      scripts/
      src/
      tests/
      index.html
      notes.html
      trends.html
      tasks.html
      settings.html
      package.json
```

## 当前项目亮点

### Job Agent

- 支持读取文本、Markdown、PDF、图片和 macOS 文本包等输入。
- 生成 Markdown 报告和结构化 JSON 结果，便于后续评估、UI 展示和调试。
- 内置高/中/低匹配度评估样例，用于检查评分和证据提取是否稳定。
- 提供 Streamlit Web UI，可在本地运行，也可按 `projects/job-agent/DEPLOYMENT.md` 部署到 Streamlit Community Cloud。
- 作品集材料集中在 `PORTFOLIO.md`、`PORTFOLIO_CASE_STUDY.md`、`DEMO_GUIDE.md` 和 `WEB_DEMO.md`。

### Desktop Pet

- 基于 Electron 提供透明、无边框桌面窗口，并通过托盘菜单控制显示、设置、重置和退出。
- 使用 React + Three.js 实现线稿宠物展示，目前注册了 `line-dog`、`line-cat`、`line-rabbit`、`line-alpaca` 和 `line-cow`。
- 中文设置窗口支持角色切换、预览和本地配置持久化。
- `npm run verify` 会执行类型检查、生产构建、预览图生成、依赖审计和平台可用的打包检查。
- 预览图生成支持浏览器捕获和本地兜底渲染，输出到 `docs/codex/pet-redesign-preview.png`。

### Redbook Monitoring

- 本地 Web 看板包含总览、笔记监控、趋势分析、采集任务和账号设置五个页面。
- 使用 Playwright 完成人工登录授权，并把授权 session 保存在本地 `data/xhs-auth/`。
- 使用 SQLite 存储账号、笔记、日粒度指标、采集日志和调度配置。
- 支持每天、每周、每月的定时采集，也支持页面手动触发采集。
- 服务默认只监听本机地址，设置 CSP、`nosniff`、Frame、Referrer 和 Permissions Policy 等安全响应头。
- 采集日志和前端错误会脱敏本地路径、浏览器启动参数和多行运行细节。
- 账号配置横跨 SQLite 与 `.env` 时带有补偿回滚；`.env` 写入使用同目录临时文件原子替换并保持 `0600` 权限。

## 常用命令

### Job Agent

```bash
cd projects/job-agent
python3 -m unittest discover -s tests
python3 -m app.main --jd data/demo_jd_cn.txt --resume data/demo_resume_cn.txt --output outputs/demo_cn_report.md --json-output outputs/demo_cn_report.json
streamlit run web_app.py
```

### Desktop Pet

```bash
cd projects/desktop-pet
npm run install:deps
npm run dev
npm run verify
```

Windows 打包入口：

```powershell
npm.cmd run package:win
```

### Redbook Monitoring

```bash
cd projects/redbook-monitoring
npm install
npm start
npm run check
npm test
npm run test:consistency
npm run test:background-collection
npm run test:ui
```

本地看板默认地址：

```text
http://127.0.0.1:4173
```

## Web 部署

当前明确记录的 Web 部署路径是 Job Agent 的 Streamlit Web UI。在 Streamlit Community Cloud 中填写：

```text
Repository: Baixl11/creative-project
Branch: main
Main file path: projects/job-agent/web_app.py
```

部署细节见 `projects/job-agent/DEPLOYMENT.md`。

`redbook-monitoring` 目前依赖本地 SQLite、Playwright 登录态和本地浏览器采集流程，更适合作为本地运行 Demo；若要部署成公网服务，需要先重新设计认证、数据存储、浏览器采集和定时任务架构。

## 隐私与安全

仓库不应提交以下内容：

- `.env`、访问令牌、账号密码、cookie、授权 session。
- SQLite 数据库、Playwright 浏览器 profile、真实运行数据。
- Python 虚拟环境、Node `node_modules/`、构建缓存和系统缓存。
- 真实个人 JD、简历、账号私有样本和本地输出。

各项目 `.gitignore` 会排除常见本地运行文件。提交前仍应通过 `git status`、`git diff --check` 和必要的密钥扫描确认变更范围。

## 协作状态

当前仓库主要服务于个人作品集和 AI/创意项目积累。新增项目时建议继续使用：

```text
projects/<project-slug>/
```

每个项目应至少包含自己的 README、运行命令、隐私边界和验证方式。
