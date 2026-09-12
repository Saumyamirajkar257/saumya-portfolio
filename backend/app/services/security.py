"""Input sanitization helpers.

We strip HTML/special characters from user-supplied strings so nothing user
controlled is ever rendered as markup, and remove control characters that can
break logs or email headers.
"""

from __future__ import annotations

import html
import re
import unicodedata

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_URL_SCHEMES = re.compile(r"[a-zA-Z][a-zA-Z0-9+.\-]*://")
_ALLOWED_URL_REGEX = re.compile(r"^https?://", re.IGNORECASE)


def strip_control(s: str) -> str:
    """Remove ASCII control characters that could corrupt logs/headers."""
    if not s:
        return s
    return _CONTROL_CHARS.sub("", s)


def sanitize_text(value: str, max_length: int = 5000) -> str:
    """Strip HTML, control chars, normalize whitespace, enforce a max length."""
    if value is None:
        return ""
    value = unicodedata.normalize("NFKC", str(value))
    value = strip_control(value)
    value = html.escape(value, quote=True)
    value = re.sub(r"\s+", " ", value)
    return value.strip()[:max_length]


def sanitize_url(value: str) -> str:
    """Allow only http/https URLs (empty allowed); block javascript:, data: etc."""
    if not value:
        return ""
    value = sanitize_text(value, max_length=300)
    return value if _ALLOWED_URL_REGEX.match(value) else ""


def sanitize_email_header(value: str) -> str:
    """Sanitize a value destined for an SMTP From/To header (injection guard)."""
    return re.sub(r"[\r\n]", " ", strip_control(value)).strip()