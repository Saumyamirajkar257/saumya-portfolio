"""Admin write schemas for create/update operations."""

from __future__ import annotations

import re

from pydantic import BaseModel, Field, EmailStr, field_validator


def _strip(value, *args):  # pragma: no cover - tiny helper
    return value.strip()


class _CleanModel(BaseModel):
    """Base model that trims string fields on validation."""

    @field_validator("*", mode="before")
    @classmethod
    def _trim_strings(cls, v):  # type: ignore[no-untyped-def]
        if isinstance(v, str):
            return v.strip()
        return v


class ProfileIn(_CleanModel):
    name: str = Field(min_length=1, max_length=120)
    role: str = Field(min_length=1, max_length=160)
    tagline: str = Field(default="", max_length=240)
    location: str = Field(default="", max_length=160)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    resume_url: str = Field(default="", max_length=300)
    avatar: str = Field(default="", max_length=300)
    summary: str = Field(default="", max_length=4000)
    bio: str = Field(default="", max_length=8000)
    interests: list[str] = Field(default_factory=list)
    career_goals: list[str] = Field(default_factory=list)
    highlights: list[dict] = Field(default_factory=list)
    socials: dict = Field(default_factory=dict)
    avatar_colors: dict = Field(default_factory=dict)


class SkillIn(_CleanModel):
    name: str = Field(min_length=1, max_length=80)
    category: str = Field(min_length=1, max_length=80)
    keywords: list[str] = Field(default_factory=list)
    icon: str = Field(default="", max_length=40)
    order: int = Field(default=0, ge=0)


class ProjectIn(_CleanModel):
    title: str = Field(min_length=1, max_length=160)
    category: str = Field(default="General", max_length=80)
    short_description: str = Field(default="", max_length=2000)
    description: str = Field(default="", max_length=12000)
    features: list[str] = Field(default_factory=list)
    contribution: str = Field(default="", max_length=8000)
    technologies: list[str] = Field(default_factory=list)
    github_url: str = Field(default="", max_length=300)
    live_url: str = Field(default="", max_length=300)
    image: str = Field(default="", max_length=300)
    featured: bool = False
    order: int = Field(default=0, ge=0)


class ExperienceIn(_CleanModel):
    company: str = Field(min_length=1, max_length=160)
    position: str = Field(min_length=1, max_length=160)
    location: str = Field(default="", max_length=160)
    start_date: str = Field(default="", max_length=20)
    end_date: str = Field(default="Present", max_length=20)
    current: bool = False
    responsibilities: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    order: int = Field(default=0, ge=0)


class EducationIn(_CleanModel):
    institution: str = Field(min_length=1, max_length=200)
    degree: str = Field(min_length=1, max_length=200)
    location: str = Field(default="", max_length=160)
    start_date: str = Field(default="", max_length=20)
    end_date: str = Field(default="Present", max_length=20)
    current: bool = False
    details: list[str] = Field(default_factory=list)
    grades: dict = Field(default_factory=dict)
    order: int = Field(default=0, ge=0)


class CertificationIn(_CleanModel):
    name: str = Field(min_length=1, max_length=200)
    organization: str = Field(default="", max_length=160)
    issuer: str = Field(default="", max_length=200)
    date: str = Field(default="", max_length=20)
    credential_url: str = Field(default="", max_length=300)
    order: int = Field(default=0, ge=0)


class LoginIn(_CleanModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=8)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str

    model_config = {"from_attributes": True}


class MessageUpdate(_CleanModel):
    handled: bool = True