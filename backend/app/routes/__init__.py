"""Route package."""

from fastapi import APIRouter

from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.contact import router as contact_router
from app.routes.public import router as public_router

api_router = APIRouter()
api_router.include_router(public_router)
api_router.include_router(contact_router)
api_router.include_router(auth_router)
api_router.include_router(admin_router)

__all__ = ["api_router"]