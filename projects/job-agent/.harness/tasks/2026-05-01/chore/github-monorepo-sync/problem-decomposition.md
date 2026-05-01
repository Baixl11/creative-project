# 问题拆解

## 用户目标

把当前本地 `Job Agent` 项目同步到 GitHub 仓库，并让远端仓库未来可以继续容纳其他项目。

## 当前状态

- 当前项目目录不是 git 仓库。
- 项目已有 `.gitignore`，会排除 `.env`、`.venv/`、`outputs/` 和 `data/my_*` 等敏感或运行产物。
- 远端仓库地址为 `git@github.com:Baixl11/creative-project.git`。
- 当前项目包含代码、文档、harness 配置、测试、样例数据和作品集页面稿。

## 期望状态

- 远端仓库使用 monorepo 结构，根目录保留为作品集总仓库入口。
- 当前项目放入独立目录，例如 `projects/job-agent/`。
- 根目录提供总 README，用于说明仓库结构和项目索引。
- 不提交 `.env`、虚拟环境、真实个人输入数据和临时输出目录。
- 同步完成后，本地记录远端路径、提交信息和残余风险。

## 非目标

- 本轮不改 Job Agent 业务代码。
- 本轮不接入真实 LLM。
- 本轮不把真实个人 JD、简历和 `.env` 推到 GitHub。
- 本轮不把远端仓库设计成只服务 Job Agent 的单项目仓库。

## 方案选择

选择 monorepo 结构：

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
      ...
```

理由：

- `creative-project` 作为作品集总仓库，未来可继续添加其他项目。
- `projects/job-agent/` 保持当前项目完整性，便于独立运行和阅读。
- 根 README 作为项目索引，不和单个项目 README 混淆。

## 风险与边界

- 需要网络和 SSH 权限访问 GitHub。
- 如果远端仓库已有内容，必须保留现有内容，只新增或更新 `projects/job-agent/` 和必要的根目录索引。
- 当前项目目录不是 git 仓库，因此同步应在临时克隆目录中完成，避免破坏当前工作目录。
- 需要在提交前检查将要提交的文件，确认敏感文件未进入暂存区。

