"""Read/output schemas for portfolio data (public API)."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator


# -- Helpers ----------------------------------------------------------------
def _strip_whitespace(cls, v: str) -> str:
    """Reusable field-level validator stripping leading/trailing whitespace."""
    if isinstance(v, str):
        return v.strip()
    return v


# -- Profile ----------------------------------------------------------------
class ProfileOut(BaseModel):
    name: str
    role: str
    tagline: str
    location: str
    email: str
    phone: str = ""
    resume_url: str = ""
    avatar: str = ""
    summary: str
    bio: str
    interests: list[str]
    career_goals: list[str]
    highlights: list[dict]
    socials: dict
    avatar_colors: dict

    model_config = {"from_attributes": True}


# -- Skills -----------------------------------------------------------------
class SkillOut(BaseModel):
    id: int
    name: str
    category: str
    keywords: list[str]
    icon: str

    model_config = {"from_attributes": True}


class SkillGroup(BaseModel):
    category: str
    skills: list[SkillOut]


# -- Projects ---------------------------------------------------------------
class ProjectOut(BaseModel):
    id: int
    title: str
    category: str
    short_description: str
    description: str
    features: list[str]
    contribution: str
    technologies: list[str]
    github_url: str
    live_url: str
    image: str
    featured: bool
    order: int

    model_config = {"from_attributes": True}


# -- Experience -------------------------------------------------------------
class ExperienceOut(BaseModel):
    id: int
    company: str
    position: str
    location: str
    start_date: str
    end_date: str
    current: bool
    responsibilities: list[str]
    technologies: list[str]
    order: int

    model_config = {"from_attributes": True}


# -- Education --------------------------------------------------------------
class EducationOut(BaseModel):
    id: int
    institution: str
    degree: str
    location: str
    start_date: str
    end_date: str
    current: bool
    details: list[str]
    grades: dict

    model_config = {"from_attributes": True}


# -- Certifications ---------------------------------------------------------
class CertificationOut(BaseModel):
    id: int
    name: str
    organization: str
    issuer: str
    date: str
    credential_url: str

    model_config = {"from_attributes": True}


# -- Contact (for the public API contract) ----------------------------------
class ContactIn(BaseModel):
    """Validated payload from the public contact form."""

    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(default="Message from portfolio", max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    website: str = ""  # honeypot — must stay empty

    model_config = {"from_attributes": False}

    @field_validator("name", mode="before")
    @classmethod
    def _clean_name(cls, v: str) -> str:
        return v.strip()

    @field_validator("message", mode="before")
    @classmethod
    def _clean_message(cls, v: str) -> str:
        return v.strip()


class ContactOut(BaseModel):
    success: bool
    message: str


# -- Generic list wrapper ---------------------------------------------------
class ProjectListOut(BaseModel):
    projects: list[ProjectOut]


class SkillListOut(BaseModel):
    skills: list[SkillOut]


class ExperienceListOut(BaseModel):
    experiences: list[ExperienceOut]


class EducationListOut(BaseModel):
    education: list[EducationOut]


class CertificationListOut(BaseModel):
    certifications: list[CertificationOut]


# -- Testimonials -----------------------------------------------------------
class TestimonialOut(BaseModel):
    id: int
    name: str
    role: str
    text: str
    relation: str

    model_config = {"from_attributes": True}