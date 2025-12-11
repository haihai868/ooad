from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_student
from app.models.user import User
from app.schemas.learning import (
    ReviewLogCreate, ReviewLogResponse,
    StudyProgressResponse, AlgoConfigsResponse, AlgoConfigsUpdate,
    CardRetentionDataResponse
)
from app.services.learning_service import LearningService
from app.repositories.learning_repository import ReviewLogsRepository, CardRetentionDataRepository

router = APIRouter()


@router.post("/review", response_model=dict)
async def review_card(
    card_id: int,
    quality: int,
    study_time_ms: int,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Review a flashcard (Doing test use case)"""
    if quality < 0 or quality > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quality must be between 0 and 5"
        )
    
    result = LearningService.review_card(
        db, current_user.id, card_id, quality, study_time_ms
    )
    
    # Update review history and calculate next review time are included in review_card
    # Send notifications would be handled by a background task or external service
    
    return result


@router.get("/due-cards", response_model=List[CardRetentionDataResponse])
async def get_due_cards(
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Get cards due for review"""
    due_cards = LearningService.get_due_cards(db, current_user.id)
    return due_cards


@router.get("/progress", response_model=StudyProgressResponse)
async def get_study_progress(
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Check study progress"""
    return LearningService.get_study_progress(db, current_user.id)


@router.get("/review-logs", response_model=List[ReviewLogResponse])
async def get_review_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Get review history"""
    return ReviewLogsRepository.get_by_user(db, current_user.id, skip, limit)


@router.get("/algo-config", response_model=AlgoConfigsResponse)
async def get_algo_config(
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Get spaced repetition algorithm configuration"""
    from app.repositories.learning_repository import AlgoConfigsRepository
    algo_config = AlgoConfigsRepository.get_by_user(db, current_user.id)
    if not algo_config:
        algo_config = AlgoConfigsRepository.create_or_update(db, current_user.id)
    return algo_config


@router.put("/algo-config", response_model=AlgoConfigsResponse)
async def update_algo_config(
    config_update: AlgoConfigsUpdate,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Change spaced repetition algorithm settings"""
    return LearningService.update_algo_config(db, current_user.id, config_update)

