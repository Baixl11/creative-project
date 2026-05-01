from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class RequirementEvidence:
    requirement: str
    status: str
    best_resume_highlight: str | None
    match_strength: float
    reason: str

    def to_dict(self) -> dict[str, object]:
        return {
            "requirement": self.requirement,
            "status": self.status,
            "best_resume_highlight": self.best_resume_highlight,
            "match_strength": self.match_strength,
            "reason": self.reason,
        }


@dataclass(slots=True)
class MatchReport:
    score: int
    matched_requirements: list[str]
    missing_requirements: list[str]
    rationale: list[str]
    requirement_evidence: list[RequirementEvidence]

    def to_dict(self) -> dict[str, object]:
        return {
            "score": self.score,
            "matched_requirements": self.matched_requirements,
            "missing_requirements": self.missing_requirements,
            "rationale": self.rationale,
            "requirement_evidence": [item.to_dict() for item in self.requirement_evidence],
        }


@dataclass(slots=True)
class InterviewQuestion:
    question: str
    why_it_matters: str

    def to_dict(self) -> dict[str, str]:
        return {
            "question": self.question,
            "why_it_matters": self.why_it_matters,
        }


@dataclass(slots=True)
class ResumeSuggestion:
    target_requirement: str
    current_evidence: str | None
    rewrite_bullet: str
    why_it_helps: str
    suggestion_type: str

    def to_dict(self) -> dict[str, str | None]:
        return {
            "target_requirement": self.target_requirement,
            "current_evidence": self.current_evidence,
            "rewrite_bullet": self.rewrite_bullet,
            "why_it_helps": self.why_it_helps,
            "suggestion_type": self.suggestion_type,
        }


@dataclass(slots=True)
class WorkflowResult:
    job_title: str
    requirements: list[str]
    resume_highlights: list[str]
    match_report: MatchReport
    resume_suggestions: list[ResumeSuggestion]
    interview_questions: list[InterviewQuestion]
    run_mode: str
    output_path: Path
    json_output_path: Path | None = None

    def to_dict(self) -> dict[str, object]:
        return {
            "job_title": self.job_title,
            "requirements": self.requirements,
            "resume_highlights": self.resume_highlights,
            "match_report": self.match_report.to_dict(),
            "resume_suggestions": [item.to_dict() for item in self.resume_suggestions],
            "interview_questions": [item.to_dict() for item in self.interview_questions],
            "run_mode": self.run_mode,
            "output_path": str(self.output_path),
            "json_output_path": str(self.json_output_path) if self.json_output_path else None,
        }
