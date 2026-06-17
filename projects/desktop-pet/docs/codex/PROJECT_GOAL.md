# Project Goal

Use this file to give Codex a durable objective for the project.

## Current Goal

Build a cross-platform desktop pet application that runs on Windows and macOS. The app should place an interactive pet on the user's desktop, allow the user to DIY the pet's desktop appearance, support mouse-based interactions, keep the pet persistently present on the desktop, and run in the background through the system tray/menu bar. The project should ultimately produce a distributable desktop application, with the Windows deliverable including a runnable desktop app `.exe`, either as a direct executable or as an installer that produces a runnable app.

The first product direction is a lightweight, lively desktop pet experience. The pet should preferably have a 3D or 3D-like visual effect, with the first version focusing on a simple line-style dog as the initial pet.

## Success Criteria

Codex should consider the goal complete when all applicable criteria are satisfied:

- The app can run on Windows and macOS.
- The project produces a distributable desktop application build.
- The Windows build produces a runnable desktop application `.exe` or installer `.exe`.
- The pet can appear directly on the desktop through a transparent, borderless desktop window.
- The app can keep running in the background through the system tray/menu bar.
- The desktop pet can persist on the desktop while the app is running.
- Users can interact with the pet through mouse actions such as click, hover, drag, and petting-style movement.
- Users can DIY core appearance settings for the desktop pet, such as color, size, line weight, and simple shape/style options.
- The first pet experience provides a line-style dog with 3D or 3D-like visual presence.
- The app includes basic controls for show/hide, settings, reset position, and quit.
- Tests or verification steps pass.
- Documentation explains how to run, test, and maintain the result.
- Known limitations are recorded.

## Scope

In scope:

- Windows and macOS desktop app behavior.
- Windows `.exe` packaging or installer output.
- Transparent, borderless, desktop-level pet window.
- System tray/menu bar background running behavior.
- Mouse interaction model for the desktop pet.
- DIY appearance settings for the pet.
- Initial line-style dog pet design and animation.
- Local persistence for pet settings and position.
- Basic user-facing controls and documentation.

Out of scope unless the user explicitly asks:

- AI chat or voice conversation.
- Multi-pet ecosystem.
- Complex 3D model editor.
- User-imported complex models.
- Cloud sync or accounts.
- App Store or Mac App Store publication.
- Paid services.
- Production analytics or telemetry.

## Constraints

- Budget or paid services: none for the MVP unless the user explicitly approves.
- External accounts or credentials: none for the MVP unless the user explicitly approves.
- Target platform: desktop app for Windows and macOS.
- Preferred stack: use the existing project stack if one exists; otherwise prefer a practical desktop stack that supports transparent windows, tray/menu bar behavior, and 3D or 3D-like rendering.
- Deadline or milestone: no fixed date currently specified.

## User Approval Required For

Codex must pause and ask before:

- Product direction decisions not answered by this file.
- New paid services.
- New large dependencies or frameworks.
- Destructive data or git operations.
- Production deployment changes.
- Secret or credential handling.

## Starting Prompt

Use this prompt when opening a new Codex thread for the project:

```text
You are now the sustained development agent for this project.

Read AGENTS.md and docs/codex/PROJECT_GOAL.md first. Then inspect the project structure, scripts, tests, documentation, and key source files. Create or update docs/codex/AGENT_BACKLOG.md with a prioritized plan, then begin implementing the highest-value safe task.

Keep working through the backlog. Do not stop after planning. Pause only for destructive operations, external accounts, paid services, production secrets, broad architecture changes, or product decisions that are not specified in the goal.

After each meaningful batch of work, update docs/codex/AGENT_BACKLOG.md and docs/codex/AGENT_HANDOFF.md with progress, verification, blockers, and next steps.
```
