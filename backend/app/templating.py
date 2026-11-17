"""Shared Jinja2 environment for rendering frontend/templates."""

from fastapi.templating import Jinja2Templates

from app.config import TEMPLATES_DIR

templates = Jinja2Templates(directory=TEMPLATES_DIR)
