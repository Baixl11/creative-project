from __future__ import annotations

import re

from app.models import MatchReport, RequirementEvidence, ResumeSuggestion


class ResumeRewriter:
    MAX_SUGGESTIONS = 3

    def build_suggestions(self, match_report: MatchReport) -> list[ResumeSuggestion]:
        weak_items = [
            item for item in match_report.requirement_evidence if item.status == "missing"
        ]
        if weak_items:
            return [self._build_gap_suggestion(item) for item in weak_items[: self.MAX_SUGGESTIONS]]

        strong_items = [
            item
            for item in match_report.requirement_evidence
            if item.status == "matched" and item.best_resume_highlight
        ]
        return [
            self._build_strengthening_suggestion(item)
            for item in strong_items[: self.MAX_SUGGESTIONS]
        ]

    def _build_strengthening_suggestion(
        self,
        evidence: RequirementEvidence,
    ) -> ResumeSuggestion:
        current_evidence = evidence.best_resume_highlight or ""
        cleaned_evidence = self._clean_sentence(current_evidence)
        rewrite_bullet = self._rewrite_matched_evidence(
            evidence.requirement,
            cleaned_evidence,
        )

        return ResumeSuggestion(
            target_requirement=evidence.requirement,
            current_evidence=cleaned_evidence,
            rewrite_bullet=rewrite_bullet,
            why_it_helps="这条要求已经有证据支撑，改写重点是把动作、场景和结果说得更直接，让招聘方不用自己推理。",
            suggestion_type="strengthen",
        )

    def _build_gap_suggestion(self, evidence: RequirementEvidence) -> ResumeSuggestion:
        current_evidence = (
            self._clean_sentence(evidence.best_resume_highlight)
            if evidence.best_resume_highlight
            else None
        )
        action_hint = "补充一条经历"
        if current_evidence:
            action_hint = "基于现有经历补强"

        rewrite_bullet = (
            f"{action_hint}：围绕“{evidence.requirement}”，写清楚你负责的具体项目、"
            "协作对象、关键动作和最终结果；如果有数据，优先写成“提升 X% / 覆盖 X 个场景 / "
            "节省 X 小时”这样的结果。"
        )

        return ResumeSuggestion(
            target_requirement=evidence.requirement,
            current_evidence=current_evidence,
            rewrite_bullet=rewrite_bullet,
            why_it_helps="这条岗位要求目前证据不足，需要新增或强化一条经历，否则面试官可能会认为只是会说但没有实际项目证明。",
            suggestion_type="gap",
        )

    def _clean_sentence(self, text: str) -> str:
        cleaned = text.replace("\u200b", "")
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        cleaned = re.sub(r"\s+([：，。；、])", r"\1", cleaned)
        cleaned = re.sub(r"([：，。；、])\s+", r"\1", cleaned)
        cleaned = re.sub(r"\s*-\s*", "-", cleaned)
        return cleaned.rstrip("；;.")

    def _rewrite_matched_evidence(self, requirement: str, evidence: str) -> str:
        if not evidence:
            return f"围绕“{requirement}”补充一条更具体的项目经历。"

        return self._remove_leading_label(evidence)

    def _remove_leading_label(self, text: str) -> str:
        if "：" not in text:
            return text

        label, body = text.split("：", 1)
        action_labels = (
            "负责",
            "主导",
            "参与",
            "协助",
            "推动",
            "完成",
            "设计",
            "输出",
            "提出",
            "实现",
        )
        if label.startswith(action_labels):
            return text
        return body
