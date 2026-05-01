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

        if self._looks_like_market_strategy(requirement):
            return self._rewrite_market_strategy(evidence)

        if self._looks_like_product_planning(requirement, evidence):
            return self._rewrite_product_planning(requirement, evidence)

        if self._looks_like_ai_delivery(requirement, evidence):
            return self._rewrite_ai_delivery(evidence)

        return self._rewrite_generic(requirement, evidence)

    def _looks_like_ai_delivery(self, requirement: str, evidence: str) -> bool:
        text = requirement + evidence
        return "AI" in text or "智能" in text or "大模型" in text

    def _looks_like_market_strategy(self, requirement: str) -> bool:
        return any(keyword in requirement for keyword in ("市场趋势", "市场洞察", "产品定位", "策略"))

    def _looks_like_product_planning(self, requirement: str, evidence: str) -> bool:
        text = requirement + evidence
        return any(keyword in text for keyword in ("产品规划", "产品设计", "0-1", "0 到 1", "产品定义"))

    def _rewrite_ai_delivery(self, evidence: str) -> str:
        scenes = self._extract_between(evidence, "在", "等场景中")
        architecture = self._extract_between(evidence, "主导设计“", "”")
        result = self._extract_after(evidence, "实现")

        parts = ["主导 AI 产品能力落地"]
        if scenes:
            parts.append(f"围绕{scenes}场景")
        if architecture:
            parts.append(f"设计“{architecture}”双引擎方案")
        if result:
            connector = "推动 " if self._starts_with_ascii(result) else "推动"
            parts.append(f"{connector}{result}")

        if len(parts) == 1:
            return self._rewrite_generic("AI 产品能力落地", evidence)

        return "，".join(parts) + "。"

    def _rewrite_market_strategy(self, evidence: str) -> str:
        scenario = self._extract_between(evidence, "针对", "，完成")
        positioning = self._extract_phrase_starting(evidence, "完成")
        framework = self._extract_phrase_starting(evidence, "提出")

        parts = []
        if scenario:
            parts.append(f"基于{scenario}")
        if positioning:
            parts.append(positioning)
        if framework:
            parts.append(framework)

        if not parts:
            return self._rewrite_generic("市场趋势与产品策略", evidence)

        parts.append("支撑 G 端智能化产品定位与创新策略")
        return "，".join(parts) + "。"

    def _rewrite_product_planning(self, requirement: str, evidence: str) -> str:
        scenario = self._extract_between(evidence, "针对", "，完成")
        positioning = self._extract_phrase_starting(evidence, "完成")
        framework = self._extract_phrase_starting(evidence, "提出")

        if not scenario and not framework:
            return self._rewrite_generic(requirement, evidence)

        parts = []
        if scenario:
            parts.append(f"围绕{scenario}")
        parts.append("负责产品 0-1 规划与定义")
        if positioning:
            parts.append(positioning)
        if framework:
            parts.append(framework)

        return self._dedupe_parts(parts)

    def _rewrite_generic(self, requirement: str, evidence: str) -> str:
        evidence_body = self._remove_leading_label(evidence)
        if evidence_body == evidence:
            return f"围绕“{requirement}”，{evidence_body}"
        return evidence_body

    def _remove_leading_label(self, text: str) -> str:
        if "：" not in text:
            return text

        label, body = text.split("：", 1)
        action_labels = ("负责", "主导", "推动", "完成", "设计", "输出", "提出", "实现")
        if label.startswith(action_labels):
            return text
        return body

    def _extract_between(self, text: str, start: str, end: str) -> str:
        pattern = re.escape(start) + r"(.+?)" + re.escape(end)
        match = re.search(pattern, text)
        if not match:
            return ""
        return self._clean_sentence(match.group(1))

    def _extract_after(self, text: str, marker: str) -> str:
        if marker not in text:
            return ""
        value = text.split(marker, 1)[1]
        value = re.split(r"[。；;]", value, maxsplit=1)[0]
        return self._clean_sentence(value)

    def _extract_phrase_starting(self, text: str, marker: str) -> str:
        if marker not in text:
            return ""
        value = marker + text.split(marker, 1)[1]
        value = re.split(r"[。；;]", value, maxsplit=1)[0]
        return self._clean_sentence(value)

    def _extract_sentence_containing(self, text: str, keyword: str) -> str:
        sentences = re.split(r"(?<=[。；;])", text)
        for sentence in sentences:
            if keyword in sentence:
                return self._clean_sentence(sentence)
        return ""

    def _dedupe_parts(self, parts: list[str]) -> str:
        unique_parts: list[str] = []
        for part in parts:
            cleaned = self._clean_sentence(part).rstrip("。")
            if cleaned and cleaned not in unique_parts:
                unique_parts.append(cleaned)
        return "，".join(unique_parts) + "。"

    def _starts_with_ascii(self, text: str) -> bool:
        return bool(text) and text[0].isascii()
