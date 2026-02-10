"""
Password Reset Utility
Run this script to reset a user's password from the command line.
Usage: python reset_password.py
"""

import sqlite3
import bcrypt
import os

DB_PATH = "attendance.db"

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def list_users():
    """Display all users for selection"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, role FROM users ORDER BY id')
    users = cursor.fetchall()
    conn.close()
    
    if not users:
        print("❌ No users found in database.")
        return []
    
    print("\n" + "=" * 60)
    print("AVAILABLE USERS")
    print("=" * 60)
    for user in users:
        print(f"ID: {user[0]:2} | Username: {user[1]:20} | Role: {user[2]}")
    print("=" * 60 + "\n")
    
    return users

def reset_password():
    """Interactive password reset"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        return
    
    # List all users
    users = list_users()
    if not users:
        return
    
    # Get user selection
    try:
        user_input = input("Enter User ID to reset password (or 'q' to quit): ").strip()
        if user_input.lower() == 'q':
            print("Cancelled.")
            return
        
        user_id = int(user_input)
        
        # Verify user exists
        selected_user = None
        for user in users:
            if user[0] == user_id:
                selected_user = user
                break
        
        if not selected_user:
            print(f"❌ User ID {user_id} not found.")
            return
        
        print(f"\n✅ Selected: {selected_user[1]} (ID: {selected_user[0]})")
        
        # Get new password
        new_password = input("Enter new password: ").strip()
        if len(new_password) < 4:
            print("❌ Password must be at least 4 characters.")
            return
        
        confirm_password = input("Confirm new password: ").strip()
        if new_password != confirm_password:
            print("❌ Passwords do not match.")
            return
        
        # Confirm reset
        confirm = input(f"\n⚠️  Reset password for '{selected_user[1]}'? (yes/no): ").strip().lower()
        if confirm != 'yes':
            print("Cancelled.")
            return
        
        # Hash the new password
        password_hash = get_password_hash(new_password)
        
        # Update database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            (password_hash, user_id)
        )
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Password successfully reset for user '{selected_user[1]}'!")
        print("The user can now login with the new password.\n")
        
    except ValueError:
        print("❌ Invalid input. Please enter a numeric User ID.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("\n🔐 PASSWORD RESET UTILITY")
    print("=" * 60)
    reset_password()
