# Bootstrap Config

If the user wants persistent customization, create `.harness/bootstrap-config.yaml`.

`bootstrap-config.yaml` is long-lived user preference. `.harness/bootstrap-plan.yaml` is the concrete one-time rendering input produced after repository discovery.

Suggested fields:

```yaml
project:
  name: "my-project"
  kind: "go-gin-api"

harness:
  request_skill_name: "my-project-harness-request"
  branch_pattern: "harness/<type>/<short-slug>"
  task_path_pattern: ".harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>"
  default_local_commit: true
  auto_push: false
  runtime_verification:
    enabled: true
    build_only_is_insufficient_for_behavior: true
    electron_default_tool: "mcp_playwright_or_playwright"
    fallback_policy: "缺少工具或测试方法时暂停确认"

workspace:
  scan_parent: true
  scan_roots:
    - "."
    - ".."
  related_project_write_policy: "harnessed_repo_ask_affiliated_repo_allow"
  edit_boundary_signal: ".harness"
  same_task_branch_for_affiliated_repos: true
  related_projects:
    - name: "shared-ui"
      path: "../shared-ui"
      role: "dev/build 前置依赖"
      harness_status: "absent"
      write_policy: "allowed_by_default"
      branch_policy: "same_task_branch"

environment:
  runtime:
    package_manager: "pnpm"
    language_runtimes:
      - "Node.js >= 20"
    env_files:
      - ".env"
      - ".env.local"
  commands:
    - name: "dev"
      command: "pnpm dev"
      category: "dev"
      working_dir: "."
      long_running: true
      purpose: "启动本地开发环境"
  frontend:
    kind: "electron-vite"
    primary_entry: "electron"
    dev_server_url: "http://localhost:5173"
    electron_command: "pnpm dev"
    viewports:
      - name: "target"
        width: 2048
        height: 1152
        device_scale_factor: 1
        zoom_factor: 1
  mcp_playwright:
    required_for_ui: true
    availability: "unknown"
    fallback_policy: "缺少工具或测试方法时暂停确认"

paths:
  source:
    - "src/"
  generated:
    - "dist/"
    - "coverage/"
  forbidden_to_edit:
    - "vendor/"

sensors:
  native:
    - name: "test"
      command: "go test ./..."
    - name: "vet"
      command: "go vet ./..."

human_gates:
  uncertainty_gate:
    enabled: true
    max_questions: 3
    pause_on_high_impact_unknowns: true
  require_approval_for:
    - "database migration"
    - "new production dependency"
    - "secret or credential handling"
```

Rules:

- Treat config as user intent, but verify paths and commands exist.
- If config conflicts with project evidence, record the conflict and ask before choosing.
- If an important config value cannot be fully confirmed from evidence or user input, pause and ask instead of inventing a default.
- Do not mark frontend URL, Electron command, test data, credentials, or MCP Playwright availability as confirmed unless repository evidence or the user proves it.
- Do not put secrets or credentials in config.
