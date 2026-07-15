from __future__ import annotations


class JobAgentError(Exception):
    """Base error for user-facing Job Agent failures."""


class InputValidationError(JobAgentError):
    """Raised when a required input file is missing or unusable."""


class LLMServiceError(JobAgentError):
    """Raised when the configured LLM provider cannot return usable content."""
