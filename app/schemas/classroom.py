from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas import user, deck


# Class Schemas
class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class ClassResponse(ClassBase):
    id: int
    teacher_id: int
    invite_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class ClassWithDetails(ClassResponse):
    teacher: Optional["user.UserResponse"] = None
    member_count: int = 0
    deck_count: int = 0


# Class Decks Schemas
class ClassDeckAssign(BaseModel):
    class_id: int
    deck_id: int


class ClassDeckResponse(BaseModel):
    class_id: int
    deck_id: int
    assigned_at: datetime

    class Config:
        from_attributes = True


# Class Members Schemas
class ClassMemberJoin(BaseModel):
    invite_code: str


class ClassMemberResponse(BaseModel):
    class_id: int
    student_id: int
    joined_at: datetime

    class Config:
        from_attributes = True


class ClassWithMembers(ClassResponse):
    members: List["user.UserResponse"] = []
    decks: List["deck.DeckResponse"] = []