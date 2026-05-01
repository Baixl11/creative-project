from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from app.agents.job_application_agent import JobApplicationAgent
from app.config import Settings
from app.errors import InputValidationError
from app.utils.file_io import read_required_text, write_text


@dataclass(slots=True)
class EvaluationCase:
    id: str
    jd_path: Path
    resume_path: Path
    expected_min_score: int
    expected_max_score: int
    notes: str


def load_evaluation_cases(manifest_path: Path) -> list[EvaluationCase]:
    raw_manifest = read_required_text(manifest_path, "Evaluation manifest")

    try:
        payload = json.loads(raw_manifest)
    except json.JSONDecodeError as exc:
        raise InputValidationError(f"Evaluation manifest is not valid JSON: {manifest_path}") from exc

    if not isinstance(payload, list) or not payload:
        raise InputValidationError("Evaluation manifest must be a non-empty JSON list.")

    cases: list[EvaluationCase] = []
    for index, item in enumerate(payload, start=1):
        if not isinstance(item, dict):
            raise InputValidationError(f"Evaluation case #{index} must be a JSON object.")

        try:
            cases.append(
                EvaluationCase(
                    id=str(item["id"]),
                    jd_path=Path(str(item["jd_path"])),
                    resume_path=Path(str(item["resume_path"])),
                    expected_min_score=int(item["expected_min_score"]),
                    expected_max_score=int(item["expected_max_score"]),
                    notes=str(item.get("notes", "")),
                )
            )
        except KeyError as exc:
            raise InputValidationError(
                f"Evaluation case #{index} is missing required field: {exc.args[0]}"
            ) from exc

    return cases


def run_evaluation_suite(
    settings: Settings,
    manifest_path: Path,
    output_dir: Path,
) -> dict[str, object]:
    cases = load_evaluation_cases(manifest_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    agent = JobApplicationAgent(settings)
    results: list[dict[str, object]] = []

    for case in cases:
        report_path = output_dir / f"{case.id}.md"
        json_path = output_dir / f"{case.id}.json"
        workflow_result = agent.run(case.jd_path, case.resume_path, report_path, json_path)
        score = workflow_result.match_report.score
        within_expected_range = case.expected_min_score <= score <= case.expected_max_score
        top_matched_requirements = workflow_result.match_report.matched_requirements[:3]
        top_missing_requirements = workflow_result.match_report.missing_requirements[:3]

        results.append(
            {
                "id": case.id,
                "score": score,
                "expected_min_score": case.expected_min_score,
                "expected_max_score": case.expected_max_score,
                "within_expected_range": within_expected_range,
                "matched_count": len(workflow_result.match_report.matched_requirements),
                "missing_count": len(workflow_result.match_report.missing_requirements),
                "top_matched_requirements": top_matched_requirements,
                "top_missing_requirements": top_missing_requirements,
                "diagnosis": _build_case_diagnosis(
                    score,
                    case.expected_min_score,
                    case.expected_max_score,
                    top_matched_requirements,
                    top_missing_requirements,
                    within_expected_range,
                ),
                "markdown_report": str(report_path),
                "json_report": str(json_path),
                "notes": case.notes,
            }
        )

    summary = {
        "manifest_path": str(manifest_path),
        "output_dir": str(output_dir),
        "case_count": len(results),
        "passed_count": sum(1 for item in results if item["within_expected_range"]),
        "failed_count": sum(1 for item in results if not item["within_expected_range"]),
        "results": results,
    }

    write_text(output_dir / "summary.json", json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
    write_text(output_dir / "summary.md", _build_summary_markdown(summary))
    return summary


def _build_case_diagnosis(
    score: int,
    expected_min_score: int,
    expected_max_score: int,
    top_matched_requirements: list[str],
    top_missing_requirements: list[str],
    within_expected_range: bool,
) -> str:
    if score < expected_min_score:
        return "Score is lower than expected; review whether the matcher is missing valid resume evidence."

    if score > expected_max_score:
        return "Score is higher than expected; review whether generic overlap is being over-counted."

    if not within_expected_range:
        return "Score is outside the expected range and should be reviewed."

    if top_missing_requirements:
        return f"Score is in range; main gap: {top_missing_requirements[0]}"

    if top_matched_requirements:
        return f"Score is in range; strongest signal: {top_matched_requirements[0]}"

    return "Score is in range; no strong matched or missing signal was extracted."


def _build_summary_markdown(summary: dict[str, object]) -> str:
    results = summary["results"]
    assert isinstance(results, list)

    lines = [
        "# Evaluation Summary",
        "",
        f"- Case count: {summary['case_count']}",
        f"- Passed: {summary['passed_count']}",
        f"- Failed: {summary['failed_count']}",
        "",
        "| Case | Score | Expected | Status |",
        "| --- | ---: | ---: | --- |",
    ]

    for item in results:
        assert isinstance(item, dict)
        status = "PASS" if item["within_expected_range"] else "CHECK"
        lines.append(
            "| {id} | {score} | {expected_min_score}-{expected_max_score} | {status} |".format(
                **item,
                status=status,
            )
        )

    lines.extend(["", "## Case Diagnostics", ""])

    for item in results:
        assert isinstance(item, dict)
        status = "PASS" if item["within_expected_range"] else "CHECK"
        matched_items = item["top_matched_requirements"]
        missing_items = item["top_missing_requirements"]
        assert isinstance(matched_items, list)
        assert isinstance(missing_items, list)

        lines.extend(
            [
                f"### {item['id']}",
                "",
                f"- Status: {status}",
                f"- Score: {item['score']} / expected {item['expected_min_score']}-{item['expected_max_score']}",
                f"- Matched requirements: {item['matched_count']}",
                f"- Missing requirements: {item['missing_count']}",
                f"- Diagnosis: {item['diagnosis']}",
                f"- Markdown report: {item['markdown_report']}",
                "",
                "Top matched requirements:",
                *_format_markdown_list(matched_items),
                "",
                "Top missing requirements:",
                *_format_markdown_list(missing_items),
                "",
            ]
        )

    return "\n".join(lines).strip() + "\n"


def _format_markdown_list(items: list[object]) -> list[str]:
    if not items:
        return ["- None"]
    return [f"- {item}" for item in items]
