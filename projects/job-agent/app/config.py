from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        cleaned_value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), cleaned_value)


@dataclass(slots=True)
class Settings:
    project_name: str
    llm_base_url: str
    llm_api_key: str
    llm_model: str
    llm_timeout_seconds: int
    use_mock_llm: bool

    @classmethod
    def load(cls, env_path: Path | None = None) -> "Settings":
        if env_path is None:
            env_path = Path(".env")

        load_env_file(env_path)

        api_key = os.getenv("LLM_API_KEY", "").strip()
        use_mock_raw = os.getenv("USE_MOCK_LLM")
        if use_mock_raw is None:
            use_mock = not api_key
        else:
            use_mock = use_mock_raw.strip().lower() in {"1", "true", "yes", "on"}

        return cls(
            project_name="job-agent",
            llm_base_url=os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").strip(),
            llm_api_key=api_key,
            llm_model=os.getenv("LLM_MODEL", "gpt-4.1-mini").strip(),
            llm_timeout_seconds=int(os.getenv("LLM_TIMEOUT_SECONDS", "30").strip()),
            use_mock_llm=use_mock,
        )
