# Migration Script - Add Barcode Column to Users Table
# Run this on Render to update the cloud database

import os
from sqlalchemy import create_engine, text

# Get database URL from environment (or use the provided one)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://attendance_db_091i_user:19rE2bTD8ulvOpGFDq19hMD60C4KObyZ@dpg-d65f9q15pdvs73d8sfu0-a/attendance_db_091i")

# Create engine
engine = create_engine(DATABASE_URL)

print("🔄 Starting database migration...")
print(f"📊 Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Unknown'}")

# Add barcode column to users table
with engine.connect() as conn:
    try:
        # Check if column exists first
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='barcode'
        """)
        result = conn.execute(check_query)
        exists = result.fetchone()
        
        if exists:
            print("✅ Barcode column already exists. Skipping...")
        else:
            # Add barcode column
            conn.execute(text("ALTER TABLE users ADD COLUMN barcode VARCHAR UNIQUE"))
            conn.commit()
            print("✅ Added barcode column to users table")
            
            # Create index for better performance
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_barcode ON users(barcode)"))
            conn.commit()
            print("✅ Created index on barcode column")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

print("✅ Migration complete!")
