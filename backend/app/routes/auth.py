"""Authentication routes: login (issues JWT) and current-user info."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, require_admin, verify_password
from app.database import get_db
from app.models import AdminUser
from app.schemas import LoginIn, TokenOut, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()

    # Same response for unknown user / wrong password (don't leak which).
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token, expires_in = create_access_token(str(user.id), role=user.role)
    return TokenOut(access_token=token, token_type="bearer", expires_in=expires_in, role=user.role)


@router.get("/me", response_model=UserOut)
def me(current: AdminUser = Depends(require_admin)) -> AdminUser:
    return current