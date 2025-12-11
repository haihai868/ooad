from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.gamification import BadgeStatus


# Badge Schemas
class BadgeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    icon_url: Optional[str] = None
    criteria_json: Optional[Dict[str, Any]] = None
    reward_xp: int = 0


class BadgeCreate(BadgeBase):
    pass


class BadgeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    icon_url: Optional[str] = None
    criteria_json: Optional[Dict[str, Any]] = None
    reward_xp: Optional[int] = None


class BadgeResponse(BadgeBase):
    id: int

    class Config:
        from_attributes = True


# User Badges Schemas
class UserBadgeBase(BaseModel):
    status: BadgeStatus = BadgeStatus.LOCKED
    progress: int = 0


class UserBadgeCreate(UserBadgeBase):
    user_id: int
    badge_id: int


class UserBadgeUpdate(BaseModel):
    status: Optional[BadgeStatus] = None
    progress: Optional[int] = None
    claimed_at: Optional[datetime] = None


class UserBadgeResponse(UserBadgeBase):
    user_id: int
    badge_id: int
    claimed_at: Optional[datetime] = None
    badge: Optional[BadgeResponse] = None

    class Config:
        from_attributes = True


# Leaderboard Response
class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    total_xp: int
    current_streak: int
    rank: int


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    total_users: int
    user_rank: Optional[int] = None

