from __future__ import annotations

from pathlib import Path

from common import BootstrapError, parse_args, plan_actions, read_plan


def main() -> int:
    args = parse_args("Preview harness bootstrap rendering without writing files.")
    try:
        plan = read_plan(Path(args.plan))
        _, actions = plan_actions(plan, Path(args.target))
    except BootstrapError as error:
        print(f"Preview failed: {error}")
        return 1

    print("Bootstrap preview:")
    for action in actions:
        print(f"- {action.status}: {action.target}")

    conflicts = [action for action in actions if action.status == "conflict"]
    if conflicts:
        print(f"\nConflicts: {len(conflicts)}. Set bootstrap.allow_overwrite=true only after review.")
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
