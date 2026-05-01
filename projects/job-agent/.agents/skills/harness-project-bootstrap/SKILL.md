---
name: harness-project-bootstrap
description: Bootstrap harness engineering for an existing software project. Use when Codex should analyze a repository, identify its stack and verification commands, ask for missing high-impact environment decisions, generate project-specific AGENTS/ARCHITECTURE/.harness/docs files, create a project request skill, and leave a validated skill-driven harness without imposing a fixed language or script pipeline.
---

# Harness Project Bootstrap

Use this skill to turn an existing project into a harness-engineered project.

## Core Principle

- Diagnose before generating files.
- Generate a project-specific request skill for future requirements.
- Keep the user entry conversational; helper scripts are optional sensors, never the main workflow.
- Use deterministic render scripts after diagnosis; scripts render templates from a bootstrap plan, but never replace project analysis.
- During project initialization, analyze the surrounding workspace and command graph, not only the target folder, when README, dev/build scripts, workspace config, CI, or build config reference sibling or parent projects.
- Generated workspace rules must treat related projects with their own `.harness` as independent harness projects that require user approval before writes, and related projects without `.harness` as affiliated subrepos editable by default under the main harness task.
- Generated git rules must create or switch the target task branch before coder starts editing, and use the same branch name in editable affiliated subrepos.
- Generated project skills must route follow-up requirements through current-task and task-index files before deciding whether to create a new task.
- Generated project skills must require problem decomposition before coding for formal tasks.
- Generated project skills must require research during problem decomposition when the requirement, root cause, solution, environment, dependency behavior, or acceptance criteria is unclear.
- Generated project skills must pause for user confirmation when important initialization, requirement, decomposition, environment, verification, data, security, or git decisions cannot be proven from repository evidence.
- Generated project skills must maintain machine-readable observability files so frontends can display task status without parsing free-form Markdown.
- Generated project skills must require runtime or interaction verification when behavior changes; build/typecheck/lint alone are not acceptable behavior proof.
- Generated project skills must require layered functional verification before runtime or MCP Playwright checks: split feature points, test core logic/flows with native tests or small temporary scripts, then run higher-level verification.
- Generated harness files must include `.harness/environment.yaml` as the machine-readable source for run, debug, frontend entry, viewport, test data, and MCP Playwright availability.
- Generated frontend task rules must require structured `interaction-test-plan.yaml` scenarios before MCP Playwright verification, and must treat missing interaction evidence as a blocking verification failure.
- Generated Electron task rules must default to MCP Playwright or Playwright for interaction verification, and must pause for user confirmation when that tool path is unavailable or unclear.
- Generated project skills must include a screenshot/UI fidelity profile so visual tasks are verified by reference comparison, self-repair rechecks, and scaling checks, not only by build success or screenshot capture.
- Prefer project-native verification commands over cross-language bootstrap scripts.
- Do not overwrite existing rules blindly; merge or create a migration note when files already exist.

## Read References

Read only what is needed:

- `references/bootstrap-flow.md` for the end-to-end workflow.
- `references/project-detection.md` for repository analysis signals.
- `references/workspace-discovery.md` when README, dev/build scripts, workspace config, or CI reference sibling projects or parent directories.
- `references/profile-selection.md` when choosing Electron, Go Gin, Python AI, or generic profiles.
- `references/bootstrap-config.md` when the user wants YAML-driven customization.
- `references/bootstrap-plan.md` before using `scripts/validate_plan.py`, `scripts/preview_bootstrap.py`, or `scripts/render_bootstrap.py`.
- `references/bootstrap-modes.md` before choosing how much harness to generate.
- `references/sensor-design.md` before adding validation commands or guard scripts.
- `references/harness-self-check.md` before adding harness structure validation.
- `references/git-lifecycle.md` before adding branch and commit rules.
- `references/review-and-merge.md` when the target project uses PRs or CI.
- `references/harness-gardening.md` before adding feedback flywheel or maintenance docs.
- `references/research-protocol.md` before adding research requirements to formal task planning.
- `references/runtime-verification.md` before adding build/runtime/interaction verification requirements.
- `assets/templates/functional-verification.md.template` before adding layered feature/core-flow verification gates.
- `assets/templates/interaction-verification.md.template` before adding frontend/Electron MCP Playwright gates.
- `references/output-contract.md` before writing files.
- `references/generated-artifacts-guide.md` before writing the bootstrap report or explaining generated files.

