# Verification Checklist

Use this checklist after every development change. Treat it as a required quality gate before reporting work as complete.

## Required Review Steps

1. Change review
   - List the files changed.
   - Explain the intended behavior change.
   - Identify the user-facing workflows affected by the change.
   - Identify adjacent code paths that could be affected unintentionally.

2. Code review
   - Check changed code for logic errors, stale state, race conditions, cleanup issues, and config persistence bugs.
   - Check Electron IPC boundaries, preload exposure, and main/renderer synchronization when relevant.
   - Check UI state naming and button behavior against actual behavior.
   - Check that no unrelated user work or generated outputs were reverted.

3. Functional verification
   - Run the narrowest reliable automated checks first.
   - For this project, prefer `npm.cmd run typecheck`, `npm.cmd run build`, `npm.cmd run package:win`, and `npm.cmd audit --audit-level=critical` when the changed area warrants them.
   - For settings and interaction changes, verify the IPC path from settings window to pet window.
   - For packaging changes, verify the Windows unpacked `.exe` exists and can start.

4. Interface verification
   - Capture or inspect the changed UI when practical.
   - Confirm controls are visible, reachable, and named according to what they do.
   - Confirm text does not overlap or get clipped at the target window size.
   - Confirm the changed workflow can be completed from the UI, not just from code.

5. Impact review
   - Re-check affected docs, backlog items, handoff notes, and package scripts.
   - Record known limitations and any manual verification still needed.
   - If a verification step cannot be run, record the reason in `docs/codex/AGENT_HANDOFF.md`.

## Minimum Closeout Format

At the end of each development batch, update `docs/codex/AGENT_HANDOFF.md` with:

- Changed files and behavior.
- Code review summary.
- Functional verification run and result.
- Interface verification run and result.
- Remaining manual checks or known risks.

Also update `docs/codex/AGENT_BACKLOG.md` so completed tasks include their verification evidence.
