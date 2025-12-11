from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean, Text, Time, ForeignKey, BIGINT
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"
    PAID_STUDENT = "PAID_STUDENT"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    LOCKED = "LOCKED"


class NotificationType(str, enum.Enum):
    EMAIL = "EMAIL"
    PUSH = "PUSH"


class NotificationStatus(str, enum.Enum):
    SENT = "SENT"
    FAILED = "FAILED"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    preferences = relationship("UserPreferences", back_populates="user", uselist=False)
    notification_logs = relationship("NotificationLogs", back_populates="user")
    owned_decks = relationship("Deck", back_populates="owner", foreign_keys="Deck.owner_id")
    favorite_decks = relationship("UserFavoriteDecks", back_populates="user")
    card_retention_data = relationship("CardRetentionData", back_populates="user")
    review_logs = relationship("ReviewLogs", back_populates="user")
    user_stats = relationship("UserStats", back_populates="user", uselist=False)
    algo_configs = relationship("AlgoConfigs", back_populates="user", uselist=False)
    owned_classes = relationship("Class", back_populates="teacher", foreign_keys="Class.teacher_id")
    class_memberships = relationship("ClassMembers", back_populates="student", foreign_keys="ClassMembers.student_id")
    user_badges = relationship("UserBadges", back_populates="user")
    owned_exams = relationship("Exam", back_populates="owner", foreign_keys="Exam.owner_id")
    exam_results = relationship("ExamResult", back_populates="user")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    email_notification = Column(Boolean, default=True)
    push_notification = Column(Boolean, default=True)
    daily_reminder_time = Column(Time, nullable=True)
    theme = Column(String(20), default="light")

    user = relationship("User", back_populates="preferences")


class NotificationLogs(Base):
    __tablename__ = "notification_logs"

    id = Column(BIGINT, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    status = Column(Enum(NotificationStatus), nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notification_logs")

