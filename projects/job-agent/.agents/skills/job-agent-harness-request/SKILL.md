---
name: job-agent-harness-request
description: Route formal requirements for job-agent through its harness. Use when Codex should create or resume task context, run planner/coder/verifier/doc_gardener, apply uncertainty gates, runtime or visual verification, git lifecycle, and docs sync.
---

# job-agent Harness Request

Use this skill as the primary entry for formal requirements in this repository.

## Read First

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `.harness/project-profile.yaml`
4. `.harness/environment.yaml`
5. `.harness/workspace-map.yaml`
6. `.harness/invariants.yaml`
7. `.harness/human-gates.yaml`
8. `.harness/current-task.json`
9. `.harness/tasks/index.json`
10. `.harness/tasks/README.md`
11. `references/task-routing.md`
12. `references/task-file-contract.md`
13. `references/stage-checklist.md`
14. `references/git-workflow.md`
15. `references/problem-decomposition.md`
16. `references/research-protocol.md`
17. `references/uncertainty-gates.md`
18. `references/functional-verification.md`
19. `references/runtime-verification.md`
20. `references/interaction-verification.md`
21. `references/task-observability.md`

## Conditional References

- Read `references/visual-task-profile.md` when the requirement includes screenshots, design images, Figma, one-to-one replication, UI fidelity, page implementation, or visual regression.

## Core Rule

- Treat the current Codex session as the orchestrator.
- Keep stages serial unless the user explicitly asks for subagents.
- Route every formal request before creating files; do not ask the user to remember task paths unless routing is ambiguous.
- Write durable context to `.harness/tasks/<YYYY-MM-DD>/<type>/<short-slug>/`.
- Read `.harness/workspace-map.yaml` before choosing commands, edit scope, or sensors when a task involves dev/build/test/lint/package/release or cross-project integration.
- Read `.harness/environment.yaml` before frontend runtime, Electron debug, MCP Playwright, screenshot, or interaction verification decisions.
- For related projects, `.harness` presence is the edit-boundary signal: `harness_status: present` means independent harness and ask before write; `harness_status: absent` means affiliated subrepo and editable within the current task using the same branch name.
- Keep `.harness/current-task.json` and `.harness/tasks/index.json` synchronized on create, resume, status change, and finish.
- Do not start implementation until `problem-decomposition.md` and `acceptance-criteria.md` exist for the task.
- Apply `references/research-protocol.md` during problem decomposition when the requirement, root cause, solution, environment, dependency behavior, or acceptance criteria is unclear.
- Apply `references/uncertainty-gates.md` before every important stage transition; if an important decision cannot be fully confirmed from evidence, pause, set the task to `needs_clarification` or `blocked_on_decision`, and ask the user.
- Apply `references/functional-verification.md` before runtime or MCP Playwright verification when code behavior, core logic, state flow, data conversion, API, IPC, file flow, model call, or integration behavior changes.
- Keep `state.json`, `events.ndjson`, `agents.json`, `artifacts.json`, `validations.json`, and `summary.md` updated for frontend observability.
- Use sensors only for verification, not as workflow drivers.
- Prefer project-native checks from `.harness/project-profile.yaml`.
- Build/typecheck/lint are not sufficient behavior proof. Apply `references/runtime-verification.md` when a task changes user-visible behavior, runtime flow, Electron, API, IPC, database, model calls, or cross-project integration.
- Runtime and MCP Playwright checks are high-level proof. Before them, split feature points and core flows, run project-native tests or small task-scoped scripts, and record results in `validations.json.functional_checks`.
- For frontend or Electron interaction tasks, apply `references/interaction-verification.md`, create `interaction-test-plan.yaml`, and default to MCP Playwright or Playwright automation. If the tool path or testing method is unavailable or unclear, pause and ask the user before substituting manual checks or writing test scripts.
- For visual tasks, screenshot capture is not verification; compare reference and actual screenshots, record defects, repair blocking/major differences, and re-screenshot before review.
- Treat `verified` as machine-checked only; behavior acceptance requires human review unless the user explicitly delegates acceptance.

