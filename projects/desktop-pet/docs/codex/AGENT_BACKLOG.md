# Agent Backlog

This is Codex's working task queue for the current project goal.

## Current Goal

Build a cross-platform desktop pet application for Windows and macOS. The app should show an interactive desktop pet, support mouse interactions, allow DIY appearance settings, keep running through the system tray/menu bar, start with a line-style dog that has a 3D or 3D-like feel, and produce a runnable Windows desktop application `.exe` or installer `.exe`.

## Status

- Current phase: Implementation
- Last updated: 2026-07-14
- Current focus: Continue manual desktop runtime verification and run Windows packaging on a Windows machine after the July review fixes.

## Now

- [x] Fix the error points found in the July project review.
  - Scope: remove the deprecated npm Electron mirror config warning, add a project-local dependency install helper that sets Electron mirror/cache env vars, make preview capture find Chromium browsers across macOS/Windows/Linux and fail clearly when no renderer is available, make Windows packaging fail clearly on non-Windows/incomplete Electron installs, harden settings close-time flush failure handling, and clear drag state on pointer cancellation/lost capture.
  - Verification: `npm run typecheck`, script syntax checks, `npm run build`, `npm audit --audit-level=high`, `node scripts/capture-preview-page.cjs`, `node scripts/verify-package.cjs`, and `npm run verify` pass on macOS. Chrome headless exits with `SIGABRT` in this environment, and the new no-dependency Node fallback generates `docs/codex/pet-redesign-preview.png`. `node scripts/package-win.cjs` now fails cleanly on macOS with an explicit Windows-only packaging message; Windows package/runtime verification still needs a Windows machine.
- [ ] Additively upload this project to GitHub repository `Baixl11/creative-project` under `projects/desktop-pet-line-dog`.
  - Scope: clone the existing remote repository, verify the target subfolder does not already exist, copy this project while honoring `.gitignore` exclusions, avoid generated dependency/build outputs such as `node_modules`, `dist`, `release`, `.npm-cache`, and logs, commit only the additive project folder, and push to `main` over SSH.
  - Verification: clone attempt reached GitHub but failed with `Permission denied (publickey)`; continue after SSH access to `Baixl11/creative-project` is available, then confirm no target overwrite, inspect the staged file list before commit, verify ignored/generated files are absent, and confirm the pushed commit is on `origin/main`.
- [x] Package the project as a Xiaohongshu-style social media post.
  - Scope: created a project-local poster generation script, generated four 1080x1440 PNG post images, and drafted a ready-to-publish Chinese post copy file with title options, body copy, hashtags, pinned comments, and image order.
  - Verification: Ran `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\generate-xhs-social-assets.ps1`, confirmed it regenerates all four PNGs, inspected the generated cover/features/lineup/process images visually, checked output file sizes, validated all script base64 text snippets, and verified `docs/social/xhs-desktop-pet/post-copy.md` reads as UTF-8.
- [x] Fix audit findings from the latest project review.
  - Scope: update PRD/DECISIONS for automatic apply plus Revert, remove save/apply as the settings confirmation model, flush pending debounced settings before the settings window closes, save settings without stale `petBounds`, implement a real pet right-click menu, and add a runtime SVG fallback when WebGL cannot initialize.
  - Verification: Updated PRD/DECISIONS, removed the settings `立即应用`/save-style action, added close-time settings flush through Electron IPC, fixed settings saves to avoid stale `petBounds`, added `pet:show-context-menu`, added WebGL-to-SVG fallback, ran `npm.cmd run typecheck`, ran `npm.cmd run verify`, verified the built settings page shows only `还原`/`重置` with no Save/Cancel/Apply action, and completed a packaged `.exe` smoke test outside the sandbox.
- [x] Fix and optimize the current engineering gaps found in the post-implementation audit.
  - Scope: shared pet manifest, Electron capture hardening, Windows package preflight, consolidated verification script, dependency audit handling, and documentation updates.
  - Verification: `npm.cmd run verify` passes; this includes typecheck, production build, preview capture with local fallback when Edge headless GPU fails, critical/high audit with 0 vulnerabilities, and Windows package rebuild. `release/win-unpacked/resources/app/pet-manifest.json` contains all five supported pet ids. A short packaged `.exe` smoke test started and stopped the app successfully.
- [x] Redesign the cat, rabbit, and alpaca line-style pet shapes from the user's pictographic references and improve the cow shape.
  - Verification: Updated the four procedural Three.js pet definitions, ran `npm.cmd run typecheck`, and generated `docs/codex/pet-redesign-preview.png` with the project renderer.
