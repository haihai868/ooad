from sqlalchemy import Column, Integer, DateTime, Float, Date, ForeignKey, BIGINT, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class CardStatus(str, enum.Enum):
    NEW = "NEW"
    LEARNING = "LEARNING"
    REVIEW = "REVIEW"
    RELEARNING = "RELEARNING"


class CardRetentionData(Base):
    __tablename__ = "card_retention_data"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    card_id = Column(BIGINT, ForeignKey("flashcards.id", ondelete="CASCADE"), primary_key=True)
    next_review = Column(DateTime(timezone=True), nullable=True)
    last_review = Column(DateTime(timezone=True), nullable=True)
    interval_days = Column(Integer, default=0)
    ease_factor = Column(Float, default=2.5)
    repetition_count = Column(Integer, default=0)
    status = Column(Enum(CardStatus), default=CardStatus.NEW)

    user = relationship("User", back_populates="card_retention_data")
    flashcard = relationship("Flashcard", back_populates="retention_data")


class ReviewLogs(Base):
    __tablename__ = "review_logs"

    id = Column(BIGINT, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    card_id = Column(BIGINT, ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False)
    quality = Column(Integer, nullable=False)  # 0-5
    study_time_ms = Column(Integer, nullable=False)
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="review_logs")
    flashcard = relationship("Flashcard", back_populates="review_logs")


class UserStats(Base):
    __tablename__ = "user_stats"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    total_xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_study_date = Column(Date, nullable=True)
    cards_learned = Column(Integer, default=0)

    user = relationship("User", back_populates="user_stats")


class AlgoConfigs(Base):
    __tablename__ = "algo_configs"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    starting_ease = Column(Float, default=2.5)
    interval_modifier = Column(Float, default=1.0)
    easy_bonus = Column(Float, default=1.3)
    hard_interval = Column(Float, default=1.2)

    user = relationship("User", back_populates="algo_configs")

