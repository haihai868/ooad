from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.gamification import Badge, UserBadges
from app.schemas.gamification import BadgeCreate, BadgeUpdate, UserBadgeUpdate
from app.models.gamification import BadgeStatus


class BadgeRepository:
    @staticmethod
    def create(db: Session, badge_data: BadgeCreate) -> Badge:
        db_badge = Badge(**badge_data.model_dump())
        db.add(db_badge)
        db.commit()
        db.refresh(db_badge)
        return db_badge
    
    @staticmethod
    def get_by_id(db: Session, badge_id: int) -> Optional[Badge]:
        return db.query(Badge).filter(Badge.id == badge_id).first()
    
    @staticmethod
    def get_all(db: Session) -> List[Badge]:
        return db.query(Badge).all()
    
    @staticmethod
    def update(db: Session, badge_id: int, badge_update: BadgeUpdate) -> Optional[Badge]:
        badge = BadgeRepository.get_by_id(db, badge_id)
        if not badge:
            return None
        
        update_data = badge_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(badge, field, value)
        
        db.commit()
        db.refresh(badge)
        return badge


class UserBadgesRepository:
    @staticmethod
    def get_by_user_and_badge(db: Session, user_id: int, badge_id: int) -> Optional[UserBadges]:
        return db.query(UserBadges).filter(
            UserBadges.user_id == user_id,
            UserBadges.badge_id == badge_id
        ).first()
    
    @staticmethod
    def create_or_update(db: Session, user_id: int, badge_id: int, progress: int = 0) -> UserBadges:
        existing = UserBadgesRepository.get_by_user_and_badge(db, user_id, badge_id)
        
        if existing:
            existing.progress = progress
            if progress >= 100 and existing.status == BadgeStatus.LOCKED:
                existing.status = BadgeStatus.UNLOCKED
            db.commit()
            db.refresh(existing)
            return existing
        else:
            status = BadgeStatus.UNLOCKED if progress >= 100 else BadgeStatus.LOCKED
            db_user_badge = UserBadges(
                user_id=user_id,
                badge_id=badge_id,
                progress=progress,
                status=status
            )
            db.add(db_user_badge)
            db.commit()
            db.refresh(db_user_badge)
            return db_user_badge
    
    @staticmethod
    def claim_badge(db: Session, user_id: int, badge_id: int) -> Optional[UserBadges]:
        user_badge = UserBadgesRepository.get_by_user_and_badge(db, user_id, badge_id)
        if not user_badge or user_badge.status != BadgeStatus.UNLOCKED:
            return None
        
        from datetime import datetime
        user_badge.status = BadgeStatus.CLAIMED
        user_badge.claimed_at = datetime.utcnow()
        db.commit()
        db.refresh(user_badge)
        return user_badge
    
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[UserBadges]:
        return db.query(UserBadges).filter(UserBadges.user_id == user_id).all()

