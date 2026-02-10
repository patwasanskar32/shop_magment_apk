from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, auth
from datetime import datetime

router = APIRouter(
    prefix="/message",
    tags=["message"]
)

@router.post("/send", response_model=schemas.MessageResponse)
def send_message(
    msg: schemas.MessageCreate,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    # Owner can only send to users in their organization
    receiver = db.query(models.User).filter(
        models.User.username == msg.receiver_username,
        models.User.organization_id == current_user.organization_id
    ).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found in your organization")
    
    db_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        organization_id=current_user.organization_id,
        message=msg.message,
        type=msg.type,
        timestamp=datetime.utcnow()
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.post("/reply", response_model=schemas.MessageResponse)
def reply_message(
    msg: schemas.MessageBase, # Only message content needed
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role == "owner":
        raise HTTPException(status_code=400, detail="Owners use /send")
    
    # Find the owner of staff's organization
    owner = db.query(models.User).filter(
        models.User.role == "owner",
        models.User.organization_id == current_user.organization_id
    ).first()
    if not owner:
        raise HTTPException(status_code=404, detail="No owner found in your organization")
    
    db_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=owner.id,
        organization_id=current_user.organization_id,
        message=msg.message,
        type="reply",
        timestamp=datetime.utcnow()
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.get("/inbox", response_model=List[schemas.MessageResponse])
def get_inbox(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Message).filter(
        models.Message.receiver_id == current_user.id,
        models.Message.organization_id == current_user.organization_id
    ).all()

@router.get("/replies", response_model=List[schemas.MessageResponse])
def get_replies(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Message).filter(
        models.Message.receiver_id == current_user.id,
        models.Message.organization_id == current_user.organization_id
    ).all()
