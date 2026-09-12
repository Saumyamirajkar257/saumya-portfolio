"""Auth package: password hashing, JWT helpers and FastAPI dependencies."""

from app.auth.deps import get_current_user, require_admin
from app.auth.jwt import create_access_token, decode_token
from app.auth.passwords import hash_password, verify_password

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_token",
    "get_current_user",
    "require_admin",
]