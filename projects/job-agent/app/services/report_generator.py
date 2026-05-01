from __future__ import annotations

from app.models import WorkflowResult
from app.services.llm_service import LLMService
from app.utils.file_io import load_prompt


class ReportGenerator:
    def __init__(self, llm_service: LLMService) -> None:
        self.llm_service = llm_service

    def generate(self, result: WorkflowResult) -> str:
        executive_summary = self._build_executive_summary(result)
        lines = [
            f"# 求职匹配分析报告",
            "",
            "## 先看结论",
            f"- 目标岗位：{result.job_title}",
            f"- 当前匹配分：{result.match_report.score}/100",
            f"- 运行模式：{result.run_mode}",
            "",
            "## 我的整体判断",
            executive_summary,
            "",
            "## 我从 JD 里抓到的关键要求",
            *[f"- {item}" for item in result.requirements],
            "",
            "## 我从简历里抓到的相关经历",
            *[f"- {item}" for item in result.resume_highlights],
            "",
            "## 一条条看匹配情况",
            *self._format_match_analysis(result),
            "",
            "## 可以直接改写到简历里的 bullet",
            *self._format_resume_suggestions(result),
            "",
            "## 面试前可以准备的问题",
            *[
                f"- {question.question}\n  为什么要准备：{question.why_it_matters}"
                for question in result.interview_questions
            ],
            "",
        ]
        return "\n".join(lines).strip() + "\n"

    def _build_executive_summary(self, result: WorkflowResult) -> str:
        fallback = self._fallback_summary(result)
        if not self.llm_service.enabled:
            return fallback

        try:
            prompt = load_prompt("report.txt")
            user_prompt = (
                prompt.replace("{{job_title}}", result.job_title)
                .replace("{{score}}", str(result.match_report.score))
                .replace(
                    "{{matched_requirements}}",
                    "\n".join(f"- {item}" for item in result.match_report.matched_requirements) or "- None",
                )
                .replace(
                    "{{missing_requirements}}",
                    "\n".join(f"- {item}" for item in result.match_report.missing_requirements) or "- None",
                )
                .replace(
                    "{{resume_highlights}}",
                    "\n".join(f"- {item}" for item in result.resume_highlights),
                )
            )
            return self.llm_service.complete(
                system_prompt="你是一位直白、务实的中文求职顾问，建议要具体、口语化。",
                user_prompt=user_prompt,
            )
        except RuntimeError:
            return fallback

    def _fallback_summary(self, result: WorkflowResult) -> str:
        matched_count = len(result.match_report.matched_requirements)
        missing_count = len(result.match_report.missing_requirements)
        strongest_overlap = (
            result.match_report.matched_requirements[0]
            if result.match_report.matched_requirements
            else "暂时没有特别明确的强匹配点"
        ).rstrip("。.")

        return "\n".join(
            [
                f"- 这份简历和目标岗位的当前匹配分是 {result.match_report.score}/100。",
                f"- 目前比较能对上的地方是：{strongest_overlap}。",
                f"- 还有 {missing_count} 条岗位要求没有被简历充分证明，已经匹配上的 {matched_count} 条建议继续放在简历显眼位置。",
            ]
        )

    def _format_resume_suggestions(self, result: WorkflowResult) -> list[str]:
        if not result.resume_suggestions:
            return ["- 暂时没有生成简历改写建议。"]

        lines: list[str] = []
        for index, item in enumerate(result.resume_suggestions, start=1):
            label = "补强缺口" if item.suggestion_type == "gap" else "强化优势"
            lines.extend(
                [
                    f"- 建议 {index}（{label}）：{item.target_requirement}",
                    f"  建议写法：{item.rewrite_bullet}",
                    f"  为什么这么改：{item.why_it_helps}",
                ]
            )
            if item.current_evidence:
                lines.append(f"  当前依据：{item.current_evidence}")
        return lines

    def _format_match_analysis(self, result: WorkflowResult) -> list[str]:
        lines: list[str] = []
        for item in result.match_report.requirement_evidence:
            label = "能对上" if item.status == "matched" else "还不够明显"
            evidence_label = (
                "简历里最能支撑这一点的句子"
                if item.status == "matched"
                else "简历里目前最接近的句子"
            )
            lines.append(
                f"- {label}：{item.requirement} "
                f"（匹配强度：{item.match_strength:.2f}）"
            )
            if item.best_resume_highlight:
                lines.append(f"  {evidence_label}：{item.best_resume_highlight}")
            else:
                lines.append(f"  {evidence_label}：暂时没找到")
        return lines
