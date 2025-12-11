from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import LoginRequest, RegisterRequest, Token, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    user = AuthService.register_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    user = AuthService.authenticate_user(db, login_data)
    access_token = AuthService.create_token_for_user(user)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(get_db)
):
    """Request password reset (placeholder - integrate with email service)"""
    # TODO: Implement password reset logic with email service
    return {"message": "Password reset email sent (if email exists)"}

