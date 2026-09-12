"""Application configuration loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ parent directory so .env lives next to the app
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", str(BACKEND_DIR / ".env")),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # -- Core ---------------------------------------------------------------
    APP_NAME: str = "Saumya Mirajkar Portfolio API"
    ENV: str = "development"  # development | production
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"

    # -- Database -----------------------------------------------------------
    # SQLite for local dev; swap to a PostgreSQL URL in production:
    # e.g. postgresql+psycopg://user:pass@host:5432/portfolio
    DATABASE_URL: str = "sqlite:///./portfolio.db"

    # -- CORS ---------------------------------------------------------------
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # -- Auth / Admin -------------------------------------------------------
    JWT_SECRET_KEY: str = "change-me-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    ADMIN_USERNAME: str = "admin"
    # Password is hashed with bcrypt at first login if it's the default value
    # so the plaintext never touches persistence.
    ADMIN_PASSWORD: str = "change-me-admin-password"
    ADMIN_ROLE: str = "admin"

    # -- Contact form / Email ----------------------------------------------
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "portfolio@localhost"
    SMTP_USE_TLS: bool = True
    CONTACT_TO: str = "saumyamirajkar25@icloud.com"
    # Formd/Resend-style webhook support for serverless email delivery when no SMTP is set
    # (kept empty unless you use Formspree-style endpoints).
    FORMSPREE_ENDPOINT: str = ""

    # -- Frontend -----------------------------------------------------------
    FRONTEND_URL: str = "http://localhost:3000"

    # -- Rate limiting ------------------------------------------------------
    RATE_LIMIT_PER_WINDOW: int = 5          # messages per window per IP
    RATE_LIMIT_WINDOW_SECONDS: int = 300    # 5 minutes

    # -- Fields -------------------------------------------------------------

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, v):  # type: ignore[no-untyped-def]
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.ENV.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()