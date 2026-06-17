# Desktop Pet

This project aims to build a cross-platform desktop pet application for Windows and macOS.

The app should place an interactive pet directly on the user's desktop, keep running in the background through the system tray/menu bar, support mouse interactions, and allow users to DIY the pet's appearance. The first MVP pet is a line-style dog with a lightweight 3D or 3D-like visual feel.

The Windows deliverable should include a runnable desktop application `.exe`, either directly or through an installer `.exe`.

## Current State

The project now has an initial Electron + React + Three.js scaffold. It includes a transparent desktop pet window, a tray/menu bar control surface, local config persistence, an independently managed pet registry with five line-style pets, a Chinese settings window with character selection and live preview, dynamic mouse pass-through for transparent desktop areas, and a lightweight Windows `.exe` package output.

Important project documents:

- `PRD-desktop-pet.md`: Product requirements for the line-style dog MVP.
- `docs/codex/PROJECT_GOAL.md`: Durable project goal and success criteria for Codex agents.
- `docs/codex/AGENT_BACKLOG.md`: Current autonomous task queue.
- `docs/codex/AGENT_HANDOFF.md`: Current state and continuation notes.
- `docs/codex/DECISIONS.md`: Durable product decisions.
- `AGENTS.md`: Repository operating rules for Codex.

## MVP Scope

The MVP should include:

- Windows and macOS desktop app support.
- Transparent, borderless desktop pet window.
- System tray/menu bar background running behavior.
- A first line-style dog pet with 3D or 3D-like presence.
- Mouse hover, click, drag, and petting-style interactions.
- Basic DIY appearance settings.
- Local persistence for pet position and settings.
- Basic controls: show/hide, settings, reset position, and quit.
- Windows `.exe` or installer `.exe` output.

The MVP does not include AI chat, voice, cloud sync, user accounts, app-store publication, imported complex models, full 3D model editing, startup-at-login, full-screen auto-hide, or pet-body click-through.

## Recommended Next Step

Continue from the packaged transparent desktop pet proof of concept and refine runtime behavior:

- Verify the Electron window manually on Windows.
- Confirm mouse hit testing, dragging behavior, tray actions, and settings persistence during manual use.
- Refine the line-style dog states and animation quality after visual feedback.
- Add a real installer `.exe` later if the MVP needs one-file installation instead of the current unpacked app directory.

## Development

Install dependencies:

```powershell
npm.cmd install
```

Run the app in development:

```powershell
npm.cmd run dev
```

Type-check and build the renderer:

```powershell
npm.cmd run build
```

Run the full local verification gate:

```powershell
npm.cmd run verify
```

This runs type checking, production build, preview image capture, critical/high dependency audits, and Windows unpacked packaging. If headless Edge cannot capture the preview because of local GPU/browser issues, the capture script writes a local fallback preview image to `docs/codex/pet-redesign-preview.png` and records the fallback in command output.

Capture only the pet preview image:

```powershell
npm.cmd run capture:pet-preview
```

Build the Windows unpacked desktop app:

```powershell
npm.cmd run package:win
```

This produces `release/win-unpacked/DesktopPetLineDog.exe`. Keep the full `release/win-unpacked` directory together when running or sharing it, because the executable depends on the Electron runtime files beside it.

If the packaged desktop pet is already running, exit it from the tray menu before running `npm.cmd run package:win`; the packaging script checks for `DesktopPetLineDog.exe` before replacing `release/win-unpacked`.

The project uses a local `.npmrc` with an Electron mirror because the default Electron binary download endpoint timed out in this environment.

## Pet Definitions

Pet characters are registered under `src/pets`. The current procedural Three.js line-style pets are `line-dog`, `line-cat`, `line-rabbit`, `line-alpaca`, and `line-cow`. Future pets, including richer 3D or GLB-backed characters, should be added as new `PetDefinition` entries and registered in `src/pets/registry.ts`.

The supported pet ids and default pet id are also listed in `pet-manifest.json`. Update this manifest whenever the registry gains or removes a pet so the renderer, Electron config sanitizer, and packaged app stay aligned.
