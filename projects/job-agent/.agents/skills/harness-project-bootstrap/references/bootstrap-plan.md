# Bootstrap Plan

Bootstrap plan 是 Codex 诊断项目后的结构化执行计划。Python 脚本只读取 plan 并渲染模板，不负责项目分析。

## 推荐路径

```text
.harness/bootstrap-plan.yaml
```

## 脚本入口

```text
python <skill>/scripts/validate_plan.py --plan <target>/.harness/bootstrap-plan.yaml --target <target>
python <skill>/scripts/preview_bootstrap.py --plan <target>/.harness/bootstrap-plan.yaml --target <target>
python <skill>/scripts/render_bootstrap.py --plan <target>/.harness/bootstrap-plan.yaml --target <target>
```

执行顺序必须是 validate -> preview -> render。preview 出现 `conflict` 时，先人工合并或让用户确认覆盖策略。

## 字段

```yaml
project:
  name: "my-project"
  kind: "electron-vite"
  confidence: "high"
  summary: "一句话说明项目"

bootstrap:
  mode: "standard"
  request_skill_name: "my-project-harness-request"
  allow_overwrite: false

git:
  branch_pattern: "harness/<type>/<short-slug>"
  task_path_pattern: ".harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>"
  auto_push: false

paths:
  source:
    - "src/"
  generated:
    - "dist/"
  forbidden_to_edit:
    - "node_modules/"

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

environment:
  runtime:
    package_manager: "pnpm"
    language_runtimes:
      - "Node.js >= 20"
    env_files:
      - ".env"
      - ".env.local"
    notes:
      - "Electron 调试需要可用桌面环境"
  commands:
    - name: "dev"
      command: "pnpm dev"
      category: "dev"
      working_dir: "."
      long_running: true
      purpose: "启动前端或 Electron 开发环境"
      evidence: "package.json scripts.dev"
    - name: "typecheck"
      command: "pnpm exec tsc --noEmit"
      category: "typecheck"
      working_dir: "."
      long_running: false
      purpose: "检查 TypeScript 类型"
      evidence: "package.json scripts 或项目约定"
  frontend:
    kind: "electron-vite"
    primary_entry: "electron"
    dev_server_url: "http://localhost:5173"
    electron_command: "pnpm dev"
    healthcheck:
      type: "url"
      target: "http://localhost:5173"
    viewports:
      - name: "target"
        width: 2048
        height: 1152
        device_scale_factor: 1
        zoom_factor: 1
    fallback_viewports:
      - name: "narrow"
        width: 1366
        height: 768
        device_scale_factor: 1
        zoom_factor: 1
  mcp_playwright:
    required_for_ui: true
    availability: "unknown"
    fallback_policy: "缺少 MCP Playwright、启动方式或测试数据时暂停确认"
  unresolved:
    - "待确认：MCP Playwright 在当前 Codex 环境中是否可用"

sensors:
  native:
    - name: "typecheck"
      command: "pnpm typecheck"
      purpose: "检查类型"
  harness:
    - name: "harness_self_check"
      command: "待生成或人工检查"
      purpose: "检查 harness 结构"

architecture:
  top_level_map:
    - "`src/`：应用源码"
  domain_boundaries:
    - "UI 层不得直接访问系统能力"
  forbidden_rules:
    - "不得修改生成物目录"
  generated_paths:
    - "dist/"

docs:
  detection_evidence:
    - "发现 package.json 和 vite.config.ts"
  assumptions:
    - "待确认：CI 中的正式构建命令"
  skipped_items:
    - "未运行 E2E，当前缺少浏览器环境"
```

## 规则

- Codex 负责生成和修正 plan。
- 脚本负责校验字段、渲染模板、检测冲突、写文件。
- `allow_overwrite: false` 时不得覆盖已有文件。
- `allow_overwrite: true` 只允许在用户明确同意或目标目录为一次性临时输出时使用。
- `workspace.related_projects` 必须来自 README、dev/build 脚本、workspace 配置、CI 或构建配置的证据，不能凭目录名猜测。
- related project 的 `harness_status` 必须通过检查目录下是否存在 `.harness` 得出：`present` 表示独立 harness 项目，默认 `write_policy: ask_before_write`；`absent` 表示当前主 harness 的附属子仓库，默认 `write_policy: allowed_by_default` 和 `branch_policy: same_task_branch`；无法确认时写 `unknown` 并加入 `workspace.unresolved`。
- 如果 dev/build 命令涉及父级或兄弟项目，必须记录到 `workspace.command_graph`；可编辑的附属子仓库需要在 coder 开始写代码前同步创建或切换同名任务分支。
- `environment.commands` 记录运行、调试、构建、测试和交互验证入口；不能把未确认的 URL、Electron 命令、账号、测试数据或 MCP Playwright 可用性写成已确认事实。
- 前端或 Electron 项目应记录 `environment.frontend` 和 `environment.mcp_playwright`；无法确认时写入 `environment.unresolved` 并触发不确定性闸门。
- 不要把密钥、令牌或私有环境变量写入 plan。
