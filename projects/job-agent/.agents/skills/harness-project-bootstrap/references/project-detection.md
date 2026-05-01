# Project Detection

## Signals

- `package.json`, `pnpm-lock.yaml`, `vite.config.*`: Node frontend or Electron.
- `electron/`, `main.ts`, `preload.ts`, `BrowserWindow`: Electron boundaries.
- `go.mod`, `cmd/`, `internal/`, `gin-gonic/gin`: Go service.
- `pyproject.toml`, `requirements.txt`, `uv.lock`, `app/`, `src/`: Python service.
- `.github/workflows/`, `Makefile`, `Taskfile.yml`: canonical commands.
- `Dockerfile`, `compose.yaml`: runtime and external dependencies.
- `README*`, `docs/`, `package.json scripts`, CI, workspace config, and build config: authoritative dev/build command graph.
- frontend dev URLs, Electron launch scripts, viewport assumptions, test data notes, and MCP Playwright availability: environment evidence for `.harness/environment.yaml`.
- `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `workspace:*`, `file:../`, `--dir ../`, `cd ../`: multi-project or sibling-project coupling.

## Confidence

Use:

- `high`: manifest, source layout, and commands agree.
- `medium`: stack is clear but commands or boundaries need confirmation.
- `low`: multiple stacks or no canonical command exists.

Downgrade confidence when dev/build commands reference parent or sibling projects that have not been analyzed.

## Output

Record detection in `.harness/project-profile.yaml`:

```yaml
project:
  name: "{{PROJECT_NAME}}"
  kind: "{{PROJECT_KIND}}"
  confidence: "medium"
```

Also record workspace coupling in `.harness/workspace-map.yaml` when any command or dependency crosses the target project boundary.

Record run/debug and frontend verification evidence in `.harness/environment.yaml`. If the entry URL, Electron launch command, test data, credentials, or MCP Playwright availability cannot be proven, write the uncertainty instead of inventing a default.