- [x] Refine the rabbit and cow shapes after user feedback.
  - Verification: Updated `src/pets/lineRabbit.ts` and `src/pets/lineCow.ts`, ran `npm.cmd run typecheck`, and regenerated `docs/codex/pet-redesign-preview.png`.
- [x] Add per-pet desktop action loops.
  - Verification: Added pet action definitions, desktop scheduling, model motion mapping, action bubbles/props, and preview-sheet action labels; ran `npm.cmd run typecheck`, `npm.cmd run capture:pet-preview`, and `npm.cmd run package:win`.
- [x] Fix preview page after action poses made the pet shapes look wrong.
  - Verification: Removed action transforms from `PetPreviewSheet`, restored normal character-pose rendering, fixed Chinese action labels, regenerated `docs/codex/pet-redesign-preview.png`, visually inspected it, and reran `npm.cmd run package:win`.
- [x] Refresh `release/win-unpacked` with the latest rabbit and cow refinements.
  - Verification: `npm.cmd run package:win` passes after adding a running-exe preflight; release output was rebuilt successfully.
- [x] Add a project-local visual preview sheet for the redesigned pets.
  - Verification: Added `?view=pet-preview` rendering through `src/main.tsx` and exported the preview with `npm.cmd run capture:pet-preview`.
- [x] Apply the verification checklist after this pet-design batch.
  - Verification: Recorded review and verification evidence in `docs/codex/AGENT_HANDOFF.md`.
- [x] Update the runnable project build with the redesigned pet shapes.
  - Verification: Ran `npm.cmd run package:win`; `release/win-unpacked/resources/app/dist` now contains the 2026-06-15 rebuilt renderer assets.
- [x] Add cat, rabbit, alpaca, and cow pet definitions in the same line-style visual family as the current dog.
  - Verification: Added `lineCat`, `lineRabbit`, `lineAlpaca`, and `lineCow` definitions plus a shared `linePetFactory`; typecheck and production build pass.
- [x] Localize the settings page interaction text to Chinese.
  - Verification: Browser DOM snapshot of the built settings page shows Chinese headings, controls, status text, options, and action buttons.
- [x] Add a live pet preview in the settings page that follows the selected pet and appearance draft.
  - Verification: Browser verification confirmed the settings preview canvas is present and updates description/active state when switching pets.
- [x] Apply the verification checklist after this development batch.
  - Verification: Recorded review and verification evidence in `docs/codex/AGENT_HANDOFF.md`.
- [x] Verify pet selection updates the settings preview.
  - Verification: Browser clicked all five pet choices; each had one matching button and updated the active selection/description. Desktop pet scene shares the same `PetCanvas` renderer path but still needs manual desktop-window confirmation.
- [x] Refactor the current line dog into a standalone pet definition and introduce a pet registry.
  - Verification: Added `src/pets/types.ts`, `src/pets/registry.ts`, and `src/pets/lineDog.ts`; `src/visuals/PetScene.tsx` now creates the active pet through the registry.
- [x] Persist and resolve the selected pet id separately from appearance settings.
  - Verification: Added `selectedPetId` and `defaultPetId` in `src/types.ts`, sanitized `selectedPetId` in `electron/main.cjs`, and resolved unknown ids through `getPetDefinition`.
- [x] Add a settings entry point for choosing a pet character.
  - Verification: `src/ui/SettingsPanel.tsx` now renders a `Pet Character` picker from registered pet definitions; Browser verification confirmed `Line Dog` / `Line style` appears and action buttons remain visible.
- [ ] Ask the user to visually confirm the transparent desktop pet window appears and behaves correctly in their desktop session.
- [ ] Fix any user-observed runtime or visual issues in the transparent pet window proof of concept.
- [ ] Verify settings auto-apply, reset, revert, and position persistence through the real UI.

## Next

- [ ] Add richer 3D/model-backed pet definitions once the visual direction or model asset is available.
- [ ] Refine line-style dog animation states after user visual feedback.
- [ ] Add an installer `.exe` using a packaging tool if one-file installation becomes required.
- [ ] Add macOS packaging after Windows packaging is stable.
- [ ] Add performance checks for idle CPU, memory, and startup time.

## Later

- [ ] Add visual verification on light, dark, and complex desktop backgrounds.
- [ ] Add V0.2 items only after MVP: click-through toggle, full-screen auto-hide, startup-at-login, extra animations.

## Blocked

