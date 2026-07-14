import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import evaluate as evaluate_cli
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

    def test_cli_exits_nonzero_when_any_case_fails(self) -> None:
        failed_summary = {
            "case_count": 1,
            "passed_count": 0,
            "failed_count": 1,
        }

        with patch("sys.argv", ["app.evaluate"]), patch(
            "app.evaluate.run_evaluation_suite",
            return_value=failed_summary,
        ), self.assertRaises(SystemExit) as context:
            evaluate_cli.main()

        self.assertEqual(context.exception.code, 1)


if __name__ == "__main__":
    unittest.main()
