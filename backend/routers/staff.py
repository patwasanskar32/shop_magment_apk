from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/staff",
    tags=["staff"],
    dependencies=[Depends(auth.get_current_active_owner)]
)

@router.post("/add", response_model=schemas.UserResponse)
def add_staff(staff: schemas.UserCreate, current_user: models.User = Depends(auth.get_current_active_owner), db: Session = Depends(database.get_db)):
    """Add staff to the current owner's organization"""
    # Check if username already exists
    db_user = db.query(models.User).filter(models.User.username == staff.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create staff and assign to owner's organization
    hashed_password = auth.get_password_hash(staff.password)
    db_staff = models.User(
        username=staff.username,
        password_hash=hashed_password,
        role="staff",
        organization_id=current_user.organization_id  # Assign to owner's organization
    )
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.delete("/delete/{user_id}")
def delete_staff(user_id: int, current_user: models.User = Depends(auth.get_current_active_owner), db: Session = Depends(database.get_db)):
    """Delete staff from owner's organization"""
    # Only allow deletion of staff in the same organization
    db_staff = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.role == "staff",
        models.User.organization_id == current_user.organization_id
    ).first()
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found in your organization")
    db.delete(db_staff)
    db.commit()
    return {"message": "Staff deleted successfully"}

@router.get("/all", response_model=list[schemas.UserResponse])
def get_all_staff(current_user: models.User = Depends(auth.get_current_active_owner), db: Session = Depends(database.get_db)):
    """Get all staff in the owner's organization"""
    return db.query(models.User).filter(
        models.User.role == "staff",
        models.User.organization_id == current_user.organization_id
    ).all()
