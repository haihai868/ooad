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
    def create_or_update(db: Session, user_id: int, badge_id: int, progress: int = 0, check_criteria: bool = False) -> UserBadges:
        from app.repositories.learning_repository import UserStatsRepository
        from app.models.gamification import Badge
        
        existing = UserBadgesRepository.get_by_user_and_badge(db, user_id, badge_id)
        
        # If check_criteria is True, verify user actually meets criteria before unlocking
        should_unlock = False
        if check_criteria and progress >= 100:
            badge = BadgeRepository.get_by_id(db, badge_id)
            if badge and badge.criteria_json:
                stats = UserStatsRepository.get_by_user(db, user_id)
                if stats:
                    # Check if user actually meets criteria
                    criteria = badge.criteria_json
                    operator = criteria.get('operator', 'gte')
                    target_value = criteria.get('value', 0)
                    current_value = 0
                    
                    if criteria.get('type') == 'streak':
                        current_value = stats.current_streak or 0
                    elif criteria.get('type') == 'cards_learned':
                        current_value = stats.cards_learned or 0
                    elif criteria.get('type') == 'total_xp':
                        current_value = stats.total_xp or 0
                    
                    if operator == 'gte':
                        should_unlock = current_value >= target_value
                    elif operator == 'lte':
                        should_unlock = current_value <= target_value
                    elif operator == 'eq':
                        should_unlock = current_value == target_value
                    else:
                        should_unlock = current_value >= target_value
        else:
            # If not checking criteria, use progress >= 100
            should_unlock = progress >= 100
        
        if existing:
            # Only update progress if it's higher than current
            if progress > existing.progress:
                existing.progress = progress
                # Only unlock if criteria is met and currently locked
                if should_unlock and existing.status == BadgeStatus.LOCKED:
                    existing.status = BadgeStatus.UNLOCKED
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new user badge
            status = BadgeStatus.UNLOCKED if should_unlock else BadgeStatus.LOCKED
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

