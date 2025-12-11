from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Deck Schemas
class DeckBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_public: bool = False


class DeckCreate(DeckBase):
    pass


class DeckUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_public: Optional[bool] = None


class DeckResponse(DeckBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeckWithOwner(DeckResponse):
    owner: Optional["app.schemas.user.UserResponse"] = None


# Flashcard Schemas
class FlashcardBase(BaseModel):
    front_content: str = Field(..., min_length=1)
    back_content: str = Field(..., min_length=1)
    image_url: Optional[str] = None


class FlashcardCreate(FlashcardBase):
    deck_id: int


class FlashcardUpdate(BaseModel):
    front_content: Optional[str] = Field(None, min_length=1)
    back_content: Optional[str] = Field(None, min_length=1)
    image_url: Optional[str] = None


class FlashcardResponse(FlashcardBase):
    id: int
    deck_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Deck with Flashcards
class DeckWithFlashcards(DeckResponse):
    flashcards: List[FlashcardResponse] = []


# User Favorite Decks
class UserFavoriteDeckResponse(BaseModel):
    user_id: int
    deck_id: int
    added_at: datetime

    class Config:
        from_attributes = True

