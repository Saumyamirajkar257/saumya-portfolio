"""FastAPI application factory.

Run with:  uvicorn app.main:app --reload --port 8000
       or:  python run.py
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal, init_db
from app.routes import api_router
from app.seed import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Create tables + seed once at startup."""
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    logger.info("%s ready", settings.APP_NAME)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Portfolio API — serves resume content, powers the contact form and admin panel.",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url=None,
)


# -- CORS ---------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -- Routers ------------------------------------------------------------------
app.include_router(api_router)


# -- Health -------------------------------------------------------------------
@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.ENV}


# -- Error handling -----------------------------------------------------------
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    if settings.is_production:
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})
    # Development: keep the conversation debuggable.
    return JSONResponse(status_code=500, content={"detail": f"Internal server error: {exc}"})