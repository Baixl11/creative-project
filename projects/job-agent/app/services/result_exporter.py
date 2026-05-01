from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from app.models import WorkflowResult
from app.utils.file_io import write_text


class ResultExporter:
    def write_json(self, result: WorkflowResult, output_path: Path) -> None:
        payload = {
            "project": "job-agent",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "job_title": result.job_title,
            "run_mode": result.run_mode,
            "artifacts": {
                "markdown_report": str(result.output_path),
                "json_report": str(output_path),
            },
            "summary": {
                "score": result.match_report.score,
                "matched_count": len(result.match_report.matched_requirements),
                "missing_count": len(result.match_report.missing_requirements),
            },
            "workflow_result": result.to_dict(),
        }
        write_text(output_path, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
