import json
import inspect
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import web_app
from app.config import Settings
from streamlit.testing.v1 import AppTest


class FakeUploadedFile:
    def __init__(self, name: str, content: bytes) -> None:
        self.name = name
        self._content = content

    def getbuffer(self) -> memoryview:
        return memoryview(self._content)


class WebAppTests(unittest.TestCase):
    def test_save_uploaded_file_uses_safe_name_and_preserves_extension(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            upload_dir = Path(temp_dir)
            uploaded_file = FakeUploadedFile("../unsafe_resume.pdf", b"pdf-content")

            saved_path = web_app._save_uploaded_file(uploaded_file, upload_dir, "resume")

            self.assertEqual(saved_path, upload_dir / "resume.pdf")
            self.assertEqual(saved_path.read_bytes(), b"pdf-content")

    def test_supported_types_include_real_world_inputs(self) -> None:
        self.assertIn("pdf", web_app.SUPPORTED_TYPES)
        self.assertIn("png", web_app.SUPPORTED_TYPES)
        self.assertIn("rtf", web_app.SUPPORTED_TYPES)

    def test_first_existing_path_returns_public_demo_fallback(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            missing_private = Path(temp_dir) / "missing_private.txt"
            public_demo = Path(temp_dir) / "demo.txt"
            public_demo.write_text("demo", encoding="utf-8")

            self.assertEqual(
                web_app._first_existing_path([missing_private, public_demo]),
                public_demo,
            )

    def test_project_path_is_absolute_and_points_to_project_files(self) -> None:
        sample_path = web_app._project_path("data", "sample_jd.txt")

        self.assertTrue(sample_path.is_absolute())
        self.assertEqual(sample_path.parent.name, "data")
        self.assertTrue(sample_path.exists())

    def test_web_app_does_not_define_persistent_upload_or_output_directories(self) -> None:
        self.assertFalse(hasattr(web_app, "OUTPUT_DIR"))
        self.assertFalse(hasattr(web_app, "UPLOAD_DIR"))

    def test_execute_web_run_cleans_temp_files_and_sanitizes_download_json(self) -> None:
        settings = Settings(
            project_name="job-agent",
            llm_base_url="https://api.openai.com/v1",
            llm_api_key="",
            llm_model="gpt-4.1-mini",
            llm_timeout_seconds=30,
            use_mock_llm=True,
        )
        created_temp_dirs: list[Path] = []
        base_temporary_directory = tempfile.TemporaryDirectory

        class TrackingTemporaryDirectory(base_temporary_directory):
            def __enter__(self) -> str:
                value = super().__enter__()
                created_temp_dirs.append(Path(value))
                return value

        jd_file = FakeUploadedFile(
            "job.txt",
            b"AI Product Manager\nRequirements\nExperience with AI product planning.\n",
        )
        resume_file = FakeUploadedFile(
            "resume.txt",
            b"Led AI product planning and launched a workflow product.\n",
        )

        with patch("web_app.TemporaryDirectory", TrackingTemporaryDirectory):
            artifacts = web_app._execute_web_run(jd_file, resume_file, settings)

        self.assertTrue(created_temp_dirs)
        self.assertTrue(all(not path.exists() for path in created_temp_dirs))
        self.assertIn("# 求职匹配分析报告", artifacts["markdown_text"])
        self.assertEqual(
            artifacts["result"].output_path,
            Path(artifacts["markdown_filename"]),
        )
        self.assertEqual(
            artifacts["result"].json_output_path,
            Path(artifacts["json_filename"]),
        )

        payload = json.loads(artifacts["json_text"])
        self.assertEqual(
            payload["artifacts"]["markdown_report"],
            artifacts["markdown_filename"],
        )
        self.assertEqual(payload["artifacts"]["json_report"], artifacts["json_filename"])
        self.assertEqual(
            payload["workflow_result"]["output_path"],
            artifacts["markdown_filename"],
        )
        self.assertNotIn(str(web_app.PROJECT_ROOT), artifacts["json_text"])

    def test_builtin_result_and_downloads_survive_streamlit_rerun(self) -> None:
        app = AppTest.from_file("web_app.py", default_timeout=20).run()

        app.button[0].click().run()

        self.assertEqual(list(app.exception), [])
        self.assertEqual(
            [(metric.label, metric.value) for metric in app.metric],
            [("简历改写建议", "3"), ("已匹配要求", "6"), ("待补强要求", "0")],
        )
        self.assertEqual(len(app.get("download_button")), 2)

        app.run()

        self.assertEqual(list(app.exception), [])
        self.assertEqual(len(app.metric), 3)
        self.assertEqual(len(app.get("download_button")), 2)

    def test_supported_format_summary_mentions_core_inputs(self) -> None:
        summary = web_app.SUPPORTED_FORMAT_SUMMARY.lower()

        self.assertIn("txt", summary)
        self.assertIn("pdf", summary)
        self.assertIn("png", summary)
        self.assertIn("tiff", summary)

    def test_upload_field_label_is_lightweight_and_escapes_text(self) -> None:
        label = web_app._build_upload_field_label(
            title="上传 <JD>",
            hint="岗位描述",
        )

        self.assertIn("upload-field-label", label)
        self.assertIn("支持 TXT", label)
        self.assertIn("上传 &lt;JD&gt;", label)
        self.assertNotIn("upload-card-head", label)
        self.assertNotIn("format-chip", label)
        self.assertNotIn("上传 <JD>", label)

    def test_upload_dropzone_hides_default_streamlit_format_hint(self) -> None:
        style_source = inspect.getsource(web_app._inject_style)

        self.assertIn("stFileUploaderDropzoneInstructions", style_source)
        self.assertIn("display: none !important", style_source)

    def test_score_status_explains_match_band(self) -> None:
        self.assertIn("强匹配", web_app._score_status(95))
        self.assertIn("中等匹配", web_app._score_status(65))
        self.assertIn("低匹配", web_app._score_status(20))

    def test_score_progress_is_clamped_to_valid_percent(self) -> None:
        self.assertEqual(web_app._score_progress(-5), 0)
        self.assertEqual(web_app._score_progress(71), 71)
        self.assertEqual(web_app._score_progress(105), 100)

    def test_to_chinese_display_translates_known_sample_text(self) -> None:
        self.assertEqual(
            web_app._to_chinese_display(
                "Translate user research into product requirements and roadmaps."
            ),
            "将用户研究转化为产品需求和路线图。",
        )
        self.assertEqual(
            web_app._to_chinese_display(
                "Alex Chen Product Manager Led roadmap planning for a mobile productivity product used by 200k monthly active users."
            ),
            "主导移动端效率产品路线图规划，产品月活用户约 20 万。",
        )

    def test_to_chinese_display_translates_embedded_requirement_text(self) -> None:
        text = "围绕“3+ years of product management experience.”补充一条经历"

        self.assertEqual(
            web_app._to_chinese_display(text),
            "围绕“3 年以上产品经理经验。”补充一条经历",
        )

    def test_copyable_text_block_places_copy_icon_outside_text_box(self) -> None:
        block = web_app._build_copyable_text_block_html("负责产品规划", "rewrite-1")

        self.assertIn("copy-icon-button", block)
        self.assertIn("<svg", block)
        self.assertIn("copyable-text", block)
        self.assertLess(
            block.index("copy-icon-button"),
            block.index('<pre class="copyable-text">'),
        )

    def test_copyable_text_block_escapes_user_content(self) -> None:
        block = web_app._build_copyable_text_block_html(
            '负责 <script>alert("x")</script> 产品规划',
            "rewrite-2",
        )

        self.assertIn("&lt;script&gt;alert", block)
        self.assertNotIn('<script>alert("x")</script>', block)

    def test_copyable_text_block_height_grows_with_content(self) -> None:
        short_height = web_app._copyable_text_block_height("短文本")
        long_height = web_app._copyable_text_block_height("长文本" * 120)

        self.assertGreater(long_height, short_height)

    def test_copyable_text_block_uses_current_streamlit_html_api(self) -> None:
        with patch.object(web_app.st, "html") as html_mock, patch.object(
            web_app,
            "_supports_javascript_html",
            return_value=True,
        ):
            web_app._render_copyable_text_block("负责产品规划", "rewrite-current")

        html_mock.assert_called_once()
        self.assertTrue(html_mock.call_args.kwargs["unsafe_allow_javascript"])


if __name__ == "__main__":
    unittest.main()
