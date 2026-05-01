from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

from app.errors import InputValidationError
from app.utils.file_io import read_text


TEXT_EXTENSIONS = {".txt", ".md", ".markdown"}
RTF_EXTENSIONS = {".rtf"}
PDF_EXTENSIONS = {".pdf"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
MACOS_TEXT_PACKAGE_FILES = ("TXT.rtf", "Text.rtf")
DEFAULT_OCR_LANG = "chi_sim+eng"
OCR_LANG_ENV_VAR = "OCR_LANG"


def read_required_input_text(path: Path, label: str) -> str:
    _validate_existing_path(path, label)

    if path.is_dir():
        content = _extract_macos_text_package(path, label)
        if not content.strip():
            raise InputValidationError(f"{label} file did not contain extractable text: {path}")
        return content

    suffix = path.suffix.lower()
    if suffix in TEXT_EXTENSIONS:
        content = read_text(path)
    elif suffix in RTF_EXTENSIONS:
        content = _extract_rtf_text(path, label)
    elif suffix in PDF_EXTENSIONS:
        content = _extract_pdf_text(path, label)
    elif suffix in IMAGE_EXTENSIONS:
        content = _extract_image_text(path, label)
    else:
        supported = ", ".join(
            sorted(TEXT_EXTENSIONS | RTF_EXTENSIONS | PDF_EXTENSIONS | IMAGE_EXTENSIONS)
        )
        raise InputValidationError(
            f"{label} file type is not supported: {path.suffix or '<none>'}. "
            f"Supported file types: {supported}"
        )

    if not content.strip():
        raise InputValidationError(f"{label} file did not contain extractable text: {path}")

    return content


def _validate_existing_path(path: Path, label: str) -> None:
    if not path.exists():
        raise InputValidationError(f"{label} file does not exist: {path}")

    if not path.is_file() and not path.is_dir():
        raise InputValidationError(f"{label} path is not a file: {path}")


def _extract_macos_text_package(path: Path, label: str) -> str:
    for file_name in MACOS_TEXT_PACKAGE_FILES:
        rtf_path = path / file_name
        if rtf_path.is_file():
            return _extract_rtf_text(rtf_path, label)

    raise InputValidationError(
        f"{label} path is a directory, not a supported text package: {path}"
    )


def _extract_rtf_text(path: Path, label: str) -> str:
    if shutil.which("textutil") is None:
        raise InputValidationError(
            f"{label} RTF input requires macOS textutil or a plain .txt export: {path}"
        )

    try:
        completed = subprocess.run(
            ["textutil", "-convert", "txt", "-stdout", str(path)],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as exc:
        raise InputValidationError(f"Could not extract text from {label} RTF: {path}") from exc

    return completed.stdout


def _extract_pdf_text(path: Path, label: str) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise InputValidationError(
            f"{label} PDF input requires the optional dependency 'pypdf'. "
            "Install project dependencies with: pip install -r requirements.txt"
        ) from exc

    try:
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        raise InputValidationError(
            f"Could not extract text from {label} PDF: {path}. "
            "If this is a scanned PDF, use an OCR image input or export the PDF as text."
        ) from exc


def _extract_image_text(path: Path, label: str) -> str:
    try:
        from PIL import Image
    except ImportError as exc:
        raise InputValidationError(
            f"{label} image input requires the optional dependency 'Pillow'. "
            "Install project dependencies with: pip install -r requirements.txt"
        ) from exc

    try:
        import pytesseract
    except ImportError as exc:
        raise InputValidationError(
            f"{label} image input requires the optional dependency 'pytesseract'. "
            "Install project dependencies with: pip install -r requirements.txt"
        ) from exc

    ocr_lang = _get_ocr_lang()

    try:
        _validate_tesseract_languages(pytesseract, ocr_lang, label, path)
        with Image.open(path) as image:
            return pytesseract.image_to_string(image, lang=ocr_lang)
    except InputValidationError:
        raise
    except Exception as exc:
        raise InputValidationError(_build_ocr_error_message(label, path, ocr_lang)) from exc


def _get_ocr_lang() -> str:
    return os.getenv(OCR_LANG_ENV_VAR, DEFAULT_OCR_LANG).strip() or DEFAULT_OCR_LANG


def _validate_tesseract_languages(
    pytesseract_module: object, requested_lang: str, label: str, path: Path
) -> None:
    if not hasattr(pytesseract_module, "get_languages"):
        return

    try:
        available_languages = set(pytesseract_module.get_languages(config=""))
    except Exception as exc:
        raise InputValidationError(_build_ocr_error_message(label, path, requested_lang)) from exc

    missing_languages = [
        lang
        for lang in requested_lang.split("+")
        if lang and lang not in available_languages
    ]
    if missing_languages:
        missing = ", ".join(missing_languages)
        available = ", ".join(sorted(available_languages)) or "<none>"
        raise InputValidationError(
            f"Could not OCR {label} image: {path}. "
            f"Tesseract is missing OCR language data: {missing}. "
            f"Available languages: {available}. "
            f"For Chinese screenshots, install language data with: brew install tesseract-lang. "
            f"Then confirm with: tesseract --list-langs. "
            f"You can override the OCR language with {OCR_LANG_ENV_VAR}=chi_sim+eng."
        )


def _build_ocr_error_message(label: str, path: Path, ocr_lang: str) -> str:
    return (
        f"Could not OCR {label} image: {path}. "
        "Make sure the Tesseract OCR app is installed and available on PATH. "
        f"The current OCR language is '{ocr_lang}'. "
        "For Chinese screenshots, install language data with: brew install tesseract-lang. "
        "Then confirm 'chi_sim' appears in: tesseract --list-langs. "
        f"You can override the OCR language with {OCR_LANG_ENV_VAR}=chi_sim+eng."
    )
