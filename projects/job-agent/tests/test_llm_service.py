import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app.agents.job_application_agent import JobApplicationAgent
from app.config import Settings
from app.errors import LLMServiceError
from app.services.llm_service import LLMService


class FakeResponse:
    def __init__(self, body: bytes) -> None:
        self.body = body

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
        return None

    def read(self) -> bytes:
        return self.body


class LLMServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(
            project_name="job-agent",
            llm_base_url="https://api.example.com/v1",
            llm_api_key="test-key",
            llm_model="test-model",
            llm_timeout_seconds=5,
            use_mock_llm=False,
        )

    def test_complete_wraps_invalid_json(self) -> None:
        service = LLMService(self.settings)

        with patch(
            "app.services.llm_service.urllib.request.urlopen",
            return_value=FakeResponse(b"not-json"),
        ), self.assertRaisesRegex(LLMServiceError, "not valid JSON"):
            service.complete("system", "user")

    def test_complete_wraps_invalid_utf8(self) -> None:
        service = LLMService(self.settings)

        with patch(
            "app.services.llm_service.urllib.request.urlopen",
            return_value=FakeResponse(b"\xff\xfe"),
        ), self.assertRaisesRegex(LLMServiceError, "not valid UTF-8"):
            service.complete("system", "user")

    def test_complete_rejects_invalid_response_shape(self) -> None:
        service = LLMService(self.settings)

        with patch(
            "app.services.llm_service.urllib.request.urlopen",
            return_value=FakeResponse(b'{"choices": [{"message": {"content": 123}}]}'),
        ), self.assertRaisesRegex(LLMServiceError, "content was invalid"):
            service.complete("system", "user")

    def test_agent_marks_provider_failure_as_mock_fallback(self) -> None:
        agent = JobApplicationAgent(self.settings)

        with tempfile.TemporaryDirectory() as temp_dir, patch.object(
            agent.llm_service,
            "complete",
            side_effect=LLMServiceError("provider unavailable"),
        ):
            temp_path = Path(temp_dir)
            report_path = temp_path / "report.md"
            json_path = temp_path / "report.json"

            result = agent.run(
                Path("data/sample_jd.txt"),
                Path("data/sample_resume.txt"),
                report_path,
                json_path,
            )

            self.assertEqual(result.run_mode, "mock-fallback")
            self.assertIn("运行模式：mock-fallback", report_path.read_text(encoding="utf-8"))
            self.assertIn('"run_mode": "mock-fallback"', json_path.read_text(encoding="utf-8"))

    def test_agent_marks_successful_provider_call_as_live(self) -> None:
        agent = JobApplicationAgent(self.settings)

        with tempfile.TemporaryDirectory() as temp_dir, patch.object(
            agent.llm_service,
            "complete",
            return_value="- 实时模型摘要",
        ):
            temp_path = Path(temp_dir)
            result = agent.run(
                Path("data/sample_jd.txt"),
                Path("data/sample_resume.txt"),
                temp_path / "report.md",
                temp_path / "report.json",
            )

        self.assertEqual(result.run_mode, "live-api:test-model")


if __name__ == "__main__":
    unittest.main()
