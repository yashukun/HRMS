import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Employee, Attendance
from schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, AttendanceCreate, AttendanceOut

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS")


# Global exception handler for unhandled errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# CORS
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────── Employees ────────────────

@app.post("/api/employees", response_model=EmployeeOut)
def create_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    existing = db.query(Employee).filter(Employee.email == emp.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    employee = Employee(full_name=emp.full_name,
                        email=emp.email, department=emp.department)
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@app.get("/api/employees", response_model=list[EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()


@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"detail": "Employee deleted"}


@app.put("/api/employees/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, data: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Check duplicate email if email is being changed
    if data.email and data.email != emp.email:
        existing = db.query(Employee).filter(
            Employee.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
    # Apply only provided fields
    if data.full_name is not None:
        emp.full_name = data.full_name
    if data.email is not None:
        emp.email = data.email
    if data.department is not None:
        emp.department = data.department
    db.commit()
    db.refresh(emp)
    return emp


# ──────────────── Attendance ────────────────

@app.post("/api/attendance", response_model=AttendanceOut)
def mark_attendance(att: AttendanceCreate, db: Session = Depends(get_db)):
    # Verify employee exists
    emp = db.query(Employee).filter(Employee.id == att.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Check if attendance already marked for that date
    existing = db.query(Attendance).filter(
        Attendance.employee_id == att.employee_id,
        Attendance.date == att.date
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Attendance already marked for this date")
    record = Attendance(employee_id=att.employee_id,
                        date=str(att.date), status=att.status)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.get("/api/attendance/{employee_id}", response_model=list[AttendanceOut])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db.query(Attendance).filter(Attendance.employee_id == employee_id).order_by(Attendance.date.desc()).all()
