from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List
from .. import database, models, schemas, auth

router = APIRouter(prefix="/hr", tags=["HR & Payroll"])

# ─── SALARY ENDPOINTS ────────────────────────────────────────────────────────

@router.post("/salary/set", response_model=schemas.SalaryResponse)
def set_salary(
    data: schemas.SalaryCreate,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Owner sets or updates a staff member's salary"""
    # Verify staff belongs to this org
    staff = db.query(models.User).filter(
        models.User.id == data.user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    existing = db.query(models.Salary).filter(models.Salary.user_id == data.user_id).first()
    if existing:
        existing.base_salary = data.base_salary
        existing.currency = data.currency
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    salary = models.Salary(
        user_id=data.user_id,
        organization_id=current_user.organization_id,
        base_salary=data.base_salary,
        currency=data.currency
    )
    db.add(salary)
    db.commit()
    db.refresh(salary)
    return salary

@router.get("/salary/all", response_model=List[schemas.SalaryResponse])
def get_all_salaries(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Salary).filter(
        models.Salary.organization_id == current_user.organization_id
    ).all()

@router.get("/salary/me", response_model=schemas.SalaryResponse)
def get_my_salary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salary = db.query(models.Salary).filter(models.Salary.user_id == current_user.id).first()
    if not salary:
        raise HTTPException(status_code=404, detail="Salary not set yet")
    return salary

# ─── LEAVE ENDPOINTS ─────────────────────────────────────────────────────────

@router.post("/leave/apply", response_model=schemas.LeaveResponse)
def apply_leave(
    data: schemas.LeaveCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Staff applies for leave"""
    leave = models.Leave(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason,
        status="pending"
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

@router.get("/leave/all", response_model=List[schemas.LeaveResponse])
def get_all_leaves(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Owner views all leave requests"""
    return db.query(models.Leave).filter(
        models.Leave.organization_id == current_user.organization_id
    ).order_by(models.Leave.applied_at.desc()).all()

@router.get("/leave/my", response_model=List[schemas.LeaveResponse])
def get_my_leaves(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Leave).filter(
        models.Leave.user_id == current_user.id
    ).order_by(models.Leave.applied_at.desc()).all()

@router.patch("/leave/{leave_id}/review", response_model=schemas.LeaveResponse)
def review_leave(
    leave_id: int,
    data: schemas.LeaveStatusUpdate,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Owner approves or rejects leave"""
    leave = db.query(models.Leave).filter(
        models.Leave.id == leave_id,
        models.Leave.organization_id == current_user.organization_id
    ).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if data.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    leave.status = data.status
    leave.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(leave)
    return leave

# ─── PAYSLIP ENDPOINTS ───────────────────────────────────────────────────────

@router.post("/payslip/generate", response_model=schemas.PayslipResponse)
def generate_payslip(
    user_id: int,
    month: int,
    year: int,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Generate monthly payslip for a staff member"""
    staff = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    salary_rec = db.query(models.Salary).filter(models.Salary.user_id == user_id).first()
    if not salary_rec:
        raise HTTPException(status_code=400, detail="Salary not set for this staff")

    # Check if payslip already exists
    existing = db.query(models.Payslip).filter(
        models.Payslip.user_id == user_id,
        models.Payslip.month == month,
        models.Payslip.year == year
    ).first()
    if existing:
        return existing

    # Count attendance for the month
    from sqlalchemy import extract
    records = db.query(models.Attendance).filter(
        models.Attendance.user_id == user_id,
        extract('month', models.Attendance.date) == month,
        extract('year', models.Attendance.date) == year
    ).all()

    days_present = sum(1 for r in records if r.status == "Present")
    days_late = sum(1 for r in records if r.status == "Late")
    days_absent = sum(1 for r in records if r.status == "Absent")

    # Calculate: deduct 1 day per absent, 0.5 per late
    import calendar
    total_working_days = len([
        d for d in range(1, calendar.monthrange(year, month)[1] + 1)
        if datetime(year, month, d).weekday() < 6  # Mon–Sat
    ])
    per_day = salary_rec.base_salary / max(total_working_days, 1)
    deductions = round((days_absent * per_day) + (days_late * per_day * 0.5), 2)
    net_salary = round(salary_rec.base_salary - deductions, 2)

    payslip = models.Payslip(
        user_id=user_id,
        organization_id=current_user.organization_id,
        month=month,
        year=year,
        base_salary=salary_rec.base_salary,
        days_present=days_present,
        days_absent=days_absent,
        days_late=days_late,
        deductions=deductions,
        net_salary=net_salary
    )
    db.add(payslip)
    db.commit()
    db.refresh(payslip)
    return payslip

@router.get("/payslip/all", response_model=List[schemas.PayslipResponse])
def get_all_payslips(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Payslip).filter(
        models.Payslip.organization_id == current_user.organization_id
    ).order_by(models.Payslip.year.desc(), models.Payslip.month.desc()).all()

@router.get("/payslip/my", response_model=List[schemas.PayslipResponse])
def get_my_payslips(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Payslip).filter(
        models.Payslip.user_id == current_user.id
    ).order_by(models.Payslip.year.desc(), models.Payslip.month.desc()).all()