## Workflow

1. Inspect the target project root plus workspace evidence: README, package/build config, dev/build scripts, CI, workspace config, and any referenced parent/sibling projects.
2. Classify the project profile and record confidence.
3. Choose bootstrap mode: minimal, standard, or strict.
4. Apply the uncertainty gate: if a high-impact choice cannot be determined from project evidence with full confidence, pause and ask the user before generating or changing rules.
5. Write `.harness/bootstrap-plan.yaml` from the discovered facts and `references/bootstrap-plan.md`.
6. Run `scripts/validate_plan.py --plan <plan> --target <project-root>`.
7. Run `scripts/preview_bootstrap.py --plan <plan> --target <project-root>` and resolve conflicts before writing.
8. Run `scripts/render_bootstrap.py --plan <plan> --target <project-root>` when preview has no unsafe conflicts.
9. Merge manually instead of overwriting when the target already has meaningful harness files.
10. Run available non-destructive validation commands.
11. Update the bootstrap report with assumptions, generated files, artifact explanations, skipped items, and next steps.

## Deterministic Scripts

- `scripts/validate_plan.py`: validates the JSON/YAML bootstrap plan and template mapping.
- `scripts/preview_bootstrap.py`: lists create/overwrite/conflict actions without writing files.
- `scripts/render_bootstrap.py`: renders templates into the target project and stops on conflicts unless `bootstrap.allow_overwrite` is true.
- Scripts do not infer stack, choose sensors, create branches, commit, push, or run project tests.

## Required Outputs

At minimum, bootstrap should leave:

- `AGENTS.md`
- `ARCHITECTURE.md`
- `.harness/bootstrap-plan.yaml`
- `.harness/bootstrap-config.yaml`
- `.harness/environment.yaml`
- `.harness/workspace-map.yaml`
- `.agents/skills/<project>-harness-request/SKILL.md`
- `.agents/skills/<project>-harness-request/references/task-file-contract.md`
- `.agents/skills/<project>-harness-request/references/stage-checklist.md`
- `.agents/skills/<project>-harness-request/references/git-workflow.md`
- `.agents/skills/<project>-harness-request/references/task-routing.md`
- `.agents/skills/<project>-harness-request/references/problem-decomposition.md`
- `.agents/skills/<project>-harness-request/references/research-protocol.md`
- `.agents/skills/<project>-harness-request/references/uncertainty-gates.md`
- `.agents/skills/<project>-harness-request/references/functional-verification.md`
- `.agents/skills/<project>-harness-request/references/runtime-verification.md`
- `.agents/skills/<project>-harness-request/references/interaction-verification.md`
- `.agents/skills/<project>-harness-request/references/task-observability.md`
- `.agents/skills/<project>-harness-request/references/visual-task-profile.md`
- `.harness/project-profile.yaml`
- `.harness/manifest.json`
- `.harness/current-task.json`
- `.harness/invariants.yaml`
- `.harness/human-gates.yaml`
- `.harness/tasks/index.json`
- `.harness/tasks/README.md`
- `docs/design-docs/harness-operating-model.md`
- `docs/design-docs/harness-bootstrap-report.md`
- `docs/generated/COMMANDS.md`
- `docs/generated/FEEDBACK_FLYWHEEL.md`
- `docs/HARNESS_GARDENING.md`
- `docs/QUALITY_SCORE.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`

## Interaction Rules

- If a required command is unclear, ask the user instead of inventing it.
- If dev/build commands invoke sibling or parent projects, analyze those projects read-only and record the command graph before choosing sensors or edit boundaries.
- If an important decision cannot be proven from repository evidence, pause and ask; do not continue by turning it into an unchecked assumption.
- If the project is not a git repo, skip branch and commit operations but still write the git lifecycle rule.
- If tests require network, secrets, external services, or destructive state, ask before running them.
- If existing files conflict with generated files, preserve existing content and patch in harness sections.

## Finish

Return a concise summary of:

- detected profile and confidence,
- files created or merged,
- verification commands executed,
- assumptions and skipped items,
- how the user should submit the next requirement.
