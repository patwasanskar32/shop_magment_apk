from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"]
)

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
    
    db_attendance = models.Attendance(
        user_id=attendance.user_id,
        organization_id=current_user.organization_id,
        status=attendance.status,
        date=datetime.utcnow(),
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
    
    # Assuming barcode is the User ID for simplicity as per requirement "Staff ID (auto generate)"
    try:
        user_id = int(barcode_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid barcode format")

    user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.organization_id == current_user.organization_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff not found in your organization")

    # Check if already marked for today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing = db.query(models.Attendance).filter(
        models.Attendance.user_id == user_id,
        models.Attendance.organization_id == current_user.organization_id,
        models.Attendance.date >= today_start
    ).first()
    
    if existing:
        return existing # Already marked

    db_attendance = models.Attendance(
        user_id=user_id,
        organization_id=current_user.organization_id,
        status="Present",
        date=datetime.utcnow(),
        barcode_id=str(barcode_id),
        marked_by="barcode"
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.get("/all", response_model=List[schemas.AttendanceResponse])
def get_all_attendance(
    skip: int = 0, limit: int = 100, 
    user_id: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Attendance).filter(
        models.Attendance.organization_id == current_user.organization_id
    )
    if user_id:
        query = query.filter(models.Attendance.user_id == user_id)
    return query.offset(skip).limit(limit).all()

@router.get("/my", response_model=List[schemas.AttendanceResponse])
def get_my_attendance(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.organization_id == current_user.organization_id
    ).all()
