# Profile Selection

## Electron / Vite

Use when the project has Electron main/preload/renderer boundaries.

Default sensors:

- package manager typecheck;
- package manager build;
- Electron boundary guard if feasible;
- screenshot/UI fidelity profile as an active conditional profile for design-reference tasks;
- visual regression as future automation only after the project has a stable screenshot harness.

Key rules:

- renderer must not import Node or Electron directly;
- preload exposes named minimal APIs;
- IPC changes must update architecture docs.
- screenshot tasks must produce `visual-spec.md`, `visual-review.md`, `visual-defects.md`, and final screenshots before human review.

## Go Gin

Use when `go.mod` and Gin server routes are present.

Default sensors:

- `go test ./...`;
- `go vet ./...`;
- `gofmt` check;
- `staticcheck ./...` only if already installed or configured.

Key rules:

- route, middleware, auth, DB, and config boundaries must be explicit;
- migration or schema changes require targeted tests;
- generated files must be excluded from manual edits.

## Python AI Service

Use when the project is Python and includes model calls, prompts, embeddings, agents, or AI APIs.

Default sensors:

- `pytest`;
- `ruff check .`;
- `mypy .` or `pyright` if configured;
- prompt/eval golden cases if present.

Key rules:

- model calls need timeout, retry, cost, and mock boundaries;
- secrets must not enter task files;
- schema validation should be explicit for request/response objects.

## Generic

Use when no specific profile fits.

Default sensors:

- documented build/test commands only;
- no invented guard scripts;
- generic architecture and task tracking.
