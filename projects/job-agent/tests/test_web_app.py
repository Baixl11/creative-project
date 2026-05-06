import inspect
import tempfile
import unittest
from pathlib import Path

import web_app


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

    def test_output_dir_lives_inside_project_root(self) -> None:
        self.assertTrue(web_app.OUTPUT_DIR.is_absolute())
        self.assertEqual(web_app.OUTPUT_DIR.parent.name, "outputs")
        self.assertEqual(web_app.OUTPUT_DIR.name, "web")

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


if __name__ == "__main__":
    unittest.main()
