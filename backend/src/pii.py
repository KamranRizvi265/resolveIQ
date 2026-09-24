"""Deterministic pseudonymization for sensitive values in incident text."""

from __future__ import annotations

import hashlib
import hmac
import os
import re


_EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
_PHONE_RE = re.compile(r"(?<!\w)(?:\+?\d[\d().\- ]{7,}\d)(?!\w)")
_SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_CARD_RE = re.compile(r"\b(?:\d[ -]?){13,19}\b")
_LABELED_ID_RE = re.compile(
    r"(?P<label>\b(?:tax[\s_]id|account(?:[\s_]number)?|customer[\s_]id|customer[\s_]name|user[\s_]id)\b\s*[:=]\s*)"
    r"(?P<value>[A-Z0-9][A-Z0-9._/-]{2,})",
    re.IGNORECASE,
)


def _hash_key() -> bytes:
    configured_key = os.getenv("PII_HASH_KEY")
    if configured_key:
        return configured_key.encode("utf-8")
    return b"resolveiq-demo-pii-key-change-in-production"


def _token(kind: str, value: str) -> str:
    digest = hmac.new(_hash_key(), value.encode("utf-8"), hashlib.sha256).hexdigest()[:12]
    return f"[{kind}_{digest}]"


def sanitize_text(text: str) -> str:
    """Replace common direct identifiers with stable, non-reversible tokens."""
    sanitized = _EMAIL_RE.sub(lambda match: _token("EMAIL", match.group(0)), text)
    sanitized = _PHONE_RE.sub(lambda match: _token("PHONE", match.group(0)), sanitized)
    sanitized = _SSN_RE.sub(lambda match: _token("SSN", match.group(0)), sanitized)
    sanitized = _CARD_RE.sub(lambda match: _token("CARD", match.group(0)), sanitized)

    def replace_labeled_id(match: re.Match[str]) -> str:
        return f"{match.group('label')}{_token('ID', match.group('value'))}"

    return _LABELED_ID_RE.sub(replace_labeled_id, sanitized)