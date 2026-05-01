# Workspace Discovery

初始化 harness 时不能只看目标项目目录。Codex 必须从目标项目的入口命令反推真实参与开发、调试和构建的项目集合。

## 必读证据

- `README*`、`docs/` 中的启动、调试、构建和发布说明。
- `package.json`、`pnpm-workspace.yaml`、`turbo.json`、`nx.json`、`lerna.json`、`rush.json`、`yarn.lock`、`pnpm-lock.yaml`。
- `vite.config.*`、`electron-builder.*`、`tsconfig*.json`、`project.json`、`Makefile`、`Taskfile.yml`、`justfile`。
- `.github/workflows/`、`.gitlab-ci.yml`、Dockerfile、compose 配置。
- dev/build/test 脚本中出现的 `cd ../`、`--dir ../`、`workspace:*`、`file:../`、`../<project>`、本地包路径和构建前置命令。

## 分析规则

- 优先分析 `dev`、`build`、`typecheck`、`test`、`lint`、`package`、`release` 相关命令。
- 如果命令会进入父级或兄弟目录，必须读取对应项目的 README、package/build 配置和关键脚本。
- 如果目标项目依赖本地包、共享 UI、Electron shell、后端服务、模型服务或生成器项目，必须把它们记录为 related project。
- 如果多个项目共同参与一次启动或构建，必须记录 command graph，而不是只记录目标项目自身命令。
- related project 的写入边界以目录下是否存在 `.harness` 为判断依据：存在 `.harness` 时，视为独立 harness 项目，默认只读且写入必须由用户确认；没有 `.harness` 时，视为当前主 harness 的附属子仓库，默认允许在同一任务内协同编辑。
- 附属子仓库如果是 git 仓库，必须使用与主仓库相同的任务分支 `harness/<type>/<short-slug>`；coder 开始写代码前要先创建或切换分支。
- 如果无法确认 related project 是否存在 `.harness`，触发 `uncertainty-gates.md`，不得猜测写入权限。
- 如果相关项目路径不存在、不可访问或是否参与构建无法确认，触发 `uncertainty-gates.md`。

## 输出要求

把结果写入 bootstrap plan 的 `workspace` 字段，并渲染到 `.harness/workspace-map.yaml`：

```yaml
workspace:
  root: ".."
  target_project: "."
  related_projects:
    - name: "shared-ui"
      path: "../shared-ui"
      role: "pnpm dev/build 前置依赖"
      evidence: "package.json scripts.dev 调用 pnpm --dir ../shared-ui build"
      harness_status: "absent"
      write_policy: "allowed_by_default"
      branch_policy: "same_task_branch"
      commands:
        - "pnpm --dir ../shared-ui build"
  command_graph:
    - command: "pnpm dev"
      evidence: "package.json scripts.dev"
      touches:
        - "."
        - "../shared-ui"
  unresolved:
    - "待确认：未知 related project 是否存在 .harness"
```

## 任务期使用

生成后的项目级 request skill 必须在以下情况读取 `.harness/workspace-map.yaml`：

- 需求涉及 dev/build/test/lint/package/release 命令。
- 修改会影响共享包、跨项目 API、Electron 主进程/渲染进程、后端服务、模型服务或生成器。
- 验证失败来自 related project。
- 用户要求“整体跑通”“联调”“构建通过”“启动成功”。

如果任务需要修改 related project，先按 `.harness/workspace-map.yaml` 中的 `harness_status` 和 `write_policy` 判断：`absent/allowed_by_default` 可直接纳入本任务；`present/ask_before_write` 必须先询问用户；`unknown` 必须澄清后再写入。
