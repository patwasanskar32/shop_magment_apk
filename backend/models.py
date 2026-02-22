from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .database import Base

class UserRole(str, enum.Enum):
    OWNER = "owner"
    STAFF = "staff"

class Organization(Base):
    """Each organization represents a separate business/entity with its own owner and staff"""
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="organization", foreign_keys="User.organization_id")
    attendance_records = relationship("Attendance", back_populates="organization")
    messages = relationship("Message", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default=UserRole.STAFF)
    barcode = Column(String, unique=True, index=True, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="users", foreign_keys=[organization_id])
    attendance = relationship("Attendance", back_populates="user")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    salary = relationship("Salary", back_populates="user", uselist=False)
    leaves = relationship("Leave", back_populates="user")
    payslips = relationship("Payslip", back_populates="user")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    date = Column(DateTime, default=datetime.utcnow)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String) # Present, Absent, Late
    barcode_id = Column(String, nullable=True)
    marked_by = Column(String) # "manual" or "barcode_id"

    # Relationships
    user = relationship("User", back_populates="attendance")
    organization = relationship("Organization", back_populates="attendance_records")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    message = Column(String)
    type = Column(String, default="normal") # normal, warning
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    organization = relationship("Organization", back_populates="messages")

# ─── HR & PAYROLL MODELS ─────────────────────────────────────────────────────

class Salary(Base):
    __tablename__ = "salaries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    base_salary = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    effective_from = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="salary")

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    leave_type = Column(String)  # sick, casual, annual
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    reason = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected
    applied_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="leaves")

class Payslip(Base):
    __tablename__ = "payslips"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    month = Column(Integer)
    year = Column(Integer)
    base_salary = Column(Float)
    days_present = Column(Integer, default=0)
    days_absent = Column(Integer, default=0)
    days_late = Column(Integer, default=0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float)
    generated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payslips")

# ─── POS MODELS ──────────────────────────────────────────────────────────────

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    name = Column(String, nullable=False)
    sku = Column(String, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Float, nullable=False)   # Selling price
    cost = Column(Float, nullable=True)     # Cost price
    stock = Column(Integer, default=0)
    unit = Column(String, default="pcs")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sale_items = relationship("SaleItem", back_populates="product")

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    sold_by = Column(Integer, ForeignKey("users.id"))
    customer_name = Column(String, nullable=True, default="Walk-in")
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    payment_method = Column(String, default="cash")  # cash, card, upi
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")
