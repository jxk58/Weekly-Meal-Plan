"""Vercel entrypoint (see [tool.vercel] in pyproject.toml).

The application package `app` lives in backend/. Put that folder on the import path,
then re-export the ASGI app. Local development doesn't use this file; it uses
`uvicorn app.main:app --app-dir backend` instead.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from app.main import app

__all__ = ["app"]
