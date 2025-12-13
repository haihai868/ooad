from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from fastapi import HTTPException, status
from app.repositories.learning_repository import (
    CardRetentionDataRepository, ReviewLogsRepository,
    UserStatsRepository, AlgoConfigsRepository
)
from app.repositories.deck_repository import FlashcardRepository
from app.schemas.learning import (
    ReviewLogCreate, CardRetentionDataUpdate,
    UserStatsUpdate, AlgoConfigsUpdate, StudyProgressResponse
)
from app.models.learning import CardStatus
from app.schemas.learning import CardRetentionDataCreate
from app.repositories.learning_repository import AlgoConfigsRepository


class LearningService:
    @staticmethod
    def calculate_next_review(
        quality: int,
        current_ease: float,
        current_interval: int,
        repetition_count: int,
        algo_config: dict
    ) -> tuple:
        """Calculate next review time using SM-2 algorithm"""
        if quality < 3:  # Failed
            new_status = CardStatus.RELEARNING
            new_interval = 1
            new_ease = max(1.3, current_ease - 0.2)
            new_repetition = 0
        else:  # Passed
            if repetition_count == 0:
                new_interval = 1
            elif repetition_count == 1:
                new_interval = 6
            else:
                new_interval = int(current_interval * current_ease * algo_config.get("interval_modifier", 1.0))
            
            if quality == 5:  # Easy
                new_interval = int(new_interval * algo_config.get("easy_bonus", 1.3))
            
            if quality == 1:  # Hard
                new_interval = max(1, int(new_interval * algo_config.get("hard_interval", 1.2)))
            
            new_ease = current_ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            new_ease = max(1.3, new_ease)
            
            if repetition_count == 0:
                new_status = CardStatus.LEARNING
            else:
                new_status = CardStatus.REVIEW
            
            new_repetition = repetition_count + 1
        
        next_review = datetime.utcnow() + timedelta(days=new_interval)
        return next_review, new_interval, new_ease, new_repetition, new_status
    
    @staticmethod
    def review_card(
        db: Session,
        user_id: int,
        card_id: int,
        quality: int,
        study_time_ms: int
    ) -> dict:
        # Get or create retention data
        retention = CardRetentionDataRepository.get_by_user_and_card(db, user_id, card_id)
        if not retention:
            algo_config = AlgoConfigsRepository.get_by_user(db, user_id)
            if not algo_config:
                algo_config = AlgoConfigsRepository.create_or_update(db, user_id)
            
            retention_data = CardRetentionDataCreate(
                user_id=user_id,
                card_id=card_id,
                ease_factor=algo_config.starting_ease,
                status=CardStatus.NEW
            )
            retention = CardRetentionDataRepository.create_or_update(db, retention_data)
        
        # Get algorithm config
        algo_config = AlgoConfigsRepository.get_by_user(db, user_id)
        if not algo_config:
            algo_config = AlgoConfigsRepository.create_or_update(db, user_id)
        
        algo_dict = {
            "interval_modifier": algo_config.interval_modifier,
            "easy_bonus": algo_config.easy_bonus,
            "hard_interval": algo_config.hard_interval
        }
        
        # Calculate next review
        next_review, new_interval, new_ease, new_repetition, new_status = LearningService.calculate_next_review(
            quality,
            retention.ease_factor,
            retention.interval_days,
            retention.repetition_count,
            algo_dict
        )
        
        # Update retention data
        update_data = CardRetentionDataUpdate(
            next_review=next_review,
            last_review=datetime.utcnow(),
            interval_days=new_interval,
            ease_factor=new_ease,
            repetition_count=new_repetition,
            status=new_status
        )
        CardRetentionDataRepository.update(db, user_id, card_id, update_data)
        
        # Create review log
        review_log = ReviewLogCreate(
            user_id=user_id,
            card_id=card_id,
            quality=quality,
            study_time_ms=study_time_ms
        )
        ReviewLogsRepository.create(db, review_log)
        
        # Update user stats
        today = date.today()
        stats = UserStatsRepository.update_streak(db, user_id, today)
        
        if new_status == CardStatus.REVIEW and retention.status != CardStatus.REVIEW:
            stats.cards_learned += 1
            stats.total_xp += 10
            db.commit()
        
        return {
            "next_review": next_review,
            "interval_days": new_interval,
            "ease_factor": new_ease,
            "repetition_count": new_repetition,
            "status": new_status
        }
    
    @staticmethod
    def get_due_cards(db: Session, user_id: int) -> list:
        return CardRetentionDataRepository.get_due_cards(db, user_id)
    
    @staticmethod
    def get_study_progress(db: Session, user_id: int) -> StudyProgressResponse:
        stats = UserStatsRepository.get_by_user(db, user_id)
        if not stats:
            stats = UserStatsRepository.create_or_update(db, user_id)
        
        algo_configs = AlgoConfigsRepository.get_by_user(db, user_id)
        if not algo_configs:
            algo_configs = AlgoConfigsRepository.create_or_update(db, user_id)
        
        # Count cards
        all_retention = CardRetentionDataRepository.get_by_user(db, user_id)
        cards_due_today = len([r for r in all_retention if r.next_review and r.next_review <= datetime.utcnow()])
        cards_in_learning = len([r for r in all_retention if r.status == CardStatus.LEARNING])
        cards_mastered = len([r for r in all_retention if r.status == CardStatus.REVIEW])
        
        from app.schemas.learning import UserStatsResponse, AlgoConfigsResponse
        return StudyProgressResponse(
            user_stats=UserStatsResponse.model_validate(stats),
            algo_configs=AlgoConfigsResponse.model_validate(algo_configs),
            cards_due_today=cards_due_today,
            cards_in_learning=cards_in_learning,
            cards_mastered=cards_mastered
        )
    
    @staticmethod
    def update_algo_config(db: Session, user_id: int, config_update: AlgoConfigsUpdate) -> dict:
        return AlgoConfigsRepository.create_or_update(db, user_id, config_update)

