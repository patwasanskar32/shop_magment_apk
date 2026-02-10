from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"]
)

@router.post("/check-in", response_model=schemas.AttendanceResponse)
def check_in(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Mark staff check-in time"""
    # Check if user exists and belongs to owner's organization
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff not found in your organization")
    
    # Check if already checked in today
    today = date.today()
    existing = db.query(models.Attendance).filter(
        models.Attendance.user_id == user_id,
        models.Attendance.organization_id == current_user.organization_id,
        models.Attendance.date >= datetime(today.year, today.month, today.day)
    ).first()
    
    if existing and existing.check_in_time:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    now = datetime.utcnow()
    db_attendance = models.Attendance(
        user_id=user_id,
        organization_id=current_user.organization_id,
        date=now,
        check_in_time=now,
        status="Present",
        marked_by="manual"
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.post("/check-out/{attendance_id}", response_model=schemas.AttendanceResponse)
def check_out(
    attendance_id: int,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Mark staff check-out time"""
    attendance = db.query(models.Attendance).filter(
        models.Attendance.id == attendance_id,
        models.Attendance.organization_id == current_user.organization_id
    ).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    if attendance.check_out_time:
        raise HTTPException(status_code=400, detail="Already checked out")
    
    attendance.check_out_time = datetime.utcnow()
    db.commit()
    db.refresh(attendance)
    return attendance

@router.post("/mark", response_model=schemas.AttendanceResponse)
def mark_attendance(
    attendance: schemas.AttendanceCreate,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    # Check if user exists and belongs to owner's organization
    user = db.query(models.User).filter(
        models.User.id == attendance.user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in your organization")
    
    now = datetime.utcnow()
    db_attendance = models.Attendance(
        user_id=attendance.user_id,
        organization_id=current_user.organization_id,
        status=attendance.status,
        date=now,
        check_in_time=now if attendance.status in ["Present", "Late"] else None,
        marked_by="manual"
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.post("/barcode", response_model=schemas.AttendanceResponse)
def mark_attendance_barcode(
    barcode_data: dict, # Expecting {"barcode": "ID"}
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    barcode_id = barcode_data.get("barcode")
    if not barcode_id:
        raise HTTPException(status_code=400, detail="Barcode is required")
    
    # Assuming barcode is the User ID for simplicity
    try:
        user_id = int(barcode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid barcode format")
    
    # Find user by ID in owner's organization
    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found in your organization with this barcode")
    
    now = datetime.utcnow()
    db_attendance = models.Attendance(
        user_id=user.id,
        organization_id=current_user.organization_id,
        status="Present",
        date=now,
        check_in_time=now,
        marked_by=f"barcode:{barcode_id}"
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.get("/all", response_model=List[schemas.AttendanceResponse])
def get_all_attendance(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    # Filter attendance by organization
    attendance_records = db.query(models.Attendance).filter(
        models.Attendance.organization_id == current_user.organization_id
    ).order_by(models.Attendance.date.desc()).all()
    return attendance_records

@router.get("/my-attendance", response_model=List[schemas.AttendanceResponse])
def get_my_attendance(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Staff can only see their own attendance within their organization
    attendance_records = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.organization_id == current_user.organization_id
    ).order_by(models.Attendance.date.desc()).all()
    return attendance_records