- [ ] GitHub upload over SSH.
  - Blocker: `git clone git@github.com:Baixl11/creative-project.git C:\tmp\creative-project-upload` reached GitHub but failed with `Permission denied (publickey)`.
  - Needed from user: Configure a GitHub SSH key with access to `Baixl11/creative-project`, or provide another approved authentication method.
- [ ] Windows package and runtime verification.
  - Blocker: Current environment is macOS; `package:win` intentionally requires a Windows Electron runtime.
  - Needed from user: Run `npm.cmd run install:deps`, `npm.cmd run verify`, and `npm.cmd run package:win` on Windows, then manually test `release/win-unpacked/DesktopPetLineDog.exe`.

## Done

- [x] Added multi-pet line-style selection and Chinese settings preview.
  - Verification: `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run package:win`, and `npm.cmd audit --audit-level=critical` pass. Browser verification of `http://127.0.0.1:4173/?view=settings` confirmed Chinese UI, five pet choices, and live preview selection updates.
  - Notes: Initial packaging was blocked by running `DesktopPetLineDog.exe` processes, then passed after the user exited the app.
- [x] Introduced independently managed pet definitions for future multi-character support.
  - Verification: `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run package:win`, and `npm.cmd audit --audit-level=critical` pass. Browser verification of `http://127.0.0.1:4173/?view=settings` confirmed the new pet picker is visible and not clipped.
  - Notes: The current registry contains only `line-dog`; future 3D/model-backed pets should be added as new `PetDefinition` entries.
- [x] Inspected project instructions and current repository structure.
  - Verification: Read `AGENTS.md`, `docs/codex/*.md`, `PRD-desktop-pet.md`, and listed files with `rg --files`.
  - Notes: The project currently contains documentation only; no app source, package scripts, tests, or build configuration exist yet.
- [x] Created project goal documentation.
  - Verification: `docs/codex/PROJECT_GOAL.md` contains the desktop pet goal and has no template placeholders.
  - Notes: Goal covers Windows/macOS, desktop pet presence, mouse interactions, DIY appearance, tray/menu bar background running, and first line-style dog direction.
- [x] Created and refined the product PRD.
  - Verification: `PRD-desktop-pet.md` defines MVP scope, interaction rules, window behavior, DIY settings, performance targets, out-of-scope items, and resolved MVP decisions.
- [x] Created project README.
  - Verification: `README.md` explains the project goal, current state, MVP scope, and recommended next step.
  - Notes: Setup/run/build commands are intentionally absent until an app stack is approved and scaffolded.
- [x] Recorded durable MVP decisions.
  - Verification: `docs/codex/DECISIONS.md` lists active decisions for pet direction, window behavior, interaction scope, DIY scope, and deferred features.
  - Notes: Decisions mirror the PRD's resolved MVP decisions.
- [x] Decided and scaffolded initial implementation stack.
  - Verification: User approved Electron + React + Three.js; `package.json`, `vite.config.ts`, `tsconfig.json`, Electron files, React files, and Three.js pet scene were created.
  - Notes: `.npmrc` uses an Electron mirror because default Electron binary download timed out.
- [x] Installed dependencies.
  - Verification: `npm.cmd install` completed successfully after configuring project-local cache and Electron mirror.
  - Notes: Initial `concurrently@9` audit issue was fixed by upgrading to `concurrently@10.0.3`.
- [x] Implemented transparent pet window proof of concept.
  - Verification: `electron/main.cjs` creates a transparent, borderless, always-on-top pet window with tray controls and config persistence.
  - Notes: Runtime still needs manual desktop verification.
- [x] Implemented first line-style dog visual prototype.
  - Verification: `src/visuals/PetScene.tsx` renders a Three.js line dog and basic interaction states.
  - Notes: Animation polish and hit testing still need iteration.
- [x] Added initial settings window.
  - Verification: `src/ui/SettingsPanel.tsx` supports color, size, line weight, ear style, tail style, animation intensity, save, cancel, and reset controls.
  - Notes: Settings persistence path is wired through Electron IPC.
- [x] Verified current code checks.
  - Verification: `npm.cmd run typecheck`, `npm.cmd run build`, and `npm.cmd audit --audit-level=critical` pass.
  - Notes: Vite warns that the Three.js renderer chunk is larger than 500 kB.
- [x] Smoke-tested dev server and Electron process startup.
  - Verification: `npm.cmd run dev` started long-running Vite/Electron processes; `Invoke-WebRequest http://127.0.0.1:5173` returned 200; project Electron processes were observed and then cleaned up.
  - Notes: Tool timed out because the dev command is long-running. User still needs to visually confirm the desktop window.
