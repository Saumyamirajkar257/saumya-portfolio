"""In-memory sliding-window rate limiter.

Production note: this is process-local state. Behind a single uvicorn worker it
is fine for a personal portfolio; for horizontal scaling swap in a Redis-backed
limiter. The interface stays identical.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque
from typing import Optional

from app.config import get_settings

settings = get_settings()


class RateLimiter:
    """Sliding-window rate limiter keyed by an arbitrary string (IP, email...)."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def is_allowed(self, key: str) -> bool:
        """Return True if a request for ``key`` is within the limit.

        Also prunes stale timestamps on access to keep memory bounded.
        """
        now = time.monotonic()
        with self._lock:
            window = self._hits[key]
            # Drop timestamps older than the window
            while window and now - window[0] > self.window_seconds:
                window.popleft()
            if len(window) >= self.max_requests:
                # Housekeeping: keep list small even when blocked
                self._prune(key)
                return False
            window.append(now)
            return True

    def remaining(self, key: str) -> int:
        now = time.monotonic()
        with self._lock:
            window = self._hits[key]
            while window and now - window[0] > self.window_seconds:
                window.popleft()
            return max(0, self.max_requests - len(window))

    def _prune(self, key: str) -> None:
        if self._hits[key] and not any(
            time.monotonic() - t <= self.window_seconds for t in self._hits[key]
        ):
            del self._hits[key]


contact_limiter = RateLimiter(
    max_requests=settings.RATE_LIMIT_PER_WINDOW,
    window_seconds=settings.RATE_LIMIT_WINDOW_SECONDS,
)