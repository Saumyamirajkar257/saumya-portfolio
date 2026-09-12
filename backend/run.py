"""Convenience launcher:  python run.py  starts the API on port 8000.

Prefer `uvicorn app.main:app --reload` during development.
"""

from __future__ import annotations

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)