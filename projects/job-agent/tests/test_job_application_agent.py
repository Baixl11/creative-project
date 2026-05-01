import json
import tempfile
import unittest
from pathlib import Path

from app.agents.job_application_agent import JobApplicationAgent
from app.config import Settings
from app.errors import InputValidationError


class JobApplicationAgentTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(
            project_name="job-agent",
            llm_base_url="https://api.openai.com/v1",
            llm_api_key="",
            llm_model="gpt-4.1-mini",
            llm_timeout_seconds=30,
            use_mock_llm=True,
        )
        self.agent = JobApplicationAgent(self.settings)

    def test_agent_writes_markdown_and_json_outputs(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            report_path = temp_path / "report.md"
            json_path = temp_path / "report.json"

            result = self.agent.run(
                Path("data/sample_jd.txt"),
                Path("data/sample_resume.txt"),
                report_path,
                json_path,
            )

            self.assertTrue(report_path.exists())
            self.assertTrue(json_path.exists())

            report = report_path.read_text(encoding="utf-8")
            self.assertIn("# 求职匹配分析报告", report)
            self.assertIn("## 先看结论", report)
            self.assertIn("## 可以直接改写到简历里的 bullet", report)
            self.assertIn("建议写法：", report)
            self.assertNotIn("## Quick View", report)
            self.assertNotIn("Best resume evidence", report)
            self.assertNotIn("## 简历可以优先补强的地方", report)

            payload = json.loads(json_path.read_text(encoding="utf-8"))
            self.assertEqual(payload["job_title"], result.job_title)
            self.assertEqual(payload["summary"]["score"], result.match_report.score)
            self.assertEqual(
                payload["workflow_result"]["match_report"]["matched_requirements"],
                result.match_report.matched_requirements,
            )
            self.assertIn(
                "requirement_evidence",
                payload["workflow_result"]["match_report"],
            )
            self.assertIn(
                "best_resume_highlight",
                payload["workflow_result"]["match_report"]["requirement_evidence"][0],
            )
            self.assertIn(
                "rewrite_bullet",
                payload["workflow_result"]["resume_suggestions"][0],
            )

    def test_agent_rejects_missing_jd_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            with self.assertRaisesRegex(InputValidationError, "Job description file does not exist"):
                self.agent.run(
                    temp_path / "missing_jd.txt",
                    Path("data/sample_resume.txt"),
                    temp_path / "report.md",
                    temp_path / "report.json",
                )

    def test_agent_rejects_empty_resume_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            empty_resume_path = temp_path / "empty_resume.txt"
            empty_resume_path.write_text("   \n", encoding="utf-8")

            with self.assertRaisesRegex(InputValidationError, "Resume file did not contain"):
                self.agent.run(
                    Path("data/sample_jd.txt"),
                    empty_resume_path,
                    temp_path / "report.md",
                    temp_path / "report.json",
                )


if __name__ == "__main__":
    unittest.main()
