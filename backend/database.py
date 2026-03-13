"""
database.py – SQLAlchemy engine, session factory, and base model.

Reads DATABASE_URL from the environment (falls back to a local default)
and exposes a `get_db` dependency for FastAPI route injection.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ── Connection URL ────────────────────────────────────────────────────────────
# Set DATABASE_URL in the environment or .env file; defaults to local Postgres.
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://yash@localhost:5432/hrms")

# ── Engine & Session ──────────────────────────────────────────────────────────
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
