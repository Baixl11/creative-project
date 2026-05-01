from __future__ import annotations

from app.utils.text_cleaner import dedupe_preserve_order, split_meaningful_lines


class JDParser:
    SECTION_HEADERS = {
        "responsibilities",
        "requirements",
        "preferred qualifications",
        "qualifications",
        "about the role",
        "岗位职责",
        "任职要求",
        "职位要求",
        "岗位要求",
    }

    IGNORED_SECTION_HEADERS = {
        "员工福利",
        "公司信息",
        "标签",
    }

    KEYWORDS = (
        "require",
        "requirements",
        "experience",
        "skill",
        "skills",
        "responsib",
        "preferred",
        "must",
        "should",
        "ability",
        "stakeholder",
        "analytics",
        "sql",
        "product",
        "roadmap",
        "metric",
        "ai",
        "automation",
        "产品",
        "智能化",
        "市场",
        "用户",
        "需求",
        "技术",
        "沟通",
        "协作",
        "策略",
    )

    def parse(self, text: str) -> tuple[str, list[str]]:
        lines = split_meaningful_lines(text)
        if not lines:
            return "Unknown role", []

        job_title = lines[0]
        requirements: list[str] = []
        current_section = ""

        for line in lines[1:]:
            lowered = line.lower()
            section_header = self._section_header_key(line, lowered)
            if section_header is not None:
                current_section = section_header
                continue

            if self._is_ignored_line(line, lowered):
                current_section = ""
                continue

            if self._should_keep_line(line, lowered, current_section):
                requirements.append(line)

        if not requirements:
            requirements = lines[1:7]

        return job_title, dedupe_preserve_order(requirements)[:6]

    def _should_keep_line(self, line: str, lowered: str, current_section: str) -> bool:
        if len(line.split()) < 4 and len(line) < 12:
            return False

        if lowered.startswith("we are hiring"):
            return False

        if current_section in {
            "responsibilities",
            "requirements",
            "qualifications",
            "岗位职责",
            "任职要求",
            "职位要求",
            "岗位要求",
        }:
            return True

        return any(keyword in lowered for keyword in self.KEYWORDS)

    def _section_header_key(self, line: str, lowered: str) -> str | None:
        normalized_line = line.strip(" :：")
        normalized_lowered = normalized_line.lower()
        if normalized_lowered in self.SECTION_HEADERS:
            return normalized_lowered
        if normalized_line in self.SECTION_HEADERS:
            return normalized_line
        if lowered in self.SECTION_HEADERS:
            return lowered
        if line in self.SECTION_HEADERS:
            return line
        return None

    def _is_ignored_line(self, line: str, lowered: str) -> bool:
        if line in self.IGNORED_SECTION_HEADERS:
            return True

        return lowered.startswith("tag") or line.startswith("标签：")
