"""Models package: import all models so they register on Base.metadata."""

from app.models.portfolio import (  # noqa: F401
    AdminUser,
    Certification,
    ContactMessage,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    Testimonial,
)

__all__ = [
    "Profile",
    "Skill",
    "Project",
    "Experience",
    "Education",
    "Certification",
    "ContactMessage",
    "AdminUser",
    "Testimonial",
]