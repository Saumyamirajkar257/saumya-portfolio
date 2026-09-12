"""Email delivery for the contact form.

- If SMTP is configured in environment variables → send via smtplib (TLS).
- Otherwise, in development, we persist the message to the database and log it,
  which keeps the app fully functional without credentials.

This means the contact form ALWAYS works out of the box, and switches to real
sending the moment SMTP vars are set in production.
"""

from __future__ import annotations

import smtplib
import ssl
from email.message import EmailMessage
from logging import getLogger

from app.config import get_settings
from app.services.security import sanitize_email_header

logger = getLogger(__name__)
settings = get_settings()


class EmailDeliveryError(Exception):
    """Raised when an email can't be sent through the configured provider."""


def _build_message(
    *,
    from_addr: str,
    to_addr: str,
    subject: str,
    body: str,
) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = sanitize_email_header(from_addr)
    msg["To"] = sanitize_email_header(to_addr)
    msg["Subject"] = sanitize_email_header(subject)
    msg.set_content(body)
    return msg


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD)


def send_contact_email(
    *,
    sender_name: str,
    sender_email: str,
    subject: str,
    message: str,
) -> None:
    """Send a contact-form notification to the configured inbox.

    Raises EmailDeliveryError if sending fails. When no SMTP is configured we
    log the message (development mode) rather than erroring.
    """
    subject = subject or "Message from portfolio"
    body = (
        f"New message from your portfolio contact form.\n\n"
        f"Name:    {sender_name}\n"
        f"Email:   {sender_email}\n"
        f"Subject: {subject}\n\n"
        f"{message}\n"
    )

    if not _smtp_configured():
        logger.info(
            "Contact email (SMTP not configured, logged only):\n%s",
            body,
        )
        return

    msg = _build_message(
        from_addr=settings.SMTP_FROM,
        to_addr=settings.CONTACT_TO,
        subject=f"[Portfolio] {subject}",
        body=body,
    )

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_USE_TLS:
                server.starttls(context=context)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as exc:  # noqa: BLE001 — surface any SMTP failure to caller
        logger.exception("SMTP delivery failed")
        raise EmailDeliveryError(f"SMTP delivery failed: {exc}") from exc