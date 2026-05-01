import tempfile
import unittest
from pathlib import Path

from app.config import Settings
from app.evaluation import load_evaluation_cases, run_evaluation_suite


class EvaluationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(
            project_name="job-agent",
            llm_base_url="https://api.openai.com/v1",
            llm_api_key="",
            llm_model="gpt-4.1-mini",
            llm_timeout_seconds=30,
            use_mock_llm=True,
        )

    def test_loads_evaluation_cases(self) -> None:
        cases = load_evaluation_cases(Path("data/eval_cases/manifest.json"))

        self.assertEqual(len(cases), 3)
        self.assertEqual(cases[0].id, "high_match")

    def test_evaluation_suite_writes_summary(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir) / "evaluations"

            summary = run_evaluation_suite(
                self.settings,
                Path("data/eval_cases/manifest.json"),
                output_dir,
            )

            self.assertEqual(summary["case_count"], 3)
            self.assertEqual(summary["failed_count"], 0)
            first_result = summary["results"][0]
            self.assertIn("diagnosis", first_result)
            self.assertIn("top_matched_requirements", first_result)
            self.assertIn("top_missing_requirements", first_result)
            self.assertTrue((output_dir / "summary.md").exists())
            self.assertTrue((output_dir / "summary.json").exists())

            summary_markdown = (output_dir / "summary.md").read_text(encoding="utf-8")
            self.assertIn("## Case Diagnostics", summary_markdown)
            self.assertIn("Top missing requirements:", summary_markdown)


if __name__ == "__main__":
    unittest.main()
