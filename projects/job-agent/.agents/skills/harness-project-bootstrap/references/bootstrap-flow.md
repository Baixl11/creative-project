# Bootstrap Flow

## 1. Discovery

Inspect the project before writing files:

- root files: `AGENTS.md`, `README*`, package manifests, lockfiles, CI configs;
- source layout: app entrypoints, server entrypoints, tests, generated dirs;
- commands: build, test, lint, typecheck, format, dev server;
- environment: run/debug commands, frontend or Electron entry points, viewport defaults, test data boundaries, MCP Playwright availability;
- workspace and command graph: parent/sibling projects referenced by README, dev/build scripts, workspace config, CI, local package paths, or build config;
- git state: repo presence, current branch, dirty files;
- risk boundaries: auth, IPC, DB migrations, filesystem, network, model calls, permissions.

## 2. Profile

Choose the closest profile:

- Electron/Vite desktop app;
- Go Gin API service;
- Python AI service;
- generic project.

If profile, package manager, runtime, dev/debug entry, frontend URL, Electron launch command, verification command, MCP Playwright availability, or environment confidence is not fully supported by evidence, ask a targeted question before generating.

If dev/build commands involve other directories or projects, analyze those projects before choosing native sensors. Do not treat the target folder as the full system unless command evidence proves it.

## 3. Mode

Choose bootstrap mode:

- Minimal for small demos, personal projects, or unclear verification.
- Standard for most projects with git and at least one native sensor.
- Strict for production, CI, releases, auth, data, or high-risk systems.

Do not generate strict-mode guardrails for a project that cannot maintain them.

## 4. User Questions

Ask when a wrong assumption would create bad rules or when an important choice cannot be fully confirmed from evidence:

- What is the authoritative verification command?
- Should Codex create local commits by default?
- Which directories are generated or forbidden to edit?

For initialization, requirement analysis, problem decomposition, environment configuration, verification, data/security/dependency, git, and visual acceptance decisions, do not proceed by guessing. Pause and ask before writing rules that depend on the answer.

## 5. Bootstrap Plan

Before generating many files, write `.harness/bootstrap-plan.yaml`.

The plan is the boundary between analysis and deterministic rendering:

- Codex owns project discovery, profile choice, assumptions, and sensor selection;
- scripts own field validation, conflict detection, template mapping, and file writing;
- the plan stays in the target project as a bootstrap audit artifact.

Use `assets/templates/bootstrap-plan.yaml.template` as the shape reference, or create equivalent JSON.

## 6. Scripted Generation

Prefer the deterministic render scripts when bootstrapping a new project:

```text
python <skill>/scripts/validate_plan.py --plan <target>/.harness/bootstrap-plan.yaml --target <target>
python <skill>/scripts/preview_bootstrap.py --plan <target>/.harness/bootstrap-plan.yaml --target <target>
python <skill>/scripts/render_bootstrap.py --plan <target>/.harness/bootstrap-plan.yaml --target <target>
```

If preview reports conflicts, do not force overwrite unless the user explicitly accepts the replacement. Patch or merge existing files instead.

## 7. Generated Layers

Generate the harness in layers:

- root map: `AGENTS.md`, `ARCHITECTURE.md`;
- task system: `.harness/tasks/`, task contract, stage checklist;
- task routing: `.harness/current-task.json`, `.harness/tasks/index.json`, and a project request skill reference for new/resume decision rules;
- problem decomposition: project request skill reference that requires `problem-decomposition.md` and `acceptance-criteria.md` before coding;
- uncertainty gates: project request skill reference that pauses on high-impact unknowns and records clarification decisions;
- functional verification: project request skill reference that requires `functional-test-plan.md` and `validations.json.functional_checks` before runtime or MCP Playwright checks when behavior or core flow changes;
- runtime verification: project request skill reference that requires `runtime-test-plan.md` when behavior changes and prevents build-only completion;
- task observability: project request skill reference that requires `state.json`, `events.ndjson`, `agents.json`, `artifacts.json`, `validations.json`, and `summary.md`;
- sensors: project-native commands in `.harness/project-profile.yaml`;
- environment map: `.harness/environment.yaml` that records run/debug entries, frontend/Electron launch details, viewport defaults, test data boundaries, and MCP Playwright availability;
- workspace map: `.harness/workspace-map.yaml` that records related projects and dev/build command graph;
- workspace edit policy: related projects with `.harness` are independent harness projects and require user approval before writes; related projects without `.harness` are affiliated subrepos editable by default in the same task and use the same branch name;
- request skill: `.agents/skills/<project>-harness-request/`;
- docs: operating model, quality, reliability, security, command map, feedback flywheel, gardening, bootstrap report.
- visual profile: project request skill reference for screenshot, design-image, and one-to-one UI tasks.

## 8. Validation

Run only safe checks:

- structure validation if generated;
- static checks available locally;
- existing project tests when they do not need secrets or external services.

Record skipped checks with reasons.

For behavior-changing tasks, generated rules must require layered verification beyond build/typecheck/lint: first feature-point and core-flow checks using project-native tests or task-scoped temporary scripts, then runtime or interaction verification. Frontend and Electron projects should create structured `interaction-test-plan.yaml` scenarios and default to MCP Playwright or Playwright checks; if that path is unavailable, the generated skill must pause and ask the user to confirm the test method or script-writing approach.

For screenshot/UI fidelity tasks, validation must include a visual-review protocol in the generated request skill. Do not treat build success as visual acceptance.

## 9. Explanation

Before finishing, generate `docs/design-docs/harness-bootstrap-report.md`.

The report must explain:

- what files were generated or merged;
- what each artifact group is for;
- which assumptions were made;
- which commands were not run and why;
- how the user should submit the next requirement.
