# Attendance Management System

Full Stack Attendance System with Owner and Staff roles, built with Python (FastAPI) and React.

## Features
- **Role-Based Access Control**: Owner (Admin) and Staff.
- **Authentication**: JWT based secure login.
- **Attendance**:
  - Manual marking by Owner.
  - Barcode scanning simulation.
  - "My Attendance" view for Staff.
- **Messaging**:
  - Owner sends messages/warnings.
  - Staff replies to Owner.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, Passlib (Bcrypt), Python-Jose (JWT).
- **Frontend**: React, Vite, Axios, React Router.

## API Documentation
Once backend is running, visit: `http://localhost:8000/docs` for Swagger UI.

## Setup Instructions

### Backend
1. Go to `backend/` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
4. **Create Initial Owner**:
   Run the helper script to create the first owner account:
   ```bash
   python create_owner.py
   ```

### Frontend
1. Go to `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
