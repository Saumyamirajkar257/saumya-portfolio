"""SQLAlchemy declarative base shared by all models."""

from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all ORM models."""


class BaseMixin:
    """Common columns/behaviors reused across content models."""