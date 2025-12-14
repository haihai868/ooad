from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, BIGINT
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now()
    , onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_decks", foreign_keys=[owner_id])
    flashcards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")
    favorite_users = relationship("UserFavoriteDecks", back_populates="deck")
    class_assignments = relationship("ClassDecks", back_populates="deck")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(BIGINT, primary_key=True, index=True, autoincrement=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"), nullable=False)
    front_content = Column(Text, nullable=False)
    back_content = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    deck = relationship("Deck", back_populates="flashcards")
    retention_data = relationship("CardRetentionData", back_populates="flashcard")
    review_logs = relationship("ReviewLogs", back_populates="flashcard")


class UserFavoriteDecks(Base):
    __tablename__ = "user_favorite_decks"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"), primary_key=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorite_decks")
    deck = relationship("Deck", back_populates="favorite_users")

