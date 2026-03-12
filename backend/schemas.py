from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Literal


# --- Employee Schemas ---

class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    department: str

    @field_validator("full_name", "department")
    @classmethod
    def not_blank(cls, v: str, info) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError(f"{info.field_name} must not be blank")
        return stripped


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    department: str | None = None

    @field_validator("full_name", "department")
    @classmethod
    def not_blank(cls, v, info):
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError(f"{info.field_name} must not be blank")
            return stripped
        return v


class EmployeeOut(BaseModel):
    id: int
    full_name: str
    email: str
    department: str

    class Config:
        from_attributes = True


# --- Attendance Schemas ---

class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: Literal["Present", "Absent"]


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: str

    class Config:
        from_attributes = True


# --- Admin Login ---

class AdminLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
