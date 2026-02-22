from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    role: str = "staff"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    email: Optional[str] = None
    organization_id: Optional[int] = None
    barcode: Optional[str] = None
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

class RegisterOwnerRequest(BaseModel):
    username: str
    email: str
    password: str
    organization_name: str

class OwnerExistsResponse(BaseModel):
    owner_exists: bool

class OrganizationResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    username: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str
    username: str

# ─── HR & PAYROLL SCHEMAS ────────────────────────────────────────────────────

class SalaryCreate(BaseModel):
    user_id: int
    base_salary: float
    currency: str = "INR"

class SalaryResponse(BaseModel):
    id: int
    user_id: int
    base_salary: float
    currency: str
    effective_from: datetime
    class Config:
        from_attributes = True

class LeaveCreate(BaseModel):
    leave_type: str   # sick, casual, annual
    start_date: datetime
    end_date: datetime
    reason: Optional[str] = None

class LeaveResponse(BaseModel):
    id: int
    user_id: int
    leave_type: str
    start_date: datetime
    end_date: datetime
    reason: Optional[str] = None
    status: str
    applied_at: datetime
    class Config:
        from_attributes = True

class LeaveStatusUpdate(BaseModel):
    status: str   # approved or rejected

class PayslipResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    base_salary: float
    days_present: int
    days_absent: int
    days_late: int
    deductions: float
    net_salary: float
    generated_at: datetime
    class Config:
        from_attributes = True

# ─── POS SCHEMAS ─────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    price: float
    cost: Optional[float] = None
    stock: int = 0
    unit: str = "pcs"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    stock: Optional[int] = None
    unit: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    price: float
    cost: Optional[float] = None
    stock: int
    unit: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int

class SaleCreate(BaseModel):
    customer_name: Optional[str] = "Walk-in"
    items: List[SaleItemCreate]
    discount: float = 0.0
    tax: float = 0.0
    payment_method: str = "cash"

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: int
    customer_name: Optional[str]
    subtotal: float
    discount: float
    tax: float
    total: float
    payment_method: str
    created_at: datetime
    items: List[SaleItemResponse] = []
    class Config:
        from_attributes = True
