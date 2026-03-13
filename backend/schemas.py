"""
schemas.py – Pydantic models for request / response validation.

Organised into three sections:
  1. Employee schemas  (create, update, response)
  2. Attendance schemas (create, response)
  3. Auth schemas       (login, token)
"""

import re
from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, field_validator

# Regex: letters, spaces, hyphens, apostrophes (covers names like "O'Brien" or "Anne-Marie")
_NAME_RE = re.compile(r"^[A-Za-z\s'\-]+$")
# Regex: letters, spaces, ampersand, hyphens (covers depts like "R&D" or "Human Resources")
_DEPT_RE = re.compile(r"^[A-Za-z\s&\-]+$")


# ── Employee Schemas ──────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    """Payload to create a new employee."""
    full_name: str
    email: EmailStr
    department: str

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        """Name must be non-blank and contain only letters, spaces, hyphens, or apostrophes."""
        stripped = v.strip()
        if not stripped:
            raise ValueError("Full name must not be blank")
        if len(stripped) < 2:
            raise ValueError("Full name must be at least 2 characters")
        if not _NAME_RE.match(stripped):
            raise ValueError(
                "Full name must contain only letters, spaces, hyphens, or apostrophes")
        return stripped

    @field_validator("department")
    @classmethod
    def validate_department(cls, v: str) -> str:
        """Department must be non-blank and contain only letters, spaces, ampersands, or hyphens."""
        stripped = v.strip()
        if not stripped:
            raise ValueError("Department must not be blank")
        if len(stripped) < 2:
            raise ValueError("Department must be at least 2 characters")
        if not _DEPT_RE.match(stripped):
            raise ValueError(
                "Department must contain only letters, spaces, hyphens, or '&'")
        return stripped

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        """Extra check: email must have a valid-looking domain (at least one dot after @)."""
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError(
                "Please enter a valid email address (e.g. user@example.com)")
        return v


class EmployeeUpdate(BaseModel):
    """Payload to partially update an employee (all fields optional)."""
    full_name: str | None = None
    email: EmailStr | None = None
    department: str | None = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v):
        """Same rules as create, but only when a value is provided."""
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("Full name must not be blank")
            if len(stripped) < 2:
                raise ValueError("Full name must be at least 2 characters")
            if not _NAME_RE.match(stripped):
                raise ValueError(
                    "Full name must contain only letters, spaces, hyphens, or apostrophes")
            return stripped
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v):
        """Same rules as create, but only when a value is provided."""
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("Department must not be blank")
            if len(stripped) < 2:
                raise ValueError("Department must be at least 2 characters")
            if not _DEPT_RE.match(stripped):
                raise ValueError(
                    "Department must contain only letters, spaces, hyphens, or '&'")
            return stripped
        return v

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v):
        """Extra domain check when email is provided."""
        if v is not None:
            if "@" not in v or "." not in v.split("@")[-1]:
                raise ValueError(
                    "Please enter a valid email address (e.g. user@example.com)")
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
