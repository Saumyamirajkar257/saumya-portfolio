"""Database seeder.

Populates an empty database with the resume content from ``content.py`` and
ensures the admin user exists (password from environment, hashed with bcrypt).
Idempotent: safe to run on every startup.
"""

from __future__ import annotations

from logging import getLogger

from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import get_settings
from app.models import (
    AdminUser,
    Certification,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    Testimonial,
)
from app.seed.content import SEED_CONTENT

logger = getLogger(__name__)
settings = get_settings()


def _seed_single(db: Session, model, payload: dict) -> None:
    """Create one record from a dict of column values (keeps this compact)."""
    record = model(**payload)
    db.add(record)


def seed_database(db: Session) -> None:
    """Seed content only when the relevant tables are empty."""
    # ---- Profile ---
    if db.query(Profile).count() == 0:
        db.add(Profile(**SEED_CONTENT["profile"]))
        logger.info("Seeded profile")

    # ---- Skills ---
    if db.query(Skill).count() == 0:
        for s in SEED_CONTENT["skills"]:
            _seed_single(db, Skill, s)
        logger.info("Seeded %d skills", len(SEED_CONTENT["skills"]))

    # ---- Projects ---
    if db.query(Project).count() == 0:
        for p in SEED_CONTENT["projects"]:
            _seed_single(db, Project, p)
        logger.info("Seeded %d projects", len(SEED_CONTENT["projects"]))

    # ---- Experience ---
    if db.query(Experience).count() == 0:
        for e in SEED_CONTENT["experiences"]:
            _seed_single(db, Experience, e)
        logger.info("Seeded %d experiences", len(SEED_CONTENT["experiences"]))

    # ---- Education ---
    if db.query(Education).count() == 0:
        for e in SEED_CONTENT["education"]:
            _seed_single(db, Education, e)
        logger.info("Seeded %d education records", len(SEED_CONTENT["education"]))

    # ---- Certifications ---
    if db.query(Certification).count() == 0:
        for c in SEED_CONTENT["certifications"]:
            _seed_single(db, Certification, c)
        logger.info("Seeded %d certifications", len(SEED_CONTENT["certifications"]))

    # ---- Testimonials ---
    if db.query(Testimonial).count() == 0:
        for t in SEED_CONTENT["testimonials"]:
            _seed_single(db, Testimonial, t)
        logger.info("Seeded %d testimonials", len(SEED_CONTENT["testimonials"]))

    # ---- Admin user (upsert) ---
    _seed_admin(db)

    db.commit()


def _seed_admin(db: Session) -> None:
    admin = db.query(AdminUser).filter(AdminUser.username == settings.ADMIN_USERNAME).first()
    if admin is None:
        admin = AdminUser(
            username=settings.ADMIN_USERNAME,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role=settings.ADMIN_ROLE,
        )
        db.add(admin)
        logger.info("Created admin user '%s'", settings.ADMIN_USERNAME)
    else:
        # If the password still equals the insecure default, rehash live so the
        # plaintext default is never persisted. For real deployments operators
        # change ADMIN_PASSWORD via environment variables anyway.
        if settings.ADMIN_PASSWORD != "change-me-admin-password":
            candidate = hash_password(settings.ADMIN_PASSWORD)
            if not _password_matches(admin, settings.ADMIN_PASSWORD):
                admin.password_hash = candidate
                logger.info("Updated admin password hash for '%s'", settings.ADMIN_USERNAME)


def _password_matches(admin: AdminUser, plain: str) -> bool:
    from app.auth import verify_password

    return verify_password(plain, admin.password_hash)