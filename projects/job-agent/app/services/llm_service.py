from __future__ import annotations

import json
import urllib.error
import urllib.request

from app.config import Settings
from app.errors import LLMServiceError


class LLMService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @property
    def enabled(self) -> bool:
        return bool(self.settings.llm_api_key) and not self.settings.use_mock_llm

    def complete(self, system_prompt: str, user_prompt: str) -> str:
        if not self.enabled:
            raise LLMServiceError("LLM is not configured. Use mock mode or add an API key.")

        url = f"{self.settings.llm_base_url.rstrip('/')}/chat/completions"
        payload = {
            "model": self.settings.llm_model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        body = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.settings.llm_api_key}",
        }
        request = urllib.request.Request(url, data=body, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(
                request,
                timeout=self.settings.llm_timeout_seconds,
            ) as response:
                response_body = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            raise LLMServiceError(f"LLM request failed with HTTP {exc.code}.") from exc
        except urllib.error.URLError as exc:
            raise LLMServiceError(f"LLM request failed: {exc.reason}") from exc
        except (TimeoutError, OSError, ValueError) as exc:
            raise LLMServiceError("LLM request could not be completed.") from exc

        try:
            parsed = json.loads(response_body)
        except json.JSONDecodeError as exc:
            raise LLMServiceError("LLM response was not valid JSON.") from exc

        if not isinstance(parsed, dict):
            raise LLMServiceError("LLM response was not a JSON object.")

        choices = parsed.get("choices", [])
        if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
            raise LLMServiceError("LLM response did not include any choices.")

        message = choices[0].get("message", {})
        if not isinstance(message, dict):
            raise LLMServiceError("LLM response message was invalid.")

        raw_content = message.get("content", "")
        if not isinstance(raw_content, str):
            raise LLMServiceError("LLM response content was invalid.")

        content = raw_content.strip()
        if not content:
            raise LLMServiceError("LLM response content was empty.")

        return content
