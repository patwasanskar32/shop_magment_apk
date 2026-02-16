from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    role: str = "staff"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    organization_id: Optional[int] = None
    barcode: Optional[str] = None  # For ID card
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class AttendanceBase(BaseModel):
    status: str
    barcode_id: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    user_id: int

class AttendanceResponse(AttendanceBase):
    id: int
    user_id: int
    date: datetime
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    marked_by: str
    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    message: str
    type: str = "normal"

class MessageCreate(MessageBase):
    receiver_username: str

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    timestamp: datetime
    class Config:
        from_attributes = True

# Owner Registration Schemas
class RegisterOwnerRequest(BaseModel):
    username: str
    password: str
    organization_name: str  # New: organization name

class OwnerExistsResponse(BaseModel):
    owner_exists: bool

# Organization Schemas
class OrganizationResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Password Reset Schemas
class PasswordResetRequest(BaseModel):
    username: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str
    username: str

