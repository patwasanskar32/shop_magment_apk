from database import SessionLocal, engine
import models, auth
import sys

models.Base.metadata.create_all(bind=engine)

def create_owner():
    db = SessionLocal()
    print("--- Create Initial Owner Account ---")
    
    if len(sys.argv) > 2:
        username = sys.argv[1]
        password = sys.argv[2]
    else:
        print("No args provided. Creating default owner 'admin' with password 'admin123'")
        username = "admin"
        password = "admin123"
    
    # Check if exists
    existing = db.query(models.User).filter(models.User.username == username).first()
    if existing:
        print(f"User '{username}' already exists!")
        return

    hashed_password = auth.get_password_hash(password)
    user = models.User(username=username, password_hash=hashed_password, role="owner")
    
    db.add(user)
    db.commit()
    print(f"Owner '{username}' created successfully!")
    db.close()

if __name__ == "__main__":
    create_owner()
