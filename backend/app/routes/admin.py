"""Admin CRUD routes for all portfolio content.

All write endpoints require a valid admin JWT (see ``auth.deps.require_admin``).
A small per-model router factory keeps the six content resources consistent
without duplicating endpoint code.
"""

from __future__ import annotations

from typing import Type

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import (
    AdminUser,
    Certification,
    ContactMessage,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
)
from app.schemas import (
    CertificationIn,
    EducationIn,
    ExperienceIn,
    MessageUpdate,
    ProfileIn,
    ProjectIn,
    SkillIn,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _get_or_404(db: Session, model: Type, item_id: int):
    obj = db.get(model, item_id)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return obj


def _update_fields(obj, data: BaseModel) -> None:
    """Apply validated schema fields onto an ORM object."""
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)


def _make_router(model: Type, schema_in: Type[BaseModel], path: str, tag: str) -> APIRouter:
    """Build a standard CRUD sub-router for one content model."""
    r = APIRouter(prefix=f"/{path}", tags=[tag])

    @r.post("", response_model=dict)
    def create(
        payload: schema_in,
        db: Session = Depends(get_db),
        _: AdminUser = Depends(require_admin),
    ) -> dict:
        obj = model(**payload.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return {"id": obj.id, "message": f"{model.__name__} created"}

    @r.put("/{item_id}", response_model=dict)
    def update(
        item_id: int,
        payload: schema_in,
        db: Session = Depends(get_db),
        _: AdminUser = Depends(require_admin),
    ) -> dict:
        obj = _get_or_404(db, model, item_id)
        _update_fields(obj, payload)
        db.commit()
        return {"id": obj.id, "message": f"{model.__name__} updated"}

    @r.delete("/{item_id}", response_model=dict)
    def delete(
        item_id: int,
        db: Session = Depends(get_db),
        _: AdminUser = Depends(require_admin),
    ) -> dict:
        obj = _get_or_404(db, model, item_id)
        db.delete(obj)
        db.commit()
        return {"id": item_id, "message": f"{model.__name__} deleted"}

    return r


router.include_router(_make_router(Skill, SkillIn, "skills", "skills"))
router.include_router(_make_router(Project, ProjectIn, "projects", "projects"))
router.include_router(_make_router(Experience, ExperienceIn, "experience", "experience"))
router.include_router(_make_router(Education, EducationIn, "education", "education"))
router.include_router(_make_router(Certification, CertificationIn, "certifications", "certifications"))


# -- Profile (single row) ----------------------------------------------------
@router.put("/profile", response_model=dict)
def update_profile(
    payload: ProfileIn,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(require_admin),
) -> dict:
    profile = db.query(Profile).order_by(Profile.id.asc()).first()
    if profile is None:
        profile = Profile(**payload.model_dump())
        db.add(profile)
    else:
        _update_fields(profile, payload)
    db.commit()
    db.flush()
    return {"id": profile.id, "message": "Profile updated"}


# -- Contact messages --------------------------------------------------------
@router.get("/messages", response_model=list[dict])
def list_messages(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(require_admin),
) -> list[dict]:
    rows = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "subject": m.subject,
            "message": m.message,
            "handled": m.handled,
            "created_at": m.created_at.isoformat(),
        }
        for m in rows
    ]


@router.patch("/messages/{message_id}", response_model=dict)
def update_message(
    message_id: int,
    payload: MessageUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(require_admin),
) -> dict:
    msg = _get_or_404(db, ContactMessage, message_id)
    msg.handled = payload.handled
    db.commit()
    return {"id": msg.id, "handled": msg.handled}


# -- Admin helpers -----------------------------------------------------------
@router.get("/stats", response_model=dict)
def stats(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(require_admin),
) -> dict:
    return {
        "messages": db.query(ContactMessage).count(),
        "unhandled_messages": db.query(ContactMessage).filter(ContactMessage.handled.is_(False)).count(),
        "projects": db.query(Project).count(),
        "skills": db.query(Skill).count(),
    }