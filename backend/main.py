from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the parent directory to sys.path to allow imports from 'backend'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import models, database
from backend.routers import auth, staff, attendance, messages

# Drop all tables and recreate (this will update schema with new columns)
models.Base.metadata.drop_all(bind=database.engine)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Attendance System API", version="1.0.0")

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

@app.get("/")
def read_root():
    return {"message": "Welcome to Attendance System API"}

if __name__ == "__main__":
    import uvicorn
    # Reload is enabled for development
    # host="0.0.0.0" allows access from any device on the network
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
