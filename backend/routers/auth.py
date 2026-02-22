from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth
from datetime import timedelta, datetime
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])

# ─── Login ───────────────────────────────────────────────────────────────────

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role}, expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    return {"message": "Logout successful (client should discard token)"}

@router.get("/check-owner", response_model=schemas.OwnerExistsResponse)
def check_owner(db: Session = Depends(database.get_db)):
    return {"owner_exists": False}

# ─── Register ────────────────────────────────────────────────────────────────

@router.post("/register-owner", response_model=schemas.UserResponse)
def register_owner(request: schemas.RegisterOwnerRequest, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.username == request.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(models.User).filter(models.User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered. Please login or use a different email.")
    if db.query(models.Organization).filter(models.Organization.name == request.organization_name).first():
        raise HTTPException(status_code=400, detail="Organization name already exists. Please choose a different name.")

    verify_token = secrets.token_urlsafe(32)
    new_owner = models.User(
        username=request.username,
        email=request.email,
        password_hash=auth.get_password_hash(request.password),
        role="owner",
        organization_id=None,
        email_verified=False,
        email_verify_token=verify_token
    )
    db.add(new_owner)
    db.flush()

    new_org = models.Organization(name=request.organization_name, owner_id=new_owner.id)
    db.add(new_org)
    db.flush()
    new_owner.organization_id = new_org.id
    db.commit()
    db.refresh(new_owner)

    try:
        from ..email_service import send_verification_email
        send_verification_email(request.email, request.username, verify_token)
    except Exception as e:
        print(f"⚠️ Verification email failed: {e}")

    return new_owner

# ─── Email Verification ───────────────────────────────────────────────────────

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email_verify_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")
    user.email_verified = True
    user.email_verify_token = None
    db.commit()
    return {"message": "Email verified successfully! You can now login."}

# ─── Forgot Password (email link) ─────────────────────────────────────────────

@router.post("/forgot-password-email")
def forgot_password_email(request: schemas.ForgotPasswordEmailRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # Always respond the same to prevent email enumeration
        return {"message": "If that email is registered, a reset link has been sent."}

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    try:
        from ..email_service import send_password_reset_email
        send_password_reset_email(user.email, user.username, reset_token)
    except Exception as e:
        print(f"⚠️ Reset email failed: {e}")

    return {"message": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password-token")
def reset_password_token(request: schemas.ResetPasswordTokenRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.reset_token == request.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
    if user.reset_token_expires and datetime.utcnow() > user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
    user.password_hash = auth.get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password reset successfully! You can now login."}

# ─── Owner-managed password reset ────────────────────────────────────────────

@router.post("/reset-password", response_model=schemas.PasswordResetResponse)
def reset_password(request: schemas.PasswordResetRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_owner)):
    user_to_reset = db.query(models.User).filter(models.User.username == request.username).first()
    if not user_to_reset:
        raise HTTPException(status_code=404, detail="User not found")
    if user_to_reset.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="You can only reset passwords for users in your organization")
    user_to_reset.password_hash = auth.get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password successfully reset", "username": user_to_reset.username}

@router.post("/self-reset-password", response_model=schemas.PasswordResetResponse)
def self_reset_password(request: schemas.PasswordResetRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Username not found")
    user.password_hash = auth.get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password successfully reset", "username": user.username}
