"""Contact form endpoint with validation, sanitization, rate limiting,
spam protection (honeypot) and graceful email delivery."""

from __future__ import annotations

import hashlib

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import ContactMessage
from app.schemas import ContactIn, ContactOut
from app.services import contact_limiter, sanitize_text, send_contact_email
from app.services.emailer import EmailDeliveryError

router = APIRouter(prefix="/api", tags=["contact"])
settings = get_settings()


def _client_key(request: Request) -> str:
    """Stable, normalized key for rate limiting (IP-based)."""
    client = request.client.host if request.client else "unknown"
    return f"ip:{sha256(client)}"


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


@router.post("/contact", response_model=ContactOut)
def submit_contact(
    payload: ContactIn,
    request: Request,
    db: Session = Depends(get_db),
) -> ContactOut:
    # -- Spam protection: honeypot field must be empty ---------------------
    if payload.website.strip():
        # Silently accept to not educate bots, but don't process.
        return ContactOut(success=True, message="Thanks — your message has been sent.")

    # -- Rate limiting ------------------------------------------------------
    key = _client_key(request)
    if not contact_limiter.is_allowed(key):
        retry_after = settings.RATE_LIMIT_WINDOW_SECONDS
        raise HTTPException(
            status_code=429,
            detail=f"Too many messages. Please wait {retry_after // 60} minutes and try again.",
        )

    # -- Sanitize every field before persistence/emailing -------------------
    clean_name = sanitize_text(payload.name, max_length=120)
    clean_message = sanitize_text(payload.message, max_length=5000)
    clean_subject = sanitize_text(payload.subject, max_length=200) or "Message from portfolio"
    email = payload.email.strip().lower()

    if not clean_name or not clean_message:
        raise HTTPException(status_code=422, detail="Name and message are required.")

    # -- Persist (always) -----------------------------------------------------
    message_row = ContactMessage(
        name=clean_name,
        email=email,
        subject=clean_subject,
        message=clean_message,
        ip_hash=sha256(key),  # store a hash, never the raw address
    )
    db.add(message_row)
    db.commit()
    db.refresh(message_row)

    # -- Email (with graceful fallback) --------------------------------------
    try:
        send_contact_email(
            sender_name=clean_name,
            sender_email=email,
            subject=clean_subject,
            message=clean_message,
        )
    except EmailDeliveryError:
        # The message is already stored; surface a clear server error rather
        # than silently dropping it.
        raise HTTPException(
            status_code=500,
            detail="Your message was received but we couldn't email it right now. Please try again shortly.",
        ) from None

    return ContactOut(success=True, message="Message sent successfully! I'll get back to you soon.")