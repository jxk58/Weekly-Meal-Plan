"""Application settings. This is the only module that reads environment variables."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIR = REPO_ROOT / "frontend"
TEMPLATES_DIR = FRONTEND_DIR / "templates"
STATIC_DIR = FRONTEND_DIR / "static"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=REPO_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Weekly Meal Planner"
    environment: Literal["local", "test", "production"] = "local"
    debug: bool = False

    # Runtime connection (Supabase pooled URL in production).
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/meal_planner"
    # Direct connection for Alembic; falls back to database_url.
    migration_database_url: str | None = None

    @property
    def alembic_database_url(self) -> str:
        return self.migration_database_url or self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
