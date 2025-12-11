from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from app.models.learning import CardStatus


# Card Retention Data Schemas
class CardRetentionDataBase(BaseModel):
    next_review: Optional[datetime] = None
    last_review: Optional[datetime] = None
    interval_days: int = 0
    ease_factor: float = 2.5
    repetition_count: int = 0
    status: CardStatus = CardStatus.NEW


class CardRetentionDataCreate(CardRetentionDataBase):
    user_id: int
    card_id: int


class CardRetentionDataUpdate(BaseModel):
    next_review: Optional[datetime] = None
    last_review: Optional[datetime] = None
    interval_days: Optional[int] = None
    ease_factor: Optional[float] = None
    repetition_count: Optional[int] = None
    status: Optional[CardStatus] = None


class CardRetentionDataResponse(CardRetentionDataBase):
    user_id: int
    card_id: int

    class Config:
        from_attributes = True


# Review Logs Schemas
class ReviewLogCreate(BaseModel):
    user_id: int
    card_id: int
    quality: int = Field(..., ge=0, le=5)
    study_time_ms: int = Field(..., ge=0)


class ReviewLogResponse(BaseModel):
    id: int
    user_id: int
    card_id: int
    quality: int
    study_time_ms: int
    reviewed_at: datetime

    class Config:
        from_attributes = True


# User Stats Schemas
class UserStatsBase(BaseModel):
    total_xp: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    last_study_date: Optional[date] = None
    cards_learned: int = 0


class UserStatsCreate(UserStatsBase):
    user_id: int


class UserStatsUpdate(BaseModel):
    total_xp: Optional[int] = None
    current_streak: Optional[int] = None
    longest_streak: Optional[int] = None
    last_study_date: Optional[date] = None
    cards_learned: Optional[int] = None


class UserStatsResponse(UserStatsBase):
    user_id: int

    class Config:
        from_attributes = True


# Algo Configs Schemas
class AlgoConfigsBase(BaseModel):
    starting_ease: float = 2.5
    interval_modifier: float = 1.0
    easy_bonus: float = 1.3
    hard_interval: float = 1.2


class AlgoConfigsCreate(AlgoConfigsBase):
    user_id: int


class AlgoConfigsUpdate(BaseModel):
    starting_ease: Optional[float] = None
    interval_modifier: Optional[float] = None
    easy_bonus: Optional[float] = None
    hard_interval: Optional[float] = None


class AlgoConfigsResponse(AlgoConfigsBase):
    user_id: int

    class Config:
        from_attributes = True


# Study Progress Response
class StudyProgressResponse(BaseModel):
    user_stats: UserStatsResponse
    algo_configs: AlgoConfigsResponse
    cards_due_today: int
    cards_in_learning: int
    cards_mastered: int

