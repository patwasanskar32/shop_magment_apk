from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth
from datetime import timedelta

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    return {"message": "Logout successful (client should discard token)"}

@router.get("/check-owner", response_model=schemas.OwnerExistsResponse)
def check_owner(db: Session = Depends(database.get_db)):
    """Check if an owner account exists in the system - DEPRECATED for multi-owner"""
    # Always return False to allow multiple owners to register
    return {"owner_exists": False}

@router.post("/register-owner", response_model=schemas.UserResponse)
def register_owner(request: schemas.RegisterOwnerRequest, db: Session = Depends(database.get_db)):
    """Register a new owner account with their own organization"""
    
    # Check if username is already taken
    existing_user = db.query(models.User).filter(models.User.username == request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if organization name already exists
    existing_org = db.query(models.Organization).filter(models.Organization.name == request.organization_name).first()
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization name already exists. Please choose a different name."
        )
    
    # Create the owner account first (without organization_id)
    hashed_password = auth.get_password_hash(request.password)
    new_owner = models.User(
        username=request.username,
        password_hash=hashed_password,
        role="owner",
        organization_id=None  # Will be set after organization is created
    )
    
    db.add(new_owner)
    db.flush()  # Get the owner ID without committing
    
    # Create the organization
    new_organization = models.Organization(
        name=request.organization_name,
        owner_id=new_owner.id
    )
    
    db.add(new_organization)
    db.flush()  # Get the organization ID
    
    # Update owner with organization_id
    new_owner.organization_id = new_organization.id
    
    db.commit()
    db.refresh(new_owner)
    
    return new_owner

@router.post("/reset-password", response_model=schemas.PasswordResetResponse)
def reset_password(
    request: schemas.PasswordResetRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_owner)
):
    """Reset a user's password (Owner only - can reset passwords within their organization)"""
    
    # Find the user to reset
    user_to_reset = db.query(models.User).filter(models.User.username == request.username).first()
    
    if not user_to_reset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify the owner can only reset passwords for users in their organization
    if user_to_reset.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reset passwords for users in your organization"
        )
    
    # Hash and update the new password
    new_password_hash = auth.get_password_hash(request.new_password)
    user_to_reset.password_hash = new_password_hash
    
    db.commit()
    
    return {
        "message": "Password successfully reset",
        "username": user_to_reset.username
    }

