from __future__ import annotations

from pathlib import Path

from common import BootstrapError, parse_args, plan_actions, read_plan, render_action


def main() -> int:
    args = parse_args("Render harness bootstrap files into the target project.")
    try:
        plan = read_plan(Path(args.plan))
        variables, actions = plan_actions(plan, Path(args.target))
    except BootstrapError as error:
        print(f"Render failed: {error}")
        return 1

    conflicts = [action for action in actions if action.status == "conflict"]
    if conflicts:
        print("Render stopped because target files already exist:")
        for action in conflicts:
            print(f"- {action.target}")
        print("Set bootstrap.allow_overwrite=true only after review.")
        return 2

    for action in actions:
        content = render_action(action, variables)
        action.target.parent.mkdir(parents=True, exist_ok=True)
        action.target.write_text(content, encoding="utf-8")
        print(f"{action.status}: {action.target}")

    print(f"Rendered files: {len(actions)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
