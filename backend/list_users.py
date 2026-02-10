import sqlite3

conn = sqlite3.connect('attendance.db')
cursor = conn.cursor()

# Get all users
cursor.execute('SELECT id, username, role, organization_id, created_at FROM users')
users = cursor.fetchall()

# Get all organizations
cursor.execute('SELECT id, name FROM organizations')
orgs = {org[0]: org[1] for org in cursor.fetchall()}

print("=" * 80)
print("REGISTERED USERS")
print("=" * 80)
print()

for user in users:
    user_id, username, role, org_id, created_at = user
    org_name = orgs.get(org_id, "None")
    
    print(f"User ID: {user_id}")
    print(f"Username: {username}")
    print(f"Role: {role}")
    print(f"Organization: {org_name}")
    print(f"Created: {created_at}")
    print("-" * 80)

print(f"\nTotal Users: {len(users)}")
print()
print("NOTE: Passwords are HASHED for security and cannot be viewed.")
print("If someone forgets their password, you need to RESET it.")
print("=" * 80)

conn.close()
