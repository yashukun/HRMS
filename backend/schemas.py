"""
schemas.py – Pydantic models for request / response validation.

Organised into three sections:
  1. Employee schemas  (create, update, response)
  2. Attendance schemas (create, response)
  3. Auth schemas       (login, token)
"""

from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, field_validator


# ── Employee Schemas ──────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    """Payload to create a new employee."""
    full_name: str
    email: EmailStr
    department: str

    @field_validator("full_name", "department")
    @classmethod
    def not_blank(cls, v: str, info) -> str:
        """Reject whitespace-only values for name and department."""
        stripped = v.strip()
        if not stripped:
            raise ValueError(f"{info.field_name} must not be blank")
        return stripped


class EmployeeUpdate(BaseModel):
    """Payload to partially update an employee (all fields optional)."""
    full_name: str | None = None
    email: EmailStr | None = None
    department: str | None = None

    @field_validator("full_name", "department")
    @classmethod
    def not_blank(cls, v, info):
        """Same blank-check as create, but only when a value is provided."""
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError(f"{info.field_name} must not be blank")
            return stripped
        return v


class EmployeeOut(BaseModel):
    """Response model returned when reading employee data."""
    id: int
    full_name: str
    email: str
    department: str

    class Config:
        from_attributes = True  # allow ORM objects to be serialised directly


# ── Attendance Schemas ────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    """Payload to mark attendance for a single day."""
    employee_id: int
    date: date
    status: Literal["Present", "Absent"]


class AttendanceOut(BaseModel):
    """Response model for an attendance record."""
    id: int
    employee_id: int
    date: date
    status: str

    class Config:
        from_attributes = True


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class AdminLogin(BaseModel):
    """Payload for admin login."""
    username: str
    password: str


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str
