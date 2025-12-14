from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_current_student, get_current_admin
from app.models.user import User
from app.schemas.gamification import (
    BadgeCreate, BadgeUpdate, BadgeResponse, UserBadgeResponse, LeaderboardResponse, LeaderboardEntry
)
from app.repositories.gamification_repository import BadgeRepository, UserBadgesRepository
from app.repositories.learning_repository import UserStatsRepository

router = APIRouter()


@router.post("/badges", response_model=BadgeResponse, status_code=status.HTTP_201_CREATED)
async def create_badge(
    badge_data: BadgeCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new badge (Admin only)"""
    return BadgeRepository.create(db, badge_data)


@router.get("/badges", response_model=List[BadgeResponse])
async def get_all_badges(
    db: Session = Depends(get_db)
):
    """Get all available badges"""
    return BadgeRepository.get_all(db)

@router.get("/badges/get/my", response_model=List[UserBadgeResponse])
async def get_my_badges(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """View and claim badges"""
    try:
        from sqlalchemy.orm import joinedload
        from app.models.gamification import UserBadges
        
        user_badges = db.query(UserBadges).options(
            joinedload(UserBadges.badge)
        ).filter(UserBadges.user_id == current_user.id).all()
        
        result = []
        for ub in user_badges:
            ub_dict = {
                "user_id": ub.user_id,
                "badge_id": ub.badge_id,
                "status": ub.status.value if hasattr(ub.status, 'value') else ub.status,
                "progress": ub.progress,
                "claimed_at": ub.claimed_at,
                "badge": BadgeResponse.model_validate(ub.badge) if ub.badge else None
            }
            result.append(UserBadgeResponse.model_validate(ub_dict))
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get badges: {str(e)}"
        )



@router.get("/badges/{badge_id}", response_model=BadgeResponse)
async def get_badge(
    badge_id: int,
    db: Session = Depends(get_db)
):
    """Get badge by ID"""
    badge = BadgeRepository.get_by_id(db, badge_id)
    if not badge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")
    return badge


@router.put("/badges/{badge_id}", response_model=BadgeResponse)
async def update_badge(
    badge_id: int,
    badge_update: BadgeUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update badge (Admin only)"""
    badge = BadgeRepository.update(db, badge_id, badge_update)
    if not badge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")
    return badge


@router.delete("/badges/{badge_id}")
async def delete_badge(
    badge_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete badge (Admin only)"""
    badge = BadgeRepository.get_by_id(db, badge_id)
    if not badge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")
    
    # Delete associated user badges first
    from app.models.gamification import UserBadges
    db.query(UserBadges).filter(UserBadges.badge_id == badge_id).delete()
    
    db.delete(badge)
    db.commit()
    return {"message": "Badge deleted successfully"}



@router.put("/badges/{badge_id}/unlock", response_model=UserBadgeResponse)
async def unlock_badge(
    badge_id: int,
    progress: int = 100,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Unlock badge for student by updating progress (Student only)"""
    from sqlalchemy.orm import joinedload
    from app.models.gamification import UserBadges
    
    # Verify badge exists
    badge = BadgeRepository.get_by_id(db, badge_id)
    if not badge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")
    
    # Update progress - check criteria before unlocking
    user_badge = UserBadgesRepository.create_or_update(
        db, current_user.id, badge_id, progress, check_criteria=True
    )
    
    # Reload with badge relationship
    user_badge_with_badge = db.query(UserBadges).options(
        joinedload(UserBadges.badge)
    ).filter(
        UserBadges.user_id == current_user.id,
        UserBadges.badge_id == badge_id
    ).first()
    
    if user_badge_with_badge:
        status_value = user_badge_with_badge.status.value if hasattr(user_badge_with_badge.status, 'value') else str(user_badge_with_badge.status)
        ub_dict = {
            "user_id": user_badge_with_badge.user_id,
            "badge_id": user_badge_with_badge.badge_id,
            "status": status_value,
            "progress": user_badge_with_badge.progress,
            "claimed_at": user_badge_with_badge.claimed_at,
            "badge": BadgeResponse.model_validate(user_badge_with_badge.badge) if user_badge_with_badge.badge else None
        }
        return UserBadgeResponse.model_validate(ub_dict)
    
    return user_badge


@router.post("/badges/{badge_id}/claim", response_model=UserBadgeResponse)
async def claim_badge(
    badge_id: int,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Claim an unlocked badge (Student only)"""
    from sqlalchemy.orm import joinedload
    from app.models.gamification import UserBadges
    
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
    
    # Reload with badge relationship
    user_badge_with_badge = db.query(UserBadges).options(
        joinedload(UserBadges.badge)
    ).filter(
        UserBadges.user_id == current_user.id,
        UserBadges.badge_id == badge_id
    ).first()
    
    if user_badge_with_badge:
        status_value = user_badge_with_badge.status.value if hasattr(user_badge_with_badge.status, 'value') else str(user_badge_with_badge.status)
        ub_dict = {
            "user_id": user_badge_with_badge.user_id,
            "badge_id": user_badge_with_badge.badge_id,
            "status": status_value,
            "progress": user_badge_with_badge.progress,
            "claimed_at": user_badge_with_badge.claimed_at,
            "badge": BadgeResponse.model_validate(user_badge_with_badge.badge) if user_badge_with_badge.badge else None
        }
        return UserBadgeResponse.model_validate(ub_dict)
    
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

