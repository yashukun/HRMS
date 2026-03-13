"""
models.py – SQLAlchemy ORM models for the HRMS database.

Defines two tables:
  - employees  : core employee records
  - attendance : daily attendance entries linked to employees
"""

import enum

from sqlalchemy import (
    Column, Integer, String, Date, ForeignKey, UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


# ── Enums ─────────────────────────────────────────────────────────────────────

class Role(str, enum.Enum):
    """Application-level roles (used for future RBAC)."""
    admin = "admin"


class AttendanceStatus(str, enum.Enum):
    """Allowed attendance statuses."""
    present = "Present"
    absent = "Absent"


# ── Employee ──────────────────────────────────────────────────────────────────

class Employee(Base):
    """An employee in the organisation."""

    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    department = Column(String, nullable=False)

    # One-to-many: deleting an employee cascades to their attendance records
    attendances = relationship(
        "Attendance", back_populates="employee", cascade="all, delete-orphan",
    )


# ── Attendance ────────────────────────────────────────────────────────────────

class Attendance(Base):
    """A single day's attendance record for one employee."""

    __tablename__ = "attendance"

    # Composite unique constraint – one record per employee per day
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_employee_date"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # "Present" or "Absent"

    employee = relationship("Employee", back_populates="attendances")
