# Sensor Design

Sensors are deterministic checks that give feedback to Codex.

## Rules

- Prefer existing project commands.
- Add custom scripts only when a project boundary is fragile and cannot be checked with existing tools.
- Keep custom scripts small, local, and language-native when possible.
- Do not make scripts the user-facing workflow.
- Temporary task scripts may be used for functional checks, but they must record input, output, command, cleanup policy, and whether they should be promoted into project-native tests.

## Good Sensors

- TypeScript: `pnpm typecheck`, `pnpm build`.
- Go: `go test ./...`, `go vet ./...`, gofmt check.
- Python: `pytest`, `ruff check .`, `mypy .`, configured eval tests.
- Electron: renderer import guard, preload API surface guard.

## Bad Sensors

- Commands that mutate production data.
- Tests that need undisclosed credentials.
- Long-running integration tests without user approval.
- Cross-language validators that duplicate native tooling.

## Recording

Every sensor should include:

- `name`;
- `command`;
- `purpose`;
- `when_to_run`;
- known limitations.
- for temporary functional scripts, `cleanup_or_promotion_policy`.
