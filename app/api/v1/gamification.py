from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_current_student, get_current_admin
from app.models.user import User
from app.schemas.gamification import (
    BadgeResponse, UserBadgeResponse, LeaderboardResponse, LeaderboardEntry
)
from app.repositories.gamification_repository import BadgeRepository, UserBadgesRepository
from app.repositories.learning_repository import UserStatsRepository

router = APIRouter()


@router.get("/badges", response_model=List[BadgeResponse])
async def get_all_badges(
    db: Session = Depends(get_db)
):
    """Get all available badges"""
    return BadgeRepository.get_all(db)


@router.get("/badges/my", response_model=List[UserBadgeResponse])
async def get_my_badges(
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """View and claim badges (Student only)"""
    user_badges = UserBadgesRepository.get_by_user(db, current_user.id)
    return user_badges


@router.post("/badges/{badge_id}/claim", response_model=UserBadgeResponse)
async def claim_badge(
    badge_id: int,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Claim an unlocked badge (Student only)"""
    user_badge = UserBadgesRepository.claim_badge(db, current_user.id, badge_id)
    if not user_badge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Badge not unlocked or already claimed"
        )
    
    # Add XP reward
    stats = UserStatsRepository.get_by_user(db, current_user.id)
    if stats:
        badge = BadgeRepository.get_by_id(db, badge_id)
        if badge:
            stats.total_xp += badge.reward_xp
            db.commit()
    
    return user_badge


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """View leaderboard"""
    from app.models.learning import UserStats
    from sqlalchemy import desc
    
    # Get top users by XP
    top_stats = db.query(UserStats).order_by(desc(UserStats.total_xp)).offset(skip).limit(limit).all()
    
    entries = []
    for rank, stats in enumerate(top_stats, start=skip + 1):
        user = db.query(User).filter(User.id == stats.user_id).first()
        if user:
            entries.append(LeaderboardEntry(
                user_id=user.id,
                username=user.username,
                total_xp=stats.total_xp,
                current_streak=stats.current_streak,
                rank=rank
            ))
    
    # Find current user's rank
    user_rank = None
    if current_user:
        user_stats = UserStatsRepository.get_by_user(db, current_user.id)
        if user_stats:
            rank_query = db.query(UserStats).filter(UserStats.total_xp > user_stats.total_xp).count()
            user_rank = rank_query + 1
    
    total_users = db.query(UserStats).count()
    
    return LeaderboardResponse(
        entries=entries,
        total_users=total_users,
        user_rank=user_rank
    )

