# Git Lifecycle

Use only when the target project is a git repository.

## Branch

- Check `git status --short` before editing.
- Create or switch to the task branch before coder starts modifying files, not after implementation.
- Default branch pattern: `harness/<type>/<short-slug>`.
- `type` should match the change: `feature`, `fix`, `refactor`, `docs`, `test`, or `chore`.
- Do not include task id in the branch name.
- Reuse the existing task branch when resuming a task.
- For editable affiliated subrepos without `.harness`, create or switch to the same task branch before editing them.
- Related repos with their own `.harness` are independent harness projects; ask the user before writing to them.

Examples:

- `harness/feature/download-status-card`
- `harness/fix/preload-ipc-boundary`
- `harness/refactor/task-context-flow`

## Commit

Make local commits when a clean review unit is complete and verification passes:

- module or feature closure;
- risk boundary change;
- API, schema, permission, IPC, or config change;
- around 300-500 changed lines;
- docs/tests/implementation form a coherent unit.

Do not commit unrelated user changes. Do not push unless the user explicitly asks.

## Non-Git Projects

If not a git repo, keep working but write the skip reason into the bootstrap report.
