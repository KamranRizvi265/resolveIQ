"""App configuration from Streamlit secrets or environment variables."""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_LLM_MODEL = "llama3.1-70b"


def get_secret(key: str, default: str | None = None) -> str | None:
    """Read a config value from os.getenv (local)."""
    return os.getenv(key, default)


def get_snowflake_pat() -> str | None:
    return get_secret("SNOWFLAKE_PAT")


def get_snowflake_account_identifier() -> str | None:
    return get_secret("SNOWFLAKE_ACCOUNT_IDENTIFIER")


def get_snowflake_cortex_base_url() -> str | None:
    configured_url = get_secret("SNOWFLAKE_CORTEX_BASE_URL")
    if configured_url:
        return configured_url.rstrip("/")

    account_identifier = get_snowflake_account_identifier()
    if not account_identifier:
        return None
    return (
        f"https://{account_identifier}.snowflakecomputing.com"
        "/api/v2/cortex/v1"
    )


def get_llm_model_name() -> str:
    model = get_secret("LLM_MODEL_NAME", DEFAULT_LLM_MODEL) or DEFAULT_LLM_MODEL
    model = model.strip().strip('"').strip("'")
    if model.startswith("openai/"):
        model = model.replace("openai/", "openai-", 1)
    return model
