"""
PostgreSQL Database User Management Script
Use this to view and reset passwords in your cloud PostgreSQL database
"""

import psycopg2
from psycopg2 import sql
import bcrypt
import os

# Your PostgreSQL connection string
DATABASE_URL = "postgresql://attendance_db_091i_user:19rE2bTD8ulvOpGFDq19hMD60C4KObyZ@dpg-d65f9q15pdvs73d8sfu0-a/attendance_db_091i"

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def list_users():
    """List all users in the PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, username, role, organization_id, created_at FROM users ORDER BY id')
        users = cursor.fetchall()
        
        print("\n" + "=" * 80)
        print("USERS IN POSTGRESQL DATABASE (CLOUD)")
        print("=" * 80)
        print(f"\nTotal Users: {len(users)}\n")
        
        if users:
            for user in users:
                user_id, username, role, org_id, created_at = user
                print(f"ID: {user_id:2} | Username: {username:20} | Role: {role:10} | Org: {org_id}")
        else:
            print("⚠️  No users found in the cloud database.")
        
        print("=" * 80 + "\n")
        
        cursor.close()
        conn.close()
        return users
        
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")
        return []

def reset_password_cloud(username, new_password):
    """Reset a user's password in the cloud database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id, username FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ User '{username}' not found in cloud database.")
            cursor.close()
            conn.close()
            return False
        
        # Hash the new password
        password_hash = get_password_hash(new_password)
        
        # Update the password
        cursor.execute(
            'UPDATE users SET password_hash = %s WHERE username = %s',
            (password_hash, username)
        )
        
        conn.commit()
        
        print(f"✅ Password successfully reset for '{username}' in cloud database!")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error resetting password: {e}")
        return False

if __name__ == "__main__":
    print("\n🔐 POSTGRESQL CLOUD DATABASE MANAGER")
    print("=" * 80)
    
    # List all users
    users = list_users()
    
    if not users:
        print("No users in cloud database. You may need to register first.")
    else:
        # Interactive password reset
        choice = input("Do you want to reset a password? (yes/no): ").strip().lower()
        
        if choice == 'yes':
            username = input("Enter username to reset: ").strip()
            new_password = input("Enter new password: ").strip()
            confirm_password = input("Confirm new password: ").strip()
            
            if new_password != confirm_password:
                print("❌ Passwords do not match!")
            elif len(new_password) < 4:
                print("❌ Password must be at least 4 characters!")
            else:
                reset_password_cloud(username, new_password)
