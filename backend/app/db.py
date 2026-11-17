"""Database engine and session dependency."""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import get_settings

# NullPool: serverless instances are short-lived, and Supabase's pooler does the pooling.
# prepare_threshold=None: the transaction-mode pooler doesn't support prepared statements.
engine = create_engine(
    get_settings().database_url,
    poolclass=NullPool,
    connect_args={"prepare_threshold": None},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency yielding a session that is closed after the request."""
    with SessionLocal() as session:
        yield session
