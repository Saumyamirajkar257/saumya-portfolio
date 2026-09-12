"""Public read endpoints serving portfolio content to the frontend.

All content is read from the database — the frontend never hardcodes resume
data. Adding an endpoint here + in the frontend's API client is all that's
needed to expose a new content type.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Certification, Education, Experience, Profile, Project, Skill, Testimonial
from app.schemas import (
    CertificationOut,
    EducationOut,
    ExperienceOut,
    ProfileOut,
    ProjectOut,
    SkillOut,
    TestimonialOut,
)

router = APIRouter(prefix="/api", tags=["content"])


# -- Profile -----------------------------------------------------------------
@router.get("/profile", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db)) -> Profile:
    profile = db.query(Profile).order_by(Profile.id.asc()).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found. Run the seeder.")
    return profile


# -- Skills ------------------------------------------------------------------
@router.get("/skills", response_model=list[SkillOut])
def get_skills(db: Session = Depends(get_db)) -> list[Skill]:
    return db.query(Skill).order_by(Skill.category.asc(), Skill.order.asc()).all()


# -- Projects ----------------------------------------------------------------
@router.get("/projects", response_model=list[ProjectOut])
def get_projects(db: Session = Depends(get_db)) -> list[Project]:
    return db.query(Project).order_by(Project.featured.desc(), Project.order.asc()).all()


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# -- Experience --------------------------------------------------------------
@router.get("/experience", response_model=list[ExperienceOut])
def get_experience(db: Session = Depends(get_db)) -> list[Experience]:
    return db.query(Experience).order_by(Experience.order.asc()).all()


# -- Education ---------------------------------------------------------------
@router.get("/education", response_model=list[EducationOut])
def get_education(db: Session = Depends(get_db)) -> list[Education]:
    return db.query(Education).order_by(Education.order.asc()).all()


# -- Certifications ----------------------------------------------------------
@router.get("/certifications", response_model=list[CertificationOut])
def get_certifications(db: Session = Depends(get_db)) -> list[Certification]:
    return db.query(Certification).order_by(Certification.order.asc()).all()


# -- Testimonials -----------------------------------------------------------
@router.get("/testimonials", response_model=list[TestimonialOut])
def get_testimonials(db: Session = Depends(get_db)) -> list[Testimonial]:
    return db.query(Testimonial).order_by(Testimonial.created_at.desc()).all()


# -- Aggregate ---------------------------------------------------------------
@router.get("/content")
def get_all_content(db: Session = Depends(get_db)) -> dict:
    """One call for the whole homepage — fewer round trips in production."""
    profile = db.query(Profile).order_by(Profile.id.asc()).first()
    return {
        "profile": ProfileOut.model_validate(profile).model_dump() if profile else None,
        "skills": [SkillOut.model_validate(s).model_dump() for s in db.query(Skill).order_by(Skill.category.asc(), Skill.order.asc()).all()],
        "projects": [ProjectOut.model_validate(p).model_dump() for p in db.query(Project).order_by(Project.featured.desc(), Project.order.asc()).all()],
        "experience": [ExperienceOut.model_validate(e).model_dump() for e in db.query(Experience).order_by(Experience.order.asc()).all()],
        "education": [EducationOut.model_validate(e).model_dump() for e in db.query(Education).order_by(Education.order.asc()).all()],
        "certifications": [CertificationOut.model_validate(c).model_dump() for c in db.query(Certification).order_by(Certification.order.asc()).all()],
        "testimonials": [TestimonialOut.model_validate(t).model_dump() for t in db.query(Testimonial).order_by(Testimonial.created_at.desc()).all()],
    }