- [x] Reworked pet window dragging to avoid CSS drag-region pointer conflicts.
  - Verification: Added IPC window-position movement and reran `npm.cmd run typecheck` and `npm.cmd run build`.
  - Notes: This should preserve pointer events for click, hover, and petting while still allowing drag movement.
- [x] Fixed DIY ear and tail style switching in the Three.js line dog.
  - Verification: Updated `src/visuals/PetScene.tsx` to create both style variants and toggle visibility; reran `npm.cmd run typecheck`, `npm.cmd run build`, and `npm.cmd audit --audit-level=critical`.
  - Notes: Style changes no longer only hide the original variant.
- [x] Added Windows unpacked `.exe` packaging.
  - Verification: `npm.cmd run package:win` produces `release/win-unpacked/DesktopPetLineDog.exe`; the packaged exe started and stayed running during a short process smoke test.
  - Notes: This is an unpacked app directory, not a one-file installer. The full `release/win-unpacked` directory must stay together.
- [x] Fixed packaged renderer asset loading.
  - Verification: `dist/index.html` now references assets with relative `./assets/...` paths after setting Vite `base: "./"`.
  - Notes: This prevents Electron `loadFile` from failing on absolute `/assets/...` URLs.
- [x] Hardened local config reset and input handling.
  - Verification: `electron/main.cjs` now sanitizes config input and uses replace semantics for reset instead of merging `undefined` fields.
  - Notes: Reset should now truly clear DIY settings and saved position.
- [x] Improved mouse hit testing for transparent desktop areas.
  - Verification: Added IPC-driven `setIgnoreMouseEvents` toggling and reran `npm.cmd run typecheck`, `npm.cmd run package:win`, packaged exe smoke test, and `npm.cmd audit --audit-level=critical`.
  - Notes: The pet view starts in mouse pass-through mode and re-enables interaction near the pet hit area. Manual desktop verification is still needed to judge the feel on the real desktop.
- [x] Updated the first pet visual to match the provided fluffy line dog reference.
  - Verification: Rebuilt the Three.js pet as a front-facing fluffy dog with segmented thick strokes, floppy ears, dot eyes, black nose, smile, and pink tongue; generated `docs/codex/line-dog-preview.png`; reran `npm.cmd run build`, `npm.cmd run package:win`, packaged exe smoke test, and `npm.cmd audit --audit-level=critical`.
  - Notes: Default line color is now dark `#111827` and default line weight is thicker for a marker-like hand-drawn look.
- [x] Fixed settings page changes appearing to have no effect.
  - Verification: Settings controls now auto-apply with a short debounce, settings page waits for config load, the action bar is visible/sticky, and the settings window is taller/resizable. Reran `npm.cmd run build`, generated `docs/codex/settings-preview.png`, verified the IPC save/update path with Electron, reran `npm.cmd run package:win`, packaged exe smoke test, and `npm.cmd audit --audit-level=critical`.
  - Notes: The old UI required clicking `Save`, but the button was clipped in the user's screenshot. The main path no longer depends on that button.
- [x] Added a required post-development verification checklist.
  - Verification: Added `docs/codex/VERIFICATION_CHECKLIST.md` and linked it from `AGENTS.md` as a required quality gate.
  - Notes: Future development batches must record change review, code review, functional verification, interface verification, and impact review in handoff/backlog notes.

## Known Risks

- Transparent, always-on-top desktop windows can behave differently across Windows and macOS.
- Pet mouse hit testing needs care so transparent areas do not block normal desktop use.
- Electron + 3D rendering may exceed performance targets if animations are not throttled.
- Vite currently warns that the initial renderer chunk is larger than 500 kB because Three.js is bundled up front.
- Current Windows output is an unpacked app directory, not a signed installer or one-file executable.
- The project lives inside the parent `creative-project` git repository; unrelated sibling-project changes may appear in `git status` and should be left alone.
- The user prompt included a goal placeholder, so the active goal is taken from `docs/codex/PROJECT_GOAL.md` and the existing PRD.

## Verification Queue

- [x] After scaffolding: run install/build/typecheck commands for the chosen stack.
- [ ] After UI implementation: user visually verifies the pet window appears, can be dragged, and can be closed.
- [ ] After visual update: user confirms the fluffy line dog matches the intended style closely enough.
- [ ] After settings implementation: user verifies settings auto-apply, revert, reset, and corrupted config fallback.
- [x] After packaging: previous Windows `.exe` output was verified locally on Windows.
- [ ] After July fixes: rerun Windows package and desktop runtime verification on a Windows machine.
