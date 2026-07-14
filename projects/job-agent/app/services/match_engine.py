from __future__ import annotations

import re

from app.models import MatchReport, RequirementEvidence


class MatchEngine:
    STOP_WORDS = {
        "a",
        "an",
        "and",
        "are",
        "as",
        "at",
        "be",
        "by",
        "experience",
        "experiences",
        "for",
        "from",
        "in",
        "into",
        "is",
        "management",
        "of",
        "on",
        "or",
        "the",
        "to",
        "tools",
        "with",
        "will",
        "your",
        "strong",
    }

    SYNONYM_GROUPS = (
        {
            "stakeholder",
            "stakeholders",
            "cross-functional",
            "alignment",
            "align",
            "aligned",
            "communicate",
            "communication",
            "written",
            "stakeholder management",
            "partner",
            "partnered",
            "priority",
            "priorities",
            "updates",
            "协同",
            "合作",
            "协作",
            "跨部门",
            "协调资源",
            "沟通",
            "对齐",
        },
        {
            "data",
            "analytics",
            "analysis",
            "dashboard",
            "dashboards",
            "metric",
            "metrics",
            "sql",
            "数据",
            "数据分析",
            "指标",
            "看板",
        },
        {
            "product",
            "roadmap",
            "roadmaps",
            "prioritization",
            "prd",
            "prds",
            "requirements",
            "产品",
            "产品规划",
            "规划",
            "产品定义",
            "产品方案",
            "产品功能",
            "产品特性",
            "需求分析",
            "0-1",
            "0 到 1",
            "从 0 到 1",
        },
        {
            "experiment",
            "experiments",
            "experimentation",
            "testing",
            "ab",
            "activation",
            "retention",
            "实验",
            "测试",
            "激活",
            "留存",
        },
        {
            "ai",
            "llm",
            "llm-powered",
            "automation",
            "agent",
            "ai产品",
            "人工智能",
            "智能",
            "智能化",
            "智能化产品",
            "大模型",
            "模型",
            "算法",
            "自动化",
        },
        {"design", "designer", "designers", "设计", "产品设计", "功能设计", "原型", "交互设计"},
        {"engineering", "engineer", "engineers", "技术", "技术团队", "研发", "工程", "工程师"},
        {"g端", "政务", "政务产品", "政府", "企业级", "b端", "to b"},
        {
            "ship",
            "shipped",
            "shipping",
            "launch",
            "launched",
            "delivery",
            "deliver",
            "delivered",
            "上线",
            "推进项目",
            "推动",
            "落地",
            "实现",
            "交付",
        },
        {
            "optimize",
            "optimized",
            "optimization",
            "improve",
            "improved",
            "优化",
            "提升",
            "突破",
            "效率",
        },
        {
            "market",
            "市场",
            "市场需求",
            "市场趋势",
            "市场洞察",
            "市场变化",
            "产品定位",
            "策略",
            "策略支持",
            "创新",
        },
        {
            "用户",
            "user",
            "users",
            "用户需求",
            "需求洞察",
            "洞察用户",
            "用户调研",
            "调研",
            "research",
            "客户",
            "customer",
            "customers",
            "客户反馈",
            "feedback",
            "专业用户",
        },
        {
            "result",
            "results",
            "outcome",
            "outcomes",
            "adoption",
            "结果",
            "业务成果",
            "用户量",
            "使用量",
            "覆盖率",
        },
    )

    def evaluate(self, requirements: list[str], resume_highlights: list[str]) -> MatchReport:
        resume_token_sets: list[tuple[str, set[str]]] = []
        for item in resume_highlights:
            tokens = self._tokenize(item)
            resume_token_sets.append((item, tokens))

        matched: list[str] = []
        missing: list[str] = []
        rationale: list[str] = []
        requirement_evidence: list[RequirementEvidence] = []
        match_strengths: list[float] = []

        for requirement in requirements:
            requirement_tokens = self._tokenize(requirement)
            best_overlap, best_resume_highlight = self._best_overlap(
                requirement_tokens,
                resume_token_sets,
            )
            best_overlap = min(max(best_overlap, 0.0), 1.0)
            match_strength = round(best_overlap, 2)
            match_strengths.append(best_overlap)

            if best_overlap >= 0.22:
                matched.append(requirement)
                reason = (
                    f"Matched: '{requirement}' is supported by resume evidence "
                    f"with match strength {match_strength}."
                )
                status = "matched"
            else:
                missing.append(requirement)
                reason = (
                    f"Missing: '{requirement}' is not strongly supported by the current resume text."
                )
                status = "missing"

            rationale.append(reason)
            requirement_evidence.append(
                RequirementEvidence(
                    requirement=requirement,
                    status=status,
                    best_resume_highlight=best_resume_highlight,
                    match_strength=match_strength,
                    reason=reason,
                )
            )

        if requirements:
            coverage = len(matched) / len(requirements)
            average_strength = sum(match_strengths) / len(match_strengths)
            score = min(95, round((coverage * 80) + (average_strength * 15)))
        else:
            score = 0

        return MatchReport(
            score=score,
            matched_requirements=matched,
            missing_requirements=missing,
            rationale=rationale,
            requirement_evidence=requirement_evidence,
        )

    def _best_overlap(
        self,
        requirement_tokens: set[str],
        resume_token_sets: list[tuple[str, set[str]]],
    ) -> tuple[float, str | None]:
        if not requirement_tokens or not resume_token_sets:
            return 0.0, None

        requirement_units = self._count_requirement_units(requirement_tokens)
        if requirement_units == 0:
            return 0.0, None

        best_score = 0.0
        best_direct_units = 0
        best_support_units = 0
        best_resume_highlight: str | None = None
        for resume_highlight, resume_tokens in resume_token_sets:
            direct_units = self._count_direct_units(requirement_tokens, resume_tokens)
            support_units = self._count_support_units(requirement_tokens, resume_tokens)
            supported_overlap = support_units / requirement_units
            direct_overlap = direct_units / requirement_units
            score = (supported_overlap * 0.85) + (direct_overlap * 0.15)

            minimum_support = 1 if requirement_units <= 2 else 2
            if support_units < minimum_support:
                score = min(score, 0.17)

            score = min(max(score, 0.0), 1.0)

            is_better_score = score > best_score
            is_better_tie = (
                score == best_score
                and (direct_units, support_units) > (best_direct_units, best_support_units)
            )

            if is_better_score or is_better_tie:
                best_score = score
                best_direct_units = direct_units
                best_support_units = support_units
                best_resume_highlight = resume_highlight
        return best_score, best_resume_highlight

    def _count_support_units(self, requirement_tokens: set[str], resume_tokens: set[str]) -> int:
        direct_hits = requirement_tokens & resume_tokens
        support_units = len(self._tokens_outside_groups(direct_hits))

        requirement_groups = self._group_indexes(requirement_tokens)
        resume_groups = self._group_indexes(resume_tokens)
        support_units += len(requirement_groups & resume_groups)
        return support_units

    def _count_direct_units(self, requirement_tokens: set[str], resume_tokens: set[str]) -> int:
        direct_hits = requirement_tokens & resume_tokens
        direct_units = len(self._tokens_outside_groups(direct_hits))
        direct_units += len(self._group_indexes(direct_hits))
        return direct_units

    def _count_requirement_units(self, requirement_tokens: set[str]) -> int:
        return len(self._tokens_outside_groups(requirement_tokens)) + len(
            self._group_indexes(requirement_tokens)
        )

    def _group_indexes(self, tokens: set[str]) -> set[int]:
        return {
            index
            for index, group in enumerate(self.SYNONYM_GROUPS)
            if tokens & group
        }

    def _tokens_outside_groups(self, tokens: set[str]) -> set[str]:
        grouped_tokens: set[str] = set()
        for group in self.SYNONYM_GROUPS:
            grouped_tokens.update(group)
        return tokens - grouped_tokens

    def _tokenize(self, text: str) -> set[str]:
        lowered = text.lower()
        tokens = set(re.findall(r"[A-Za-z][A-Za-z0-9+#-]*", lowered))
        tokens |= self._extract_known_phrases(lowered)
        return {token for token in tokens if token not in self.STOP_WORDS}

    def _extract_known_phrases(self, lowered_text: str) -> set[str]:
        phrases: set[str] = set()
        for group in self.SYNONYM_GROUPS:
            for phrase in group:
                if self._should_scan_as_phrase(phrase) and phrase in lowered_text:
                    phrases.add(phrase)
        return phrases

    def _should_scan_as_phrase(self, phrase: str) -> bool:
        return any("\u4e00" <= char <= "\u9fff" for char in phrase) or any(
            char.isdigit() for char in phrase
        ) or " " in phrase
