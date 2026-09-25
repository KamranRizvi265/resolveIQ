"""App configuration from Streamlit secrets or environment variables."""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_LLM_MODEL = "openai/gpt-oss-120b"


def get_secret(key: str, default: str | None = None) -> str | None:
    """Read a config value from os.getenv (local)."""
    return os.getenv(key, default)


def get_groq_api_key() -> str | None:
    return get_secret("GROQ_API_KEY")


def get_llm_model_name() -> str:
    model = get_secret("LLM_MODEL_NAME", DEFAULT_LLM_MODEL) or DEFAULT_LLM_MODEL
    model = model.strip().strip('"').strip("'")
    if model.startswith("groq/"):
        model = model.removeprefix("groq/")
    return model
