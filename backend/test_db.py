import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

# Check tables
db = SessionLocal()

try:
    # Test if tables exist
    print("Testing database tables...")
    
    # Try to query organizations (this will fail if table doesn't exist)
    orgs = db.query(models.Organization).all()
    print(f"✅ Organizations table exists ({len(orgs)} records)")
    
    users = db.query(models.User).all()
    print(f"✅ Users table exists ({len(users)} records)")
    
    # Try to create a test organization
    print("\nTesting organization creation...")
    test_org = models.Organization(
        name="DEBUG_TEST_ORG",
        owner_id=None
    )
    db.add(test_org)
    db.flush()
    print(f"✅ Organization created with ID: {test_org.id}")
    
    # Try to create a test user
    print("\nTesting user creation...")
    from auth import get_password_hash
    test_user = models.User(
        username="debug_test_user",
        password_hash=get_password_hash("test123"),
        role="owner",
        organization_id=test_org.id
    )
    db.add(test_user)
    db.flush()
    print(f"✅ User created with ID: {test_user.id}")
    
    # Update organization owner_id
    test_org.owner_id = test_user.id
    db.commit()
    print("✅ Organization owner_id updated")
    
    print("\n🎉 ALL TESTS PASSED! Database is working correctly.")
    print("The registration should work now.")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
