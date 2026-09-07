from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import query_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    username: str
    full_name: str
    role: str
    token: str

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    user = query_db(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (req.username, req.password),
        one=True
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password. Try demo accounts: controller / irail2026")
    
    # Simple simulated token for prototype
    token = f"ir-auth-token-{user['username']}-2026"
    return {
        "success": True,
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"],
        "token": token
    }

@router.get("/users")
def list_demo_users():
    users = query_db("SELECT username, full_name, role FROM users")
    return {"users": users}
