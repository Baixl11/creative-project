from __future__ import annotations

from pathlib import Path

from app.config import Settings
from app.models import InterviewQuestion, WorkflowResult
from app.services.jd_parser import JDParser
from app.services.llm_service import LLMService
from app.services.match_engine import MatchEngine
from app.services.report_generator import ReportGenerator
from app.services.result_exporter import ResultExporter
from app.services.resume_rewriter import ResumeRewriter
from app.services.resume_parser import ResumeParser
from app.utils.file_io import write_text
from app.utils.input_reader import read_required_input_text


class JobApplicationAgent:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.llm_service = LLMService(settings)
        self.jd_parser = JDParser()
        self.resume_parser = ResumeParser()
        self.match_engine = MatchEngine()
        self.resume_rewriter = ResumeRewriter()
        self.report_generator = ReportGenerator(self.llm_service)
        self.result_exporter = ResultExporter()

    def run(
        self,
        jd_path: Path,
        resume_path: Path,
        output_path: Path,
        json_output_path: Path | None = None,
    ) -> WorkflowResult:
        jd_text = read_required_input_text(jd_path, "Job description")
        resume_text = read_required_input_text(resume_path, "Resume")

        job_title, requirements = self.jd_parser.parse(jd_text)
        resume_highlights = self.resume_parser.parse(resume_text)
        match_report = self.match_engine.evaluate(requirements, resume_highlights)
        resume_suggestions = self.resume_rewriter.build_suggestions(match_report)
        interview_questions = self._build_interview_questions(
            match_report.matched_requirements,
            match_report.missing_requirements,
        )

        result = WorkflowResult(
            job_title=job_title,
            requirements=requirements,
            resume_highlights=resume_highlights,
            match_report=match_report,
            resume_suggestions=resume_suggestions,
            interview_questions=interview_questions,
            run_mode=self._describe_run_mode(),
            output_path=output_path,
            json_output_path=json_output_path,
        )

        report = self.report_generator.generate(result)
        write_text(output_path, report)
        if json_output_path is not None:
            self.result_exporter.write_json(result, json_output_path)
        return result

    def _build_interview_questions(
        self,
        matched_requirements: list[str],
        missing_requirements: list[str],
    ) -> list[InterviewQuestion]:
        questions: list[InterviewQuestion] = []

        for requirement in missing_requirements[:2]:
            questions.append(
                InterviewQuestion(
                    question=f"你能不能举一个例子，证明自己具备“{requirement}”这项能力？",
                    why_it_matters="这部分在当前简历里还不够明显，面试官很可能追问。",
                )
            )

        for requirement in matched_requirements[:2]:
            questions.append(
                InterviewQuestion(
                    question=f"你最能证明“{requirement}”的项目经历是哪一个？",
                    why_it_matters="这是当前简历里比较能打的部分，可以提前准备成一个有说服力的面试故事。",
                )
            )

        if not questions:
            questions.append(
                InterviewQuestion(
                    question="你有没有一个从发现问题、推动方案到最终上线的完整项目经历？",
                    why_it_matters="这类故事最能体现产品经理的主人翁意识和结果导向。",
                )
            )

        return questions

    def _describe_run_mode(self) -> str:
        if self.settings.use_mock_llm or not self.settings.llm_api_key:
            return "mock"
        return f"live-api:{self.settings.llm_model}"
