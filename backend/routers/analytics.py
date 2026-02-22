from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date
from typing import List
from .. import database, models, auth

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/attendance")
def get_attendance_stats(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Attendance summary for the current month"""
    now = datetime.utcnow()
    records = db.query(models.Attendance).filter(
        models.Attendance.organization_id == current_user.organization_id,
        extract('month', models.Attendance.date) == now.month,
        extract('year', models.Attendance.date) == now.year
    ).all()

    total = len(records)
    present = sum(1 for r in records if r.status == "Present")
    late = sum(1 for r in records if r.status == "Late")
    absent = sum(1 for r in records if r.status == "Absent")

    return {
        "month": now.month,
        "year": now.year,
        "total_records": total,
        "present": present,
        "late": late,
        "absent": absent,
        "present_pct": round((present / total * 100) if total else 0, 1),
        "late_pct": round((late / total * 100) if total else 0, 1),
        "absent_pct": round((absent / total * 100) if total else 0, 1),
    }

@router.get("/attendance/daily")
def get_daily_attendance(
    days: int = 30,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Daily attendance count for last N days"""
    from datetime import timedelta
    result = []
    today = date.today()
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        count = db.query(models.Attendance).filter(
            models.Attendance.organization_id == current_user.organization_id,
            func.date(models.Attendance.date) == d,
            models.Attendance.status == "Present"
        ).count()
        result.append({"date": d.strftime("%d %b"), "present": count})
    return result

@router.get("/staff-performance")
def get_staff_performance(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Per-staff attendance score for this month"""
    now = datetime.utcnow()
    staff_list = db.query(models.User).filter(
        models.User.organization_id == current_user.organization_id,
        models.User.role == "staff"
    ).all()

    result = []
    for staff in staff_list:
        records = db.query(models.Attendance).filter(
            models.Attendance.user_id == staff.id,
            extract('month', models.Attendance.date) == now.month,
            extract('year', models.Attendance.date) == now.year
        ).all()
        total = len(records)
        present = sum(1 for r in records if r.status in ["Present", "Late"])
        score = round((present / total * 100) if total else 0, 1)
        result.append({
            "staff_id": staff.id,
            "username": staff.username,
            "total_days": total,
            "present_days": present,
            "score": score
        })
    return sorted(result, key=lambda x: x["score"], reverse=True)

@router.get("/sales-summary")
def get_sales_summary(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Sales stats for current month"""
    now = datetime.utcnow()
    sales = db.query(models.Sale).filter(
        models.Sale.organization_id == current_user.organization_id,
        extract('month', models.Sale.created_at) == now.month,
        extract('year', models.Sale.created_at) == now.year
    ).all()

    total_revenue = sum(s.total for s in sales)
    total_sales = len(sales)
    avg_sale = round(total_revenue / total_sales, 2) if total_sales else 0

    return {
        "month": now.month,
        "year": now.year,
        "total_sales": total_sales,
        "total_revenue": round(total_revenue, 2),
        "avg_sale_value": avg_sale
    }

@router.get("/sales/daily")
def get_daily_sales(
    days: int = 30,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Daily revenue for last N days"""
    from datetime import timedelta
    result = []
    today = date.today()
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        sales = db.query(models.Sale).filter(
            models.Sale.organization_id == current_user.organization_id,
            func.date(models.Sale.created_at) == d
        ).all()
        revenue = sum(s.total for s in sales)
        result.append({"date": d.strftime("%d %b"), "revenue": round(revenue, 2), "count": len(sales)})
    return result

@router.get("/top-products")
def get_top_products(
    limit: int = 5,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Best-selling products by quantity"""
    items = db.query(
        models.SaleItem.product_id,
        func.sum(models.SaleItem.quantity).label("total_qty"),
        func.sum(models.SaleItem.subtotal).label("total_revenue")
    ).join(models.Sale).filter(
        models.Sale.organization_id == current_user.organization_id
    ).group_by(models.SaleItem.product_id).order_by(
        func.sum(models.SaleItem.quantity).desc()
    ).limit(limit).all()

    result = []
    for item in items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        result.append({
            "product_id": item.product_id,
            "name": product.name if product else "Unknown",
            "total_qty": item.total_qty,
            "total_revenue": round(item.total_revenue, 2)
        })
    return result

@router.get("/payroll-summary")
def get_payroll_summary(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Overview of payroll costs"""
    now = datetime.utcnow()
    payslips = db.query(models.Payslip).filter(
        models.Payslip.organization_id == current_user.organization_id,
        models.Payslip.month == now.month,
        models.Payslip.year == now.year
    ).all()

    total_payroll = sum(p.net_salary for p in payslips)
    total_deductions = sum(p.deductions for p in payslips)
    staff_count = len(payslips)

    return {
        "month": now.month,
        "year": now.year,
        "staff_count": staff_count,
        "total_payroll": round(total_payroll, 2),
        "total_deductions": round(total_deductions, 2),
    }

@router.get("/overview")
def get_dashboard_overview(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    """Top-level KPI summary for dashboard"""
    now = datetime.utcnow()

    # Staff count
    staff_count = db.query(models.User).filter(
        models.User.organization_id == current_user.organization_id,
        models.User.role == "staff"
    ).count()

    # Today's attendance
    today_count = db.query(models.Attendance).filter(
        models.Attendance.organization_id == current_user.organization_id,
        func.date(models.Attendance.date) == date.today(),
        models.Attendance.status.in_(["Present", "Late"])
    ).count()

    # This month revenue
    sales = db.query(models.Sale).filter(
        models.Sale.organization_id == current_user.organization_id,
        extract('month', models.Sale.created_at) == now.month,
        extract('year', models.Sale.created_at) == now.year
    ).all()
    monthly_revenue = round(sum(s.total for s in sales), 2)

    # Low stock count
    low_stock = db.query(models.Product).filter(
        models.Product.organization_id == current_user.organization_id,
        models.Product.stock <= 5,
        models.Product.is_active == True
    ).count()

    return {
        "total_staff": staff_count,
        "present_today": today_count,
        "monthly_revenue": monthly_revenue,
        "low_stock_alerts": low_stock,
        "total_sales_today": len([s for s in sales if s.created_at.date() == date.today()])
    }
