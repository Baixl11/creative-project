from __future__ import annotations

import re


RESUME_SECTION_HEADERS = {
    "教育背景",
    "在校经历",
    "工作经历",
}

RESUME_LINE_STARTERS = (
    "AI ",
    "AI",
    "个人核心优势",
    "产品全流程",
    "出色的",
    "行业与",
    "娴熟的",
    "工作经历",
    "项目名称",
    "负责",
    "主导",
    "推动",
    "取得",
    "实现",
    "设计",
    "协调",
    "构建",
    "全周期",
    "产品推广",
    "品牌与",
    "竞品分析",
    "北京",
    "上海",
    "奖学金",
    "电话",
    "手机",
    "邮箱",
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


def split_meaningful_lines(text: str) -> list[str]:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = []
    for raw_line in normalized.split("\n"):
        stripped = _clean_prefix(raw_line.strip())
        if stripped:
            lines.append(normalize_ocr_spacing(re.sub(r"\s+", " ", stripped)))
    return lines


def normalize_ocr_spacing(text: str) -> str:
    text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", text)
    text = re.sub(r"\s+([，。！？；：、）】》])", r"\1", text)
    text = re.sub(r"([（【《])\s+", r"\1", text)
    text = re.sub(r"([，。！？；：、])\s+", r"\1", text)
    text = re.sub(r"\s+([)\]}])", r"\1", text)
    return text.strip()


def dedupe_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for item in items:
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        ordered.append(item)
    return ordered


def split_resume_lines(text: str) -> list[str]:
    lines = split_meaningful_lines(text)
    return _merge_wrapped_resume_lines(lines)


def _clean_prefix(line: str) -> str:
    return re.sub(r"^(?:[-*•]\s+|\d+[.)]\s+)", "", line).strip()


def _merge_wrapped_resume_lines(lines: list[str]) -> list[str]:
    merged: list[str] = []
    current = ""

    for line in lines:
        if not current:
            current = line
            continue

        if _should_start_new_resume_line(current, line):
            merged.append(current)
            current = line
        else:
            current = _join_wrapped_text(current, line)

    if current:
        merged.append(current)

    return merged


def _should_start_new_resume_line(current: str, line: str) -> bool:
    if _is_resume_section_header(current):
        return True

    if _is_resume_section_header(line):
        return True

    if _looks_like_new_resume_item(line):
        return True

    if _ends_like_complete_sentence(current):
        return True

    return False


def _is_resume_section_header(line: str) -> bool:
    return line in RESUME_SECTION_HEADERS


def _looks_like_new_resume_item(line: str) -> bool:
    return any(line.startswith(starter) for starter in RESUME_LINE_STARTERS)


def _ends_like_complete_sentence(line: str) -> bool:
    return line.endswith(("。", "！", "？", "；", ".", "!", "?", ";"))


def _join_wrapped_text(left: str, right: str) -> str:
    if not left:
        return right
    if not right:
        return left

    if _is_ascii_boundary(left[-1], right[0]):
        return f"{left} {right}"

    return f"{left}{right}"


def _is_ascii_boundary(left: str, right: str) -> bool:
    return left.isascii() and right.isascii() and left.isalnum() and right.isalnum()
