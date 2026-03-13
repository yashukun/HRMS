"""
main.py – FastAPI application entry-point for the HRMS backend.

Exposes REST endpoints for:
  - Employee CRUD   (/api/employees)
  - Attendance       (/api/attendance)
"""

import os
from datetime import date
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Employee, Attendance
from schemas import (
    EmployeeCreate, EmployeeUpdate, EmployeeOut,
    AttendanceCreate, AttendanceOut,
)

# ── Initialisation ────────────────────────────────────────────────────────────
# Auto-create tables on startup (safe for dev; use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS")


# ── Global Exception Handler ──────────────────────────────────────────────────
# Catches any unhandled error and returns a generic 500 to avoid leaking internals
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ── Validation Error Handler ──────────────────────────────────────────────────
# Returns user-friendly field-level error messages instead of Pydantic's raw output
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        # Extract the field name from the location tuple (e.g. ('body', 'email'))
        field = err.get("loc", [""])[-1]
        msg = err.get("msg", "Invalid value")
        # Strip Pydantic prefix like "Value error, "
        if msg.lower().startswith("value error, "):
            msg = msg[len("value error, "):]
        errors.append({"field": field, "message": msg})
    # Return the first error as `detail` for simple clients, plus full list
    first_msg = errors[0]["message"] if errors else "Validation error"
    return JSONResponse(
        status_code=422,
        content={"detail": first_msg, "errors": errors},
    )


# ── CORS Middleware ───────────────────────────────────────────────────────────
# ALLOWED_ORIGINS is a comma-separated list read from the environment
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────── Employee Endpoints ────────────────


@app.post("/api/employees", response_model=EmployeeOut)
def create_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee. Rejects duplicate email addresses."""
    existing = db.query(Employee).filter(Employee.email == emp.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    employee = Employee(
        full_name=emp.full_name,
        email=emp.email,
        department=emp.department,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@app.get("/api/employees", response_model=list[EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    """Return all employees."""
    return db.query(Employee).all()


@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Delete an employee by ID (cascades to attendance records)."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"detail": "Employee deleted"}


@app.put("/api/employees/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, data: EmployeeUpdate, db: Session = Depends(get_db)):
    """Partially update an employee. Only provided fields are changed."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Prevent changing to an email that already belongs to another employee
    if data.email and data.email != emp.email:
        existing = db.query(Employee).filter(
            Employee.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

    # Apply only the fields that were explicitly sent
    if data.full_name is not None:
        emp.full_name = data.full_name
    if data.email is not None:
        emp.email = data.email
    if data.department is not None:
        emp.department = data.department

    db.commit()
    db.refresh(emp)
    return emp


# ──────────────── Attendance Endpoints ────────────────


@app.post("/api/attendance", response_model=AttendanceOut)
def mark_attendance(att: AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance for an employee on a given date.

    Returns 400 if attendance was already marked for that date.
    """
    # Verify the employee exists
    emp = db.query(Employee).filter(Employee.id == att.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Prevent duplicate entries for the same employee + date
    existing = db.query(Attendance).filter(
        Attendance.employee_id == att.employee_id,
        Attendance.date == att.date,
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Attendance already marked for this date")

    record = Attendance(
        employee_id=att.employee_id,
        date=str(att.date),
        status=att.status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.get("/api/attendance/{employee_id}", response_model=list[AttendanceOut])
def get_attendance(
    employee_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """Fetch attendance records for a single employee.

    Supports optional date-range filtering via `start_date` / `end_date`.
    """
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    q = db.query(Attendance).filter(Attendance.employee_id == employee_id)
    if start_date:
        q = q.filter(Attendance.date >= start_date)
    if end_date:
        q = q.filter(Attendance.date <= end_date)

    return q.order_by(Attendance.date.desc()).all()


@app.get("/api/attendance/{employee_id}/summary")
def get_attendance_summary(
    employee_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """Return the count of 'Present' days for an employee (with optional date range)."""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    q = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == employee_id,
        Attendance.status == "Present",
    )
    if start_date:
        q = q.filter(Attendance.date >= start_date)
    if end_date:
        q = q.filter(Attendance.date <= end_date)

    total_present = q.scalar()
    return {"employee_id": employee_id, "total_present": total_present}
