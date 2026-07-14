from __future__ import annotations

import re

from app.utils.text_cleaner import dedupe_preserve_order, split_resume_lines


class ResumeParser:
    KEYWORDS = (
        "led",
        "built",
        "launched",
        "improved",
        "grew",
        "managed",
        "roadmap",
        "stakeholder",
        "experiment",
        "metric",
        "activation",
        "retention",
        "product",
        "data",
        "design",
        "engineering",
        "engineer",
        "ai",
        "automation",
        "cross-functional",
        "customer",
        "feedback",
        "产品",
        "规划",
        "设计",
        "定义",
        "需求",
        "用户",
        "调研",
        "市场",
        "洞察",
        "定位",
        "策略",
        "智能",
        "智能化",
        "大模型",
        "模型",
        "研发",
        "技术",
        "跨部门",
        "协同",
        "沟通",
        "协调",
        "推进",
        "落地",
        "上线",
        "效率",
        "覆盖率",
        "提升",
        "突破",
        "竞品",
        "PRD",
    )

    NOISE_PREFIXES = (
        "电话",
        "邮箱",
        "学历",
        "教育背景",
        "在校经历",
        "工作经历",
        "项目名称",
        "奖学金",
    )
    CONTACT_MARKERS = ("电话", "邮箱", "手机号", "手机", "微信", "wechat", "email", "e-mail", "qq")
    EMAIL_PATTERN = re.compile(r"\b[\w.+-]+@[\w.-]+\.\w+\b")
    CHINESE_MOBILE_PATTERN = re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)")

    def parse(self, text: str) -> list[str]:
        lines = split_resume_lines(text)
        safe_lines = [line for line in lines if not self._is_noise_line(line)]
        highlights: list[str] = []

        for line in safe_lines:
            lowered = line.lower()
            if self._looks_like_english_header(line):
                continue

            if len(line.split()) < 5 and len(line) < 18:
                continue

            if any(keyword in lowered for keyword in self.KEYWORDS) or any(
                char.isdigit() for char in line
            ):
                highlights.append(line)

        if not highlights:
            highlights = safe_lines[:6]

        return dedupe_preserve_order(highlights)[:6]

    def _looks_like_english_header(self, line: str) -> bool:
        words = line.split()
        action_starters = (
            "Led ",
            "Built ",
            "Launched ",
            "Improved ",
            "Grew ",
            "Managed ",
            "Designed ",
            "Created ",
            "Coordinated ",
            "Partnered ",
            "Worked ",
            "Wrote ",
            "Explored ",
            "Supported ",
            "Planned ",
            "Helped ",
        )
        return line.isascii() and len(words) <= 4 and not line.startswith(action_starters)

    def _is_noise_line(self, line: str) -> bool:
        lowered = line.lower()
        return (
            any(line.startswith(prefix) for prefix in self.NOISE_PREFIXES)
            or any(marker in lowered for marker in self.CONTACT_MARKERS)
            or bool(self.EMAIL_PATTERN.search(line))
            or bool(self.CHINESE_MOBILE_PATTERN.search(line))
        )
