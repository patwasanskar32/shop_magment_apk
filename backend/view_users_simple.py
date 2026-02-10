"""
Simple script to view all registered users in the database
Run this from the backend directory: python view_users_simple.py
"""

import sqlite3
from datetime import datetime
import os

# Database path
DB_PATH = "attendance.db"

def view_all_users():
    """Display all registered users using direct SQLite connection"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        print("Make sure you're running this from the backend directory.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get all organizations
        cursor.execute("SELECT id, name, owner_id, created_at FROM organizations")
        orgs = cursor.fetchall()
        
        # Get all users
        cursor.execute("SELECT id, username, password_hash, role, organization_id, created_at FROM users")
        users = cursor.fetchall()
        
        print("=" * 80)
        print("REGISTERED USERS IN DATABASE")
        print("=" * 80)
        print(f"\nTotal Users: {len(users)}")
        print(f"Total Organizations: {len(orgs)}\n")
        
        if not users:
            print("⚠️  No users found in the database.")
            conn.close()
            return
        
        # Display users by organization
        for org in orgs:
            org_id, org_name, owner_id, created_at = org
            org_users = [u for u in users if u[4] == org_id]
            
            print(f"\n📊 Organization: {org_name} (ID: {org_id})")
            print(f"   Owner ID: {owner_id}")
            print(f"   Created: {created_at}")
            print("-" * 80)
            
            if org_users:
                for user in org_users:
                    user_id, username, password_hash, role, _, user_created_at = user
                    print(f"\n   👤 User ID: {user_id}")
                    print(f"      Username: {username}")
                    print(f"      Role: {role}")
                    print(f"      Password Hash: {password_hash[:50]}... (HASHED)")
                    print(f"      Created: {user_created_at}")
            else:
                print("   No users in this organization")
        
        # Display users without organization
        orphan_users = [u for u in users if u[4] is None]
        if orphan_users:
            print(f"\n\n📊 Users without Organization")
            print("-" * 80)
            for user in orphan_users:
                user_id, username, password_hash, role, _, user_created_at = user
                print(f"\n   👤 User ID: {user_id}")
                print(f"      Username: {username}")
                print(f"      Role: {role}")
                print(f"      Password Hash: {password_hash[:50]}... (HASHED)")
                print(f"      Created: {user_created_at}")
        
        print("\n" + "=" * 80)
        print("⚠️  SECURITY NOTE:")
        print("Passwords are stored as HASHED values for security.")
        print("You CANNOT retrieve the original passwords from the database.")
        print("If a user forgets their password, you need to RESET it, not retrieve it.")
        print("=" * 80 + "\n")
        
    except sqlite3.Error as e:
        print(f"\n❌ DATABASE ERROR: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    view_all_users()
