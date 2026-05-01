from __future__ import annotations

from pathlib import Path

from app.errors import InputValidationError


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def read_required_text(path: Path, label: str) -> str:
    if not path.exists():
        raise InputValidationError(f"{label} file does not exist: {path}")

    if not path.is_file():
        raise InputValidationError(f"{label} path is not a file: {path}")

    content = read_text(path)
    if not content.strip():
        raise InputValidationError(f"{label} file is empty: {path}")

    return content


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def load_prompt(name: str) -> str:
    prompt_path = Path(__file__).resolve().parents[1] / "prompts" / name
    return read_text(prompt_path)
