from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date, time
from app.models.user import UserRole, UserStatus, NotificationType, NotificationStatus


# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: Optional[UserRole] = UserRole.STUDENT


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    status: Optional[UserStatus] = None


class UserResponse(UserBase):
    id: int
    status: UserStatus
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# User Preferences Schemas
class UserPreferencesBase(BaseModel):
    email_notification: bool = True
    push_notification: bool = True
    daily_reminder_time: Optional[time] = None
    theme: str = "light"


class UserPreferencesCreate(UserPreferencesBase):
    pass


class UserPreferencesUpdate(BaseModel):
    email_notification: Optional[bool] = None
    push_notification: Optional[bool] = None
    daily_reminder_time: Optional[time] = None
    theme: Optional[str] = None


class UserPreferencesResponse(UserPreferencesBase):
    user_id: int

    class Config:
        from_attributes = True


# Notification Logs Schemas
class NotificationLogCreate(BaseModel):
    user_id: int
    message: str
    type: NotificationType
    status: NotificationStatus


class NotificationLogResponse(BaseModel):
    id: int
    user_id: int
    message: str
    type: NotificationType
    status: NotificationStatus
    sent_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(UserCreate):
    pass


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

