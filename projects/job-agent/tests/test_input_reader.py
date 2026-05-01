import os
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

from app.errors import InputValidationError
from app.utils.input_reader import read_required_input_text


class InputReaderTests(unittest.TestCase):
    def test_reads_plain_text_input(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "jd.txt"
            path.write_text("Product Manager\n- Build AI tools\n", encoding="utf-8")

            content = read_required_input_text(path, "Job description")

            self.assertIn("Product Manager", content)

    def test_rejects_unsupported_file_type(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "resume.docx"
            path.write_text("Resume text", encoding="utf-8")

            with self.assertRaisesRegex(InputValidationError, "file type is not supported"):
                read_required_input_text(path, "Resume")

    def test_reads_macos_text_package_with_rtf_payload(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            package_path = Path(temp_dir) / "my_jd.txt"
            package_path.mkdir()
            (package_path / "TXT.rtf").write_text("{\\rtf1 Job text}", encoding="utf-8")

            with patch("app.utils.input_reader._extract_rtf_text", return_value="Job text"):
                content = read_required_input_text(package_path, "Job description")

            self.assertEqual(content, "Job text")

    def test_extracts_pdf_text_when_pypdf_is_available(self) -> None:
        class FakePage:
            def extract_text(self) -> str:
                return "PDF resume text"

        class FakePdfReader:
            def __init__(self, path: str) -> None:
                self.path = path
                self.pages = [FakePage()]

        fake_pypdf = types.ModuleType("pypdf")
        fake_pypdf.PdfReader = FakePdfReader

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "resume.pdf"
            path.write_bytes(b"%PDF fake")

            with patch.dict(sys.modules, {"pypdf": fake_pypdf}):
                content = read_required_input_text(path, "Resume")

            self.assertEqual(content, "PDF resume text")

    def test_extracts_image_text_when_ocr_dependencies_are_available(self) -> None:
        class FakeImage:
            def __enter__(self) -> "FakeImage":
                return self

            def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
                return None

        class FakeImageModule:
            @staticmethod
            def open(path: Path) -> FakeImage:
                return FakeImage()

        fake_pil = types.ModuleType("PIL")
        fake_pil.Image = FakeImageModule

        fake_pytesseract = types.ModuleType("pytesseract")
        fake_pytesseract.image_to_string = lambda image, lang="eng": f"{lang}: OCR job description text"

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "jd.png"
            path.write_bytes(b"fake image")

            with patch.dict(os.environ, {}, clear=True), patch.dict(
                sys.modules, {"PIL": fake_pil, "pytesseract": fake_pytesseract}
            ):
                content = read_required_input_text(path, "Job description")

            self.assertEqual(content, "chi_sim+eng: OCR job description text")

    def test_image_ocr_respects_ocr_lang_environment_override(self) -> None:
        class FakeImage:
            def __enter__(self) -> "FakeImage":
                return self

            def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
                return None

        class FakeImageModule:
            @staticmethod
            def open(path: Path) -> FakeImage:
                return FakeImage()

        fake_pil = types.ModuleType("PIL")
        fake_pil.Image = FakeImageModule

        fake_pytesseract = types.ModuleType("pytesseract")
        fake_pytesseract.image_to_string = lambda image, lang="eng": f"{lang}: OCR text"

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "jd.png"
            path.write_bytes(b"fake image")

            with patch.dict(os.environ, {"OCR_LANG": "eng"}), patch.dict(
                sys.modules, {"PIL": fake_pil, "pytesseract": fake_pytesseract}
            ):
                content = read_required_input_text(path, "Job description")

            self.assertEqual(content, "eng: OCR text")

    def test_image_ocr_reports_missing_chinese_language_data(self) -> None:
        class FakeImage:
            def __enter__(self) -> "FakeImage":
                return self

            def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
                return None

        class FakeImageModule:
            @staticmethod
            def open(path: Path) -> FakeImage:
                return FakeImage()

        fake_pil = types.ModuleType("PIL")
        fake_pil.Image = FakeImageModule

        fake_pytesseract = types.ModuleType("pytesseract")
        fake_pytesseract.get_languages = lambda config="": ["eng", "osd"]
        fake_pytesseract.image_to_string = lambda image, lang="eng": "should not run"

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "jd.png"
            path.write_bytes(b"fake image")

            with patch.dict(os.environ, {}, clear=True), patch.dict(
                sys.modules, {"PIL": fake_pil, "pytesseract": fake_pytesseract}
            ):
                with self.assertRaises(InputValidationError) as context:
                    read_required_input_text(path, "Job description")

            message = str(context.exception)
            self.assertIn("chi_sim", message)
            self.assertIn("brew install tesseract-lang", message)
            self.assertIn("OCR_LANG=chi_sim+eng", message)


if __name__ == "__main__":
    unittest.main()
