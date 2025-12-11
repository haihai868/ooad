from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.deck import Deck, Flashcard, UserFavoriteDecks
from app.schemas.deck import DeckCreate, DeckUpdate, FlashcardCreate, FlashcardUpdate


class DeckRepository:
    @staticmethod
    def create(db: Session, deck_data: DeckCreate, owner_id: int) -> Deck:
        db_deck = Deck(**deck_data.model_dump(), owner_id=owner_id)
        db.add(db_deck)
        db.commit()
        db.refresh(db_deck)
        return db_deck
    
    @staticmethod
    def get_by_id(db: Session, deck_id: int) -> Optional[Deck]:
        return db.query(Deck).filter(Deck.id == deck_id).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, is_public: Optional[bool] = None) -> List[Deck]:
        query = db.query(Deck)
        if is_public is not None:
            query = query.filter(Deck.is_public == is_public)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[Deck]:
        return db.query(Deck).filter(Deck.owner_id == owner_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def update(db: Session, deck_id: int, deck_update: DeckUpdate) -> Optional[Deck]:
        deck = DeckRepository.get_by_id(db, deck_id)
        if not deck:
            return None
        
        update_data = deck_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(deck, field, value)
        
        db.commit()
        db.refresh(deck)
        return deck
    
    @staticmethod
    def delete(db: Session, deck_id: int) -> bool:
        deck = DeckRepository.get_by_id(db, deck_id)
        if not deck:
            return False
        
        db.delete(deck)
        db.commit()
        return True
    
    @staticmethod
    def add_favorite(db: Session, user_id: int, deck_id: int) -> UserFavoriteDecks:
        favorite = UserFavoriteDecks(user_id=user_id, deck_id=deck_id)
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        return favorite
    
    @staticmethod
    def remove_favorite(db: Session, user_id: int, deck_id: int) -> bool:
        favorite = db.query(UserFavoriteDecks).filter(
            UserFavoriteDecks.user_id == user_id,
            UserFavoriteDecks.deck_id == deck_id
        ).first()
        if not favorite:
            return False
        db.delete(favorite)
        db.commit()
        return True
    
    @staticmethod
    def get_favorites(db: Session, user_id: int) -> List[Deck]:
        favorites = db.query(UserFavoriteDecks).filter(UserFavoriteDecks.user_id == user_id).all()
        deck_ids = [f.deck_id for f in favorites]
        return db.query(Deck).filter(Deck.id.in_(deck_ids)).all()


class FlashcardRepository:
    @staticmethod
    def create(db: Session, flashcard_data: FlashcardCreate) -> Flashcard:
        db_flashcard = Flashcard(**flashcard_data.model_dump())
        db.add(db_flashcard)
        db.commit()
        db.refresh(db_flashcard)
        return db_flashcard
    
    @staticmethod
    def get_by_id(db: Session, flashcard_id: int) -> Optional[Flashcard]:
        return db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    
    @staticmethod
    def get_by_deck(db: Session, deck_id: int) -> List[Flashcard]:
        return db.query(Flashcard).filter(Flashcard.deck_id == deck_id).all()
    
    @staticmethod
    def update(db: Session, flashcard_id: int, flashcard_update: FlashcardUpdate) -> Optional[Flashcard]:
        flashcard = FlashcardRepository.get_by_id(db, flashcard_id)
        if not flashcard:
            return None
        
        update_data = flashcard_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(flashcard, field, value)
        
        db.commit()
        db.refresh(flashcard)
        return flashcard
    
    @staticmethod
    def delete(db: Session, flashcard_id: int) -> bool:
        flashcard = FlashcardRepository.get_by_id(db, flashcard_id)
        if not flashcard:
            return False
        
        db.delete(flashcard)
        db.commit()
        return True

