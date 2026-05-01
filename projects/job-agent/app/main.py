from __future__ import annotations

import argparse
import sys
from pathlib import Path

from app.agents.job_application_agent import JobApplicationAgent
from app.config import Settings
from app.errors import InputValidationError


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the local Job Agent workflow.")
    parser.add_argument("--jd", type=Path, default=Path("data/sample_jd.txt"))
    parser.add_argument("--resume", type=Path, default=Path("data/sample_resume.txt"))
    parser.add_argument("--output", type=Path, default=Path("outputs/report.md"))
    parser.add_argument("--json-output", type=Path, default=Path("outputs/report.json"))
    parser.add_argument("--env-file", type=Path, default=Path(".env"))
    return parser


def main() -> None:
    args = build_parser().parse_args()
    settings = Settings.load(args.env_file)
    agent = JobApplicationAgent(settings)

    try:
        result = agent.run(args.jd, args.resume, args.output, args.json_output)
    except InputValidationError as exc:
        print(f"Input error: {exc}", file=sys.stderr)
        raise SystemExit(2) from exc

    print(f"Report written to: {result.output_path}")
    if result.json_output_path is not None:
        print(f"JSON written to: {result.json_output_path}")
    print(f"Job title: {result.job_title}")
    print(f"Match score: {result.match_report.score}")
    print(f"Run mode: {result.run_mode}")


if __name__ == "__main__":
    main()
