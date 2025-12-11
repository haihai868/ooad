from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.deck_repository import DeckRepository, FlashcardRepository
from app.schemas.deck import DeckCreate, DeckUpdate, FlashcardCreate, FlashcardUpdate
from app.models.user import User


class DeckService:
    @staticmethod
    def create_deck(db: Session, deck_data: DeckCreate, owner: User) -> dict:
        deck = DeckRepository.create(db, deck_data, owner.id)
        return deck
    
    @staticmethod
    def get_deck(db: Session, deck_id: int, user: User) -> dict:
        deck = DeckRepository.get_by_id(db, deck_id)
        if not deck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deck not found"
            )
        
        # Check if user can access deck
        if not deck.is_public and deck.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this deck"
            )
        
        return deck
    
    @staticmethod
    def browse_decks(db: Session, skip: int = 0, limit: int = 100, is_public: bool = True) -> list:
        return DeckRepository.get_all(db, skip, limit, is_public)
    
    @staticmethod
    def update_deck(db: Session, deck_id: int, deck_update: DeckUpdate, user: User) -> dict:
        deck = DeckRepository.get_by_id(db, deck_id)
        if not deck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deck not found"
            )
        
        if deck.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this deck"
            )
        
        return DeckRepository.update(db, deck_id, deck_update)
    
    @staticmethod
    def delete_deck(db: Session, deck_id: int, user: User) -> bool:
        deck = DeckRepository.get_by_id(db, deck_id)
        if not deck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deck not found"
            )
        
        if deck.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this deck"
            )
        
        return DeckRepository.delete(db, deck_id)
    
    @staticmethod
    def add_favorite(db: Session, deck_id: int, user: User) -> dict:
        deck = DeckService.get_deck(db, deck_id, user)
        favorite = DeckRepository.add_favorite(db, user.id, deck_id)
        return favorite
    
    @staticmethod
    def remove_favorite(db: Session, deck_id: int, user: User) -> bool:
        return DeckRepository.remove_favorite(db, user.id, deck_id)
    
    @staticmethod
    def get_favorites(db: Session, user: User) -> list:
        return DeckRepository.get_favorites(db, user.id)


class FlashcardService:
    @staticmethod
    def create_flashcard(db: Session, flashcard_data: FlashcardCreate, user: User) -> dict:
        # Verify deck ownership
        deck = DeckRepository.get_by_id(db, flashcard_data.deck_id)
        if not deck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deck not found"
            )
        
        if deck.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to add flashcards to this deck"
            )
        
        return FlashcardRepository.create(db, flashcard_data)
    
    @staticmethod
    def get_flashcards_by_deck(db: Session, deck_id: int, user: User) -> list:
        deck = DeckService.get_deck(db, deck_id, user)
        return FlashcardRepository.get_by_deck(db, deck_id)
    
    @staticmethod
    def update_flashcard(db: Session, flashcard_id: int, flashcard_update: FlashcardUpdate, user: User) -> dict:
        flashcard = FlashcardRepository.get_by_id(db, flashcard_id)
        if not flashcard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flashcard not found"
            )
        
        deck = DeckRepository.get_by_id(db, flashcard.deck_id)
        if deck.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this flashcard"
            )
        
        return FlashcardRepository.update(db, flashcard_id, flashcard_update)
    
    @staticmethod
    def delete_flashcard(db: Session, flashcard_id: int, user: User) -> bool:
        flashcard = FlashcardRepository.get_by_id(db, flashcard_id)
        if not flashcard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flashcard not found"
            )
        
        deck = DeckRepository.get_by_id(db, flashcard.deck_id)
        if deck.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this flashcard"
            )
        
        return FlashcardRepository.delete(db, flashcard_id)

