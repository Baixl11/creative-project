# Output Contract

## Root Files

Generate or merge:

- `AGENTS.md`: short project entry map and critical rules.
- `ARCHITECTURE.md`: domains, packages, boundaries, generated areas.

## Harness Files

Generate:

- `.harness/bootstrap-plan.yaml`;
- `.harness/bootstrap-config.yaml`;
- `.harness/environment.yaml`;
- `.harness/workspace-map.yaml`;
- `.harness/project-profile.yaml`;
- `.harness/manifest.json`;
- `.harness/current-task.json`;
- `.harness/invariants.yaml`;
- `.harness/human-gates.yaml`;
- `.harness/tasks/index.json`;
- `.harness/tasks/README.md`.

## Skill Files

Generate:

- `.agents/skills/<project>-harness-request/SKILL.md`;
- `.agents/skills/<project>-harness-request/agents/openai.yaml`;
- `.agents/skills/<project>-harness-request/references/task-file-contract.md`;
- `.agents/skills/<project>-harness-request/references/stage-checklist.md`;
- `.agents/skills/<project>-harness-request/references/git-workflow.md`;
- `.agents/skills/<project>-harness-request/references/task-routing.md`;
- `.agents/skills/<project>-harness-request/references/problem-decomposition.md`;
- `.agents/skills/<project>-harness-request/references/research-protocol.md`;
- `.agents/skills/<project>-harness-request/references/uncertainty-gates.md`;
- `.agents/skills/<project>-harness-request/references/functional-verification.md`;
- `.agents/skills/<project>-harness-request/references/runtime-verification.md`;
- `.agents/skills/<project>-harness-request/references/interaction-verification.md`;
- `.agents/skills/<project>-harness-request/references/task-observability.md`;
- `.agents/skills/<project>-harness-request/references/visual-task-profile.md`.

Skill frontmatter requirements:

- `description` must stay under 1024 characters.
- Put workflow details in the Markdown body and references, not in frontmatter.
- Bootstrap validation must fail before render if a generated `SKILL.md` description exceeds the limit.

## Docs

Generate:

- `docs/design-docs/harness-operating-model.md`;
- `docs/design-docs/harness-bootstrap-report.md`;
- `docs/generated/COMMANDS.md`;
- `docs/generated/FEEDBACK_FLYWHEEL.md`;
- `docs/HARNESS_GARDENING.md`;
- `docs/REVIEW_AND_MERGE.md` when the project uses PR/merge workflow;
- `docs/QUALITY_SCORE.md`;
- `docs/RELIABILITY.md`;
- `docs/SECURITY.md`.

## Bootstrap Report

Create `docs/design-docs/harness-bootstrap-report.md` with:

- detected profile and confidence;
- assumptions;
- generated or merged files;
- explanation of each generated artifact group;
- selected sensors;
- workspace command graph and related projects;
- selected bootstrap mode;
- skipped checks and reasons;
- questions deferred to humans.

## Scripted Rendering Contract

When using the bundled Python scripts:

- `.harness/bootstrap-plan.yaml` is authored by Codex after repository discovery.
- `validate_plan.py` must pass before preview or render.
- `preview_bootstrap.py` must show no unresolved `conflict` actions before render.
- `render_bootstrap.py` writes deterministic files only; it does not run tests, create branches, commit, push, or infer project structure.
- Existing files with meaningful content must be merged manually instead of overwritten by default.

## Workspace Discovery Contract

Generated harness files must preserve multi-project context discovered during initialization.

- Bootstrap must inspect README, dev/build/test/lint/package/release scripts, workspace config, CI, and build config before selecting sensors.
- If commands reference parent or sibling projects, those projects must be analyzed read-only and recorded in `.harness/workspace-map.yaml`.
- `.harness/workspace-map.yaml` must include workspace root, target project, related projects, command graph, and unresolved cross-project decisions.
- Generated project request skills must read `.harness/workspace-map.yaml` before tasks that involve commands, builds, integration, shared packages, or related projects.
- Cross-project write policy is derived from `.harness` presence in the related project: related repos with `.harness` are independent harness projects and require user confirmation before writing; related repos without `.harness` are affiliated subrepos under the current main harness and are editable by default for the same task.
- Editable affiliated subrepos that are git repositories must use the same `harness/<type>/<short-slug>` task branch, created or switched before coder starts modifying files.

## Environment Contract

Generated harness files must include a machine-readable environment map.

- `.harness/environment.yaml` must record runtime assumptions, run/debug/build/test commands, frontend or Electron entry points, viewport and scaling defaults, test data boundaries, MCP Playwright availability, and unresolved environment questions.
- Initialization must not invent missing dev URLs, Electron launch commands, credentials, test data, or MCP Playwright availability. If evidence is missing, record it under `unresolved` and trigger the uncertainty gate before relying on it.
- Frontend, Electron, screenshot, visual, runtime, and interaction tasks must read `.harness/environment.yaml` before choosing verification steps.
- Project command changes must sync `.harness/environment.yaml`, `.harness/project-profile.yaml`, `.harness/workspace-map.yaml` when cross-project command graph changes, and `docs/generated/COMMANDS.md`.

## Task Routing Contract

Generated project request skills must route follow-up requirements before creating new tasks.

- Every project must maintain `.harness/current-task.json` and `.harness/tasks/index.json`.
- “继续上一个任务”“刚才那个”“验收反馈”等输入 should resume the matched existing task when possible.
- Title、slug、branch、task_key、keywords matching should use `.harness/tasks/index.json`.
- If there is exactly one candidate, resume it; if candidates are ambiguous, ask one confirmation question.
- New tasks that extend old context must record `parent_task`、`related_tasks`、`route_reason`.
- Creating, resuming, failing verification, entering human review, accepting, or cancelling a task must update both routing files.

