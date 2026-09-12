"""Authentication dependencies (bearer token -> current admin)."""

from __future__ import annotations

from http import HTTPStatus

import jwt as _jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.jwt import decode_token
from app.database import get_db
from app.models import AdminUser

_bearer = HTTPBearer(auto_error=False)


def _unauthorized(detail: str = "Not authorized") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> AdminUser:
    """FastAPI dependency returning the authenticated AdminUser."""
    if credentials is None:
        raise _unauthorized("Missing bearer token")

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except _jwt.ExpiredSignatureError as exc:
        raise _unauthorized("Token expired") from exc
    except _jwt.InvalidTokenError as exc:
        raise _unauthorized("Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise _unauthorized("Invalid token claims")

    user = db.get(AdminUser, int(user_id))
    if user is None:
        raise _unauthorized("User no longer exists")

    return user


def require_admin(user: AdminUser = Depends(get_current_user)) -> AdminUser:
    """FastAPI dependency requiring the admin role."""
    if user.role != "admin":
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Admin access required")
    return user