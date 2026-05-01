from __future__ import annotations

import argparse
import sys
from pathlib import Path

from app.config import Settings
from app.errors import InputValidationError
from app.evaluation import run_evaluation_suite


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the Job Agent evaluation suite.")
    parser.add_argument("--manifest", type=Path, default=Path("data/eval_cases/manifest.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("outputs/evaluations"))
    parser.add_argument("--env-file", type=Path, default=Path(".env"))
    return parser


def main() -> None:
    args = build_parser().parse_args()
    settings = Settings.load(args.env_file)

    try:
        summary = run_evaluation_suite(settings, args.manifest, args.output_dir)
    except InputValidationError as exc:
        print(f"Input error: {exc}", file=sys.stderr)
        raise SystemExit(2) from exc

    print(f"Evaluation summary written to: {args.output_dir / 'summary.md'}")
    print(f"Cases: {summary['case_count']}")
    print(f"Passed: {summary['passed_count']}")
    print(f"Failed: {summary['failed_count']}")


if __name__ == "__main__":
    main()
