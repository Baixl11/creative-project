from __future__ import annotations

from pathlib import Path

from common import BootstrapError, parse_args, plan_actions, read_plan


def main() -> int:
    args = parse_args("Validate a harness bootstrap plan.")
    try:
        plan = read_plan(Path(args.plan))
        _, actions = plan_actions(plan, Path(args.target))
    except BootstrapError as error:
        print(f"Plan validation failed: {error}")
        return 1

    print("Plan is valid.")
    print(f"Templates mapped: {len(actions)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
