from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_current_student, get_current_user
from app.models.user import User
from app.schemas.deck import (
    DeckCreate, DeckUpdate, DeckResponse, DeckWithFlashcards,
    FlashcardCreate, FlashcardUpdate, FlashcardResponse,
    UserFavoriteDeckResponse
)
from app.services.deck_service import DeckService, FlashcardService

router = APIRouter()


# Deck endpoints
@router.post("/", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
async def create_deck(
    deck_data: DeckCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new deck"""
    return DeckService.create_deck(db, deck_data, current_user)


@router.get("/", response_model=List[DeckResponse])
async def browse_decks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_public: Optional[bool] = Query(True),
    db: Session = Depends(get_db)
):
    """Browse public decks (Guest and Authenticated users)"""
    # For now, just return all public decks
    # Frontend can filter out own decks if needed
    return DeckService.browse_decks(db, skip, limit, is_public, None)


@router.get("/my-decks", response_model=List[DeckResponse])
async def get_my_decks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's decks"""
    from app.repositories.deck_repository import DeckRepository
    return DeckRepository.get_by_owner(db, current_user.id, skip, limit)


@router.get("/{deck_id}", response_model=DeckWithFlashcards)
async def get_deck(
    deck_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get deck by ID with flashcards"""
    deck = DeckService.get_deck(db, deck_id, current_user)
    flashcards = FlashcardService.get_flashcards_by_deck(db, deck_id, current_user)
    return {
        **DeckResponse.model_validate(deck).model_dump(),
        "flashcards": [FlashcardResponse.model_validate(f).model_dump() for f in flashcards]
    }


@router.put("/{deck_id}", response_model=DeckResponse)
async def update_deck(
    deck_id: int,
    deck_update: DeckUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update deck"""
    return DeckService.update_deck(db, deck_id, deck_update, current_user)


@router.delete("/{deck_id}")
async def delete_deck(
    deck_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete deck"""
    DeckService.delete_deck(db, deck_id, current_user)
    return {"message": "Deck deleted successfully"}


# Favorite decks endpoints
@router.post("/{deck_id}/favorite", response_model=UserFavoriteDeckResponse)
async def add_favorite_deck(
    deck_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add deck to favorites"""
    return DeckService.add_favorite(db, deck_id, current_user)


@router.delete("/{deck_id}/favorite")
async def remove_favorite_deck(
    deck_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove deck from favorites"""
    DeckService.remove_favorite(db, deck_id, current_user)
    return {"message": "Deck removed from favorites"}


@router.get("/favorites/list", response_model=List[DeckResponse])
async def get_favorite_decks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's favorite decks"""
    return DeckService.get_favorites(db, current_user)


# Flashcard endpoints
@router.post("/{deck_id}/flashcards", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    deck_id: int,
    flashcard_data: FlashcardCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new flashcard in a deck"""
    flashcard_data.deck_id = deck_id
    return FlashcardService.create_flashcard(db, flashcard_data, current_user)


@router.get("/{deck_id}/flashcards", response_model=List[FlashcardResponse])
async def get_flashcards(
    deck_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all flashcards in a deck"""
    return FlashcardService.get_flashcards_by_deck(db, deck_id, current_user)


@router.put("/flashcards/{flashcard_id}", response_model=FlashcardResponse)
async def update_flashcard(
    flashcard_id: int,
    flashcard_update: FlashcardUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update flashcard"""
    return FlashcardService.update_flashcard(db, flashcard_id, flashcard_update, current_user)


@router.delete("/flashcards/{flashcard_id}")
async def delete_flashcard(
    flashcard_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete flashcard"""
    FlashcardService.delete_flashcard(db, flashcard_id, current_user)
    return {"message": "Flashcard deleted successfully"}

