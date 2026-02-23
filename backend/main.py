from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import database
from backend.routers import auth, staff, attendance, messages, hr, pos, analytics

DATABASE_URL = os.getenv("DATABASE_URL", "")
IS_PRODUCTION = bool(DATABASE_URL) and "localhost" not in DATABASE_URL

def safe_migrate():
    """Add missing columns and tables without crashing"""
    from sqlalchemy import text, inspect
    engine = database.engine
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()

            # Migration 1: add barcode + email columns to users if missing
            if 'users' in existing_tables:
                cols = [c['name'] for c in inspector.get_columns('users')]
                if 'barcode' not in cols:
                    try:
                        conn.execute(text("ALTER TABLE users ADD COLUMN barcode VARCHAR"))
                        conn.commit()
                        print("✅ Added barcode column to users")
                    except Exception as e:
                        print(f"⚠️ barcode column: {e}")
                        conn.rollback()
                if 'email' not in cols:
                    try:
                        conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR"))
                        conn.commit()
                        print("✅ Added email column to users")
                    except Exception as e:
                        print(f"⚠️ email column: {e}")
                        conn.rollback()
                # Email verification + password reset columns
                for col_def in [
                    ("email_verified", "BOOLEAN DEFAULT FALSE"),
                    ("email_verify_token", "VARCHAR"),
                    ("reset_token", "VARCHAR"),
                    ("reset_token_expires", "TIMESTAMP"),
                ]:
                    col_name, col_type = col_def
                    if col_name not in cols:
                        try:
                            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                            print(f"✅ Added {col_name} column to users")
                        except Exception as e:
                            print(f"⚠️ {col_name} column: {e}")
                            conn.rollback()

            # Create new ERP tables if missing
            new_tables = ['salaries','leaves','payslips','products','sales','sale_items']
            missing = [t for t in new_tables if t not in existing_tables]
            if missing:
                # Import models here to avoid circular imports at module level
                from backend import models
                models.Base.metadata.create_all(bind=engine)
                print(f"✅ Migrated: created tables {missing}")
            else:
                print("✅ All tables exist")

    except Exception as e:
        print(f"⚠️ Migration warning (non-fatal): {e}")

# Run startup logic
if IS_PRODUCTION:
    print("🌐 Production: running safe migrations...")
    safe_migrate()
else:
    print("🛠️ Development: recreating DB...")
    try:
        from backend import models
        models.Base.metadata.drop_all(bind=database.engine)
        models.Base.metadata.create_all(bind=database.engine)
    except Exception as e:
        print(f"⚠️ Dev DB error: {e}")

# Import models AFTER migration so relationships are set up correctly
from backend import models

app = FastAPI(title="Shop ERP System API", version="2.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://shop-magment-apk.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(staff.router)
app.include_router(attendance.router)
app.include_router(messages.router)
app.include_router(hr.router)
app.include_router(pos.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "message": "Shop ERP System API v2.0 running",
        "mode": "production" if IS_PRODUCTION else "development"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
