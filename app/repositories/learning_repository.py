from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date
from app.models.learning import CardRetentionData, ReviewLogs, UserStats, AlgoConfigs
from app.schemas.learning import (
    CardRetentionDataCreate, CardRetentionDataUpdate,
    ReviewLogCreate, UserStatsCreate, UserStatsUpdate,
    AlgoConfigsCreate, AlgoConfigsUpdate
)


class CardRetentionDataRepository:
    @staticmethod
    def get_by_user_and_card(db: Session, user_id: int, card_id: int) -> Optional[CardRetentionData]:
        return db.query(CardRetentionData).filter(
            CardRetentionData.user_id == user_id,
            CardRetentionData.card_id == card_id
        ).first()
    
    @staticmethod
    def create_or_update(db: Session, retention_data: CardRetentionDataCreate) -> CardRetentionData:
        existing = CardRetentionDataRepository.get_by_user_and_card(
            db, retention_data.user_id, retention_data.card_id
        )
        
        if existing:
            update_data = retention_data.model_dump(exclude_unset=True, exclude={"user_id", "card_id"})
            for field, value in update_data.items():
                setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            db_retention = CardRetentionData(**retention_data.model_dump())
            db.add(db_retention)
            db.commit()
            db.refresh(db_retention)
            return db_retention
    
    @staticmethod
    def update(db: Session, user_id: int, card_id: int, update_data: CardRetentionDataUpdate) -> Optional[CardRetentionData]:
        retention = CardRetentionDataRepository.get_by_user_and_card(db, user_id, card_id)
        if not retention:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(retention, field, value)
        
        db.commit()
        db.refresh(retention)
        return retention
    
    @staticmethod
    def get_due_cards(db: Session, user_id: int) -> List[CardRetentionData]:
        now = datetime.utcnow()
        return db.query(CardRetentionData).filter(
            CardRetentionData.user_id == user_id,
            CardRetentionData.next_review <= now
        ).all()
    
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[CardRetentionData]:
        return db.query(CardRetentionData).filter(CardRetentionData.user_id == user_id).all()


class ReviewLogsRepository:
    @staticmethod
    def create(db: Session, review_log: ReviewLogCreate) -> ReviewLogs:
        db_review = ReviewLogs(**review_log.model_dump())
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return db_review
    
    @staticmethod
    def get_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[ReviewLogs]:
        return db.query(ReviewLogs).filter(
            ReviewLogs.user_id == user_id
        ).order_by(ReviewLogs.reviewed_at.desc()).offset(skip).limit(limit).all()


class UserStatsRepository:
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> Optional[UserStats]:
        return db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    @staticmethod
    def create_or_update(db: Session, user_id: int, stats_data: Optional[UserStatsUpdate] = None) -> UserStats:
        existing = UserStatsRepository.get_by_user(db, user_id)
        
        if existing:
            if stats_data:
                update_dict = stats_data.model_dump(exclude_unset=True)
                for field, value in update_dict.items():
                    setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            db_stats = UserStats(user_id=user_id)
            if stats_data:
                update_dict = stats_data.model_dump(exclude_unset=True)
                for field, value in update_dict.items():
                    setattr(db_stats, field, value)
            db.add(db_stats)
            db.commit()
            db.refresh(db_stats)
            return db_stats
    
    @staticmethod
    def update_streak(db: Session, user_id: int, study_date: date) -> UserStats:
        stats = UserStatsRepository.get_by_user(db, user_id)
        if not stats:
            stats = UserStatsRepository.create_or_update(db, user_id)
        
        if stats.last_study_date:
            from datetime import timedelta
            days_diff = (study_date - stats.last_study_date).days
            if days_diff == 1:
                stats.current_streak += 1
            elif days_diff > 1:
                stats.current_streak = 1
        else:
            stats.current_streak = 1
        
        if stats.current_streak > stats.longest_streak:
            stats.longest_streak = stats.current_streak
        
        stats.last_study_date = study_date
        db.commit()
        db.refresh(stats)
        return stats


class AlgoConfigsRepository:
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> Optional[AlgoConfigs]:
        return db.query(AlgoConfigs).filter(AlgoConfigs.user_id == user_id).first()
    
    @staticmethod
    def create_or_update(db: Session, user_id: int, config_data: Optional[AlgoConfigsUpdate] = None) -> AlgoConfigs:
        existing = AlgoConfigsRepository.get_by_user(db, user_id)
        
        if existing:
            if config_data:
                update_dict = config_data.model_dump(exclude_unset=True)
                for field, value in update_dict.items():
                    setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            db_config = AlgoConfigs(user_id=user_id)
            if config_data:
                update_dict = config_data.model_dump(exclude_unset=True)
                for field, value in update_dict.items():
                    setattr(db_config, field, value)
            db.add(db_config)
            db.commit()
            db.refresh(db_config)
            return db_config

