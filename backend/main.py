from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the parent directory to sys.path to allow imports from 'backend'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import models, database
from backend.routers import auth, staff, attendance, messages, hr, pos, analytics

def run_migrations():
    """Safely run schema migrations for cloud database (PostgreSQL)"""
    from sqlalchemy import text, inspect
    with database.engine.connect() as conn:
        inspector = inspect(database.engine)
        
        # Migration 1: add barcode column to users if it doesn't exist
        cols = [c['name'] for c in inspector.get_columns('users')]
        if 'barcode' not in cols:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN barcode VARCHAR"))
                conn.commit()
                print("✅ Added barcode column to users")
            except Exception as e:
                print(f"⚠️ barcode column: {e}")
                conn.rollback()

        # Migration 2: Create all new ERP tables (salaries, leaves, payslips, products, sales, sale_items)
        try:
            models.Base.metadata.create_all(bind=database.engine)
            print("✅ ERP tables created/verified")
        except Exception as e:
            print(f"⚠️ create_all error: {e}")

# Production vs Development startup
DATABASE_URL = os.getenv("DATABASE_URL", "")
IS_PRODUCTION = bool(DATABASE_URL) and "localhost" not in DATABASE_URL

if IS_PRODUCTION:
    # Production: safe migrations only, never drop tables
    print("🌐 Production mode: running safe migrations...")
    try:
        run_migrations()
    except Exception as e:
        # Even if migration fails, don't crash — allow app to start
        print(f"⚠️ Migration warning (app will still start): {e}")
else:
    # Development: drop and recreate fresh
    print("🛠️ Development mode: recreating database...")
    try:
        models.Base.metadata.drop_all(bind=database.engine)
        models.Base.metadata.create_all(bind=database.engine)
    except Exception as e:
        print(f"⚠️ Dev DB setup error: {e}")

app = FastAPI(title="Shop ERP System API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "message": "Welcome to Shop ERP System API v2.0",
        "status": "running",
        "mode": "production" if IS_PRODUCTION else "development"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
