from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class BadgeStatus(str, enum.Enum):
    LOCKED = "LOCKED"
    UNLOCKED = "UNLOCKED"
    CLAIMED = "CLAIMED"


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(String(255), nullable=True)
    icon_url = Column(String(255), nullable=True)
    criteria_json = Column(JSON, nullable=True)
    reward_xp = Column(Integer, default=0)

    user_badges = relationship("UserBadges", back_populates="badge")


class UserBadges(Base):
    __tablename__ = "user_badges"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), primary_key=True)
    status = Column(Enum(BadgeStatus), default=BadgeStatus.LOCKED)
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Integer, default=0)

    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")

