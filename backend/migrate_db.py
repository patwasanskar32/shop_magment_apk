# Migration Script to Add Check-In/Out Columns
# Run this ONCE on Render to update the database schema

from sqlalchemy import create_engine, text
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./attendance.db")

# Create engine
engine = create_engine(DATABASE_URL)

# Add columns if they don't exist
with engine.connect() as conn:
    try:
        # Add check_in_time column
        conn.execute(text("ALTER TABLE attendance ADD COLUMN check_in_time TIMESTAMP"))
        print("✅ Added check_in_time column")
    except Exception as e:
        print(f"check_in_time column might already exist: {e}")
    
    try:
        # Add check_out_time column
        conn.execute(text("ALTER TABLE attendance ADD COLUMN check_out_time TIMESTAMP"))
        print("✅ Added check_out_time column")
    except Exception as e:
        print(f"check_out_time column might already exist: {e}")
    
    conn.commit()
    print("✅ Migration complete!")
