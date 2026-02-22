from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import database, models, schemas, auth

router = APIRouter(prefix="/pos", tags=["POS"])

# ─── PRODUCT ENDPOINTS ───────────────────────────────────────────────────────

@router.post("/product", response_model=schemas.ProductResponse)
def add_product(
    data: schemas.ProductCreate,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    product = models.Product(
        organization_id=current_user.organization_id,
        name=data.name,
        sku=data.sku,
        category=data.category,
        price=data.price,
        cost=data.cost,
        stock=data.stock,
        unit=data.unit
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/product/all", response_model=List[schemas.ProductResponse])
def get_all_products(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Product).filter(
        models.Product.organization_id == current_user.organization_id,
        models.Product.is_active == True
    ).all()

@router.get("/product/low-stock", response_model=List[schemas.ProductResponse])
def get_low_stock(
    threshold: int = 5,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Product).filter(
        models.Product.organization_id == current_user.organization_id,
        models.Product.stock <= threshold,
        models.Product.is_active == True
    ).all()

@router.patch("/product/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    data: schemas.ProductUpdate,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/product/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.organization_id == current_user.organization_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False  # Soft delete
    db.commit()
    return {"message": "Product removed"}

# ─── SALES ENDPOINTS ─────────────────────────────────────────────────────────

@router.post("/sale", response_model=schemas.SaleResponse)
def create_sale(
    data: schemas.SaleCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a new sale/invoice"""
    subtotal = 0.0
    sale_items = []

    for item_data in data.items:
        product = db.query(models.Product).filter(
            models.Product.id == item_data.product_id,
            models.Product.organization_id == current_user.organization_id
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")
        if product.stock < item_data.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

        item_subtotal = product.price * item_data.quantity
        subtotal += item_subtotal
        sale_items.append({
            "product": product,
            "quantity": item_data.quantity,
            "unit_price": product.price,
            "subtotal": item_subtotal
        })

    total = round(subtotal - data.discount + data.tax, 2)

    sale = models.Sale(
        organization_id=current_user.organization_id,
        sold_by=current_user.id,
        customer_name=data.customer_name,
        subtotal=round(subtotal, 2),
        discount=data.discount,
        tax=data.tax,
        total=total,
        payment_method=data.payment_method
    )
    db.add(sale)
    db.flush()

    for item in sale_items:
        si = models.SaleItem(
            sale_id=sale.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            subtotal=item["subtotal"]
        )
        db.add(si)
        # Deduct stock
        item["product"].stock -= item["quantity"]

    db.commit()
    db.refresh(sale)
    return sale

@router.get("/sale/all", response_model=List[schemas.SaleResponse])
def get_all_sales(
    current_user: models.User = Depends(auth.get_current_active_owner),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Sale).filter(
        models.Sale.organization_id == current_user.organization_id
    ).order_by(models.Sale.created_at.desc()).all()

@router.get("/sale/{sale_id}", response_model=schemas.SaleResponse)
def get_sale(
    sale_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    sale = db.query(models.Sale).filter(
        models.Sale.id == sale_id,
        models.Sale.organization_id == current_user.organization_id
    ).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