## Visual Task Contract

Generated project request skills must include a screenshot/UI fidelity profile.

- Screenshot, Figma, design-image, one-to-one replication, and visual-fidelity tasks must create `visual-spec.md`, `visual-checklist.md`, `visual-review.md`, `visual-defects.md`, and `snapshots/`.
- Build success or screenshot capture alone must not be treated as visual acceptance.
- Visual tasks must compare reference and actual screenshots by region, record differences, and update `visual-defects.md`.
- Open `blocking` or `major` visual defects must be repaired and rechecked with a new screenshot before the task can enter `ready_for_human_review`.
- Electron visual tasks must record viewport/window size, deviceScaleFactor, zoomFactor, system scaling assumptions, and at least one scaling or narrow-window verification path.
- Open `blocking` or `major` visual defects must send the task back to coding instead of `ready_for_human_review`.
- Unicode icon substitutions are not acceptable for high-fidelity UI replication unless the reference uses text glyphs.

## Runtime Verification Contract

Generated project request skills must require runtime or interaction verification when behavior changes.

- Build、typecheck、lint only prove static or packaging correctness; they must not be treated as behavior proof.
- Runtime and MCP Playwright checks must be preceded by feature-point and core-flow verification when code behavior changes.
- Tasks that change core logic, state flow, data transformation, API, IPC, file flow, model calls, or integration behavior must create `functional-test-plan.md`.
- `functional-test-plan.md` must split feature points by risk, preferred test method, test data, and pass criteria, using project-native tests first and task-scoped temporary scripts only when appropriate.
- `validations.json` must include `functional_checks` for lower-level functional evidence before `runtime_checks` or `interaction_checks` are accepted as final proof.
- Tasks that change UI, Electron, API, IPC, database, model calls, file system behavior, external command behavior, or cross-project integration must create `runtime-test-plan.md`.
- Frontend and Electron interaction tasks must also create `interaction-test-plan.yaml` with executable scenarios, target elements, expected observable results, viewport settings, and evidence paths.
- Electron interaction tasks default to MCP Playwright or Playwright verification for app startup, target page reachability, key controls, observable state changes, console errors, and required IPC/file flows.
- MCP Playwright validation must perform real navigation, snapshot, interaction, waiting, console/network checks, and screenshot capture. Screenshot-only validation is not accepted as interaction proof.
- If MCP Playwright, Playwright, launch commands, test data, or debug methods are unavailable or unclear, the task must pause and ask the user before using manual checks or adding project-native test scripts.
- `validations.json` must separate `commands`, `functional_checks`, `runtime_checks`, `interaction_checks`, `visual_checks`, and `manual_checks`.
- Tasks with required runtime/interaction verification cannot enter `ready_for_human_review` until checks pass or the user confirms an explicit fallback with residual risk recorded.

## Problem Decomposition Contract

Generated project request skills must require problem decomposition before coding.

- Every formal task must create `problem-decomposition.md` and `acceptance-criteria.md` before implementation.
- `problem-decomposition.md` must cover user goal, current state, expected state, non-goals, constraints, uncertainty, evidence, solution options, selected approach, work breakdown, and risks.
- If the requirement, root cause, solution, environment, dependency behavior, or acceptance criteria is unclear, the task must create `research-notes.md` before selecting the implementation approach.
- `acceptance-criteria.md` must split machine verification, behavior verification, and human acceptance.
- `exec-plan.md` must be derived from problem decomposition, not replace it.
- If critical uncertainty remains, the task state must be `needs_clarification` or `blocked_on_decision` instead of `coding`.

## Research Contract

Generated project request skills must research unclear problems before implementation.

- Research starts from current project evidence: source, configs, README, tests, CI, workspace map, previous task files, and command graph.
- External tools may be used when local evidence is insufficient, prioritizing official docs, source code, standards, release notes, issues, and high-quality community practice.
- External solutions must be evaluated against current architecture, dependency versions, runtime environment, workspace coupling, and available validation commands.
- `research-notes.md` must record local evidence, external sources, candidate approaches, chosen approach, rejected approaches, risks, and remaining questions.
- If research cannot resolve a high-impact choice, use `uncertainty-gates.md` before coding.

## Uncertainty Gate Contract

Generated project request skills must pause on high-impact unknowns instead of guessing.

- Important initialization, requirement, decomposition, environment, verification, data, security, dependency, git, and visual acceptance decisions must be fully supported by evidence or user confirmation.
- If evidence is insufficient, task status must become `needs_clarification` or `blocked_on_decision`.
- Clarification blockers must be written to `state.json.blockers`、`summary.md`、`handoff.md` and `events.ndjson`.
- User answers must be recorded in `decision-log.md`、`problem-decomposition.md` or `harness-bootstrap-report.md` before continuing.
- Critical unknowns must not be hidden in `assumptions` while execution continues.

## Task Observability Contract

Generated project request skills must require machine-readable task state for frontend and tool visibility.

- Every formal task must maintain `state.json`, `events.ndjson`, `agents.json`, `artifacts.json`, `validations.json`, and `summary.md`.
- `state.json` is the current task snapshot and must use explicit status, current stage, progress, blockers, next action, and timestamps.
- `events.ndjson` is append-only and records public stage, validation, blocker, handoff, and commit events.
- `agents.json` tracks planner、coder、verifier、doc_gardener public status even when execution is serial.
- `artifacts.json` and `validations.json` are the frontend-readable indexes for task files and checks.
- Observability files must not contain Codex internal reasoning; they contain only public facts, decisions, commands, results, and blockers.
