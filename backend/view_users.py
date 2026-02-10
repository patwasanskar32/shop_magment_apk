import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import database
import models
from datetime import datetime

def view_all_users():
    """Display all registered users in the database"""
    db = database.SessionLocal()
    
    try:
        users = db.query(models.User).all()
        orgs = db.query(models.Organization).all()
        
        print("=" * 80)
        print("REGISTERED USERS IN DATABASE")
        print("=" * 80)
        print(f"\nTotal Users: {len(users)}")
        print(f"Total Organizations: {len(orgs)}\n")
        
        if not users:
            print("⚠️  No users found in the database.")
            return
        
        # Display users by organization
        for org in orgs:
            org_users = [u for u in users if u.organization_id == org.id]
            print(f"\n📊 Organization: {org.name} (ID: {org.id})")
            print(f"   Owner ID: {org.owner_id}")
            print(f"   Created: {org.created_at}")
            print("-" * 80)
            
            if org_users:
                for user in org_users:
                    print(f"\n   👤 User ID: {user.id}")
                    print(f"      Username: {user.username}")
                    print(f"      Role: {user.role}")
                    print(f"      Password Hash: {user.password_hash[:50]}... (HASHED - Cannot view plain text)")
                    print(f"      Created: {user.created_at}")
            else:
                print("   No users in this organization")
        
        # Display users without organization
        orphan_users = [u for u in users if u.organization_id is None]
        if orphan_users:
            print(f"\n\n📊 Users without Organization")
            print("-" * 80)
            for user in orphan_users:
                print(f"\n   👤 User ID: {user.id}")
                print(f"      Username: {user.username}")
                print(f"      Role: {user.role}")
                print(f"      Password Hash: {user.password_hash[:50]}... (HASHED - Cannot view plain text)")
                print(f"      Created: {user.created_at}")
        
        print("\n" + "=" * 80)
        print("⚠️  SECURITY NOTE:")
        print("Passwords are stored as HASHED values for security.")
        print("You CANNOT retrieve the original passwords from the database.")
        print("If a user forgets their password, you need to RESET it, not retrieve it.")
        print("=" * 80 + "\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    view_all_users()
