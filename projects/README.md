# Projects

这个目录用于放置多个彼此独立的项目。

## 当前项目

- `job-agent/`：求职与职业转型助手 Agent，本地 Python AI Agent 项目，包含 CLI、Streamlit Web UI、Mock 模式、匹配评分、证据句、简历 bullet 改写、评估集和作品集文档。
- `desktop-pet/`：桌面宠物应用，Electron + React + Three.js 项目，包含透明宠物窗口、系统托盘控制、五个线稿宠物角色、中文设置页、预览图兜底生成和 Windows 打包校验。
- `redbook-monitoring/`：小红书创作者账号监控平台，本地 Express + Playwright + SQLite 项目，包含多账号授权、定时采集、笔记监控、趋势分析、采集日志、安全脱敏、数据库迁移和 UI smoke 测试。

## 新项目放置规则

未来新增项目时，建议使用：

```text
projects/<project-slug>/
```

每个项目目录内部保留自己的 `README.md`、源码、测试、文档、隐私边界和运行说明。
