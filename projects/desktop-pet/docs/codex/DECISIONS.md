# Decisions

Record durable project decisions here. This prevents Codex from re-litigating the same choices in future threads.

## Active Decisions

## 2026-06-11 MVP Pet Direction

Decision:
The first MVP pet is a line-style dog with a 3D or 3D-like visual feel.

Rationale:
The line-style dog is lightweight, visually distinct, and feasible for a first interactive desktop pet. It keeps the MVP focused while leaving room for richer pets later.

Alternatives considered:
- Start with a generic mascot.
- Build a full custom pet editor first.
- Support imported models from the beginning.

Consequences:
- The MVP can focus on desktop behavior and interaction quality instead of asset complexity.
- Future custom pets and model imports remain out of scope until after MVP.

Revisit when:
The MVP proves the desktop interaction model and users ask for broader pet customization.

## 2026-06-11 MVP Window Behavior

Decision:
The MVP uses a transparent, borderless, always-on-top desktop pet window. The pet appears on the desktop, remembers position, and recovers to the main screen if the saved position is no longer visible.

Rationale:
The product goal depends on the pet feeling present on the desktop instead of inside a normal app window.

Alternatives considered:
- Normal app window.
- Wallpaper-like rendering.
- Menu bar only companion.

Consequences:
- Cross-platform window behavior needs careful verification.
- Mouse hit testing must avoid transparent areas blocking desktop use.

Revisit when:
Transparent or always-on-top behavior becomes unreliable on either Windows or macOS.

## 2026-06-11 MVP Interaction Scope

Decision:
The MVP supports mouse hover, click, drag, and petting-style movement. Dragging has the highest interaction priority.

Rationale:
These interactions prove the desktop pet is responsive without introducing complex behavior systems too early.

Alternatives considered:
- Keyboard shortcuts first.
- Voice or AI chat first.
- Complex physics and edge walking first.

Consequences:
- The first implementation should include a small state machine.
- Voice, AI chat, complex physics, and edge walking remain later-version items.

Revisit when:
Users consistently ask for richer behavior after the core mouse interactions work.

## 2026-06-11 MVP DIY Scope

Decision:
The MVP DIY scope includes simple appearance controls such as color, size, line weight, ear style, tail style, animation intensity, and reset defaults.

Rationale:
Simple DIY gives users ownership without requiring a full editor or imported assets.

Alternatives considered:
- No DIY in MVP.
- Full visual editor in MVP.
- Model or image import in MVP.

Consequences:
- Local persistence is required.
- Importing complex assets remains out of scope.

Revisit when:
Users need deeper customization after the first DIY controls are validated.

## 2026-06-16 Settings Apply Model

Decision:
The MVP settings panel uses automatic apply with a short debounce. Changes to pet selection and appearance are written to local config and synced to the desktop pet without requiring a separate save or apply step. The settings panel provides a Revert action that restores the pet and appearance to the state captured when the settings panel opened.

Rationale:
The previous explicit-save model made settings feel broken when the action bar was clipped. Auto-apply gives immediate feedback and keeps the desktop pet, live preview, and persisted config aligned.

Alternatives considered:
- Require users to click Save before writing any settings.
- Keep changes as temporary preview-only drafts until the settings window closes.
- Remove Revert and make every change permanent immediately.

Consequences:
- Closing the settings window does not undo already-applied changes.
- Settings saves must only write pet-selection and appearance fields so they do not overwrite newer pet position data.
- The settings window must flush any pending debounced save before it closes so the last visible edit is not lost.
- Revert remains important as the user-facing undo path for the current settings session.

Revisit when:
Users ask for an explicit Save/Cancel workflow, or settings changes become expensive enough that automatic persistence feels disruptive.

## 2026-06-11 Deferred MVP Features

Decision:
The MVP does not include pet-body click-through, full-screen auto-hide, startup-at-login, AI chat, voice, cloud sync, user accounts, complex 3D model editing, or app-store publication.

Rationale:
These are useful later features, but they add platform complexity or product scope before the core desktop pet experience is proven.

Alternatives considered:
- Include click-through and full-screen handling in MVP.
- Include startup-at-login in MVP.
- Include AI chat as a key differentiator in MVP.

Consequences:
- The first version is easier to ship and verify.
- V0.2 can add click-through, full-screen auto-hide, and startup-at-login after the main app works.

Revisit when:
The MVP desktop pet is stable and users need better non-interference controls.