## Start Or Resume

1. Route the incoming request using `references/task-routing.md`.
2. For “continue previous task”, read `.harness/current-task.json`; for title/slug references, read `.harness/tasks/index.json`.
3. Resume the matched task or create a new `<YYYY-MM-DD>/<type>/<short-slug>` task key.
4. Create task files using `references/task-file-contract.md`.
5. Decompose the problem using `references/problem-decomposition.md`.
6. Apply `references/research-protocol.md` if the problem or solution is unclear; write `research-notes.md` before selecting the implementation approach.
7. Apply `references/uncertainty-gates.md`; do not continue to implementation while high-impact questions are unresolved.
8. Apply `references/functional-verification.md` when behavior or core flow validation is required; create `functional-test-plan.md` before verification.
9. Apply `references/runtime-verification.md` when behavior, runtime, integration, or interaction validation is required; create `runtime-test-plan.md` before verification.
10. For frontend or Electron interaction tasks, apply `references/interaction-verification.md` and create `interaction-test-plan.yaml` before verification.
11. Initialize machine-readable task state using `references/task-observability.md`.
12. Update `.harness/current-task.json` and `.harness/tasks/index.json`.
13. If code changes and the project is a git repo, follow `references/git-workflow.md`.
14. For screenshot/UI fidelity tasks, create the visual artifacts required by `references/visual-task-profile.md` before coding.
15. Mirror the active task summary in `docs/exec-plans/active/<YYYY-MM-DD>/<type>/<short-slug>.md` when active plan docs are used.

## Stages

- `planner`: route the request, create or resume the task package, `problem-decomposition.md`, `acceptance-criteria.md`, optional `research-notes.md`, optional `functional-test-plan.md`, optional `runtime-test-plan.md`, optional `interaction-test-plan.yaml`, plan, constraints, done criteria, sensors, git strategy, related project edit scope, routing index updates, uncertainty gates, and initial observability files; for screenshot/UI fidelity tasks, write `visual-spec.md` and `visual-checklist.md` before implementation.
- `planner`: when commands or requirements involve related projects, classify each as independent harness (`.harness` present, ask before write), affiliated subrepo (`.harness` absent, editable by default), or unknown (clarify before writing).
- `coder`: before implementation, create or switch to `harness/<type>/<short-slug>` in the target repo and every editable affiliated subrepo; then implement the smallest repo-consistent change and commit at safe boundaries.
- `coder`: if workspace-map shows related projects participate in the command graph, inspect their relevant files before editing and do not assume target-only changes are sufficient; if a related project has its own `.harness`, ask before writing; for UI fidelity tasks, prefer SVG/CSS/existing assets over Unicode icon substitutes, implement target viewport plus scaling behavior, and fix any open blocking/major visual defects before unrelated work; update observability files after each work package.
- `verifier`: run real sensors, then functional/core-flow checks, then required runtime/interaction checks, record evidence, update `validations.json`, and pause for clarification if verification command, environment, side effects, tool availability, or acceptance meaning is not fully confirmed.
- `verifier`: if `functional-test-plan.md` is required, execute its feature-point and core-flow checks before MCP Playwright; failed blocking/high checks must return to coder instead of being masked by high-level screenshots.
- `verifier`: when behavior changed, do not stop at build/typecheck/lint. For frontend or Electron interaction tasks, execute `interaction-test-plan.yaml` with MCP Playwright or Playwright when available; capture snapshot、console、network 和 screenshot 证据；如果工具不可用，先让用户确认替代测试路径或是否新增项目原生测试脚本。
- `verifier`: for screenshot/UI fidelity tasks, save initial/final screenshots, record Electron/browser viewport and scale factors, compare reference vs actual by region, write `visual-review.md` and `visual-defects.md`, send blocking/major defects back to coder, and re-screenshot after repairs.
- `doc_gardener`: sync long-lived docs, feedback flywheel, and harness gardening notes only when needed.

## Finish

Summarize whether this was a new task or resumed task, implementation, verification, commits, review status, residual risks, current `state.json` status, and task directory path.
