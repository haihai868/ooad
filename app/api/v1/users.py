from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_current_admin
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserPreferencesResponse, UserPreferencesUpdate
from app.repositories.user_repository import UserRepository
from app.models.user import UserPreferences

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    updated_user = UserRepository.update(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated_user


@router.get("/me/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user preferences"""
    preferences = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not preferences:
        # Create default preferences
        from app.schemas.user import UserPreferencesCreate
        preferences = UserPreferences(user_id=current_user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    return preferences


@router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences_update: UserPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user preferences"""
    preferences = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not preferences:
        preferences = UserPreferences(user_id=current_user.id)
        db.add(preferences)
    
    update_data = preferences_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(preferences, field, value)
    
    db.commit()
    db.refresh(preferences)
    return preferences


@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users (Admin only)"""
    return UserRepository.get_all(db, skip, limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get user by ID (Admin only)"""
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update user (Admin only)"""
    updated_user = UserRepository.update(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated_user


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete user (Admin only)"""
    # Prevent deleting yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    try:
        # Delete related records first (in correct order to avoid foreign key issues)
        from app.models.gamification import UserBadges
        from app.models.learning import UserStats, CardRetentionData, ReviewLogs, AlgoConfigs
        from app.models.deck import UserFavoriteDecks, Deck
        from app.models.classroom import ClassMembers, Class
        from app.models.exam import ExamResult, Exam
        
        # Delete exam results first (references exams)
        db.query(ExamResult).filter(ExamResult.user_id == user_id).delete()
        db.commit()
        
        # Delete decks owned by user (will cascade delete flashcards, favorites, etc.)
        db.query(Deck).filter(Deck.owner_id == user_id).delete()
        db.commit()
        
        # Delete exams owned by user (will cascade delete questions, assignments, results)
        db.query(Exam).filter(Exam.owner_id == user_id).delete()
        db.commit()
        
        # Delete classes owned by user (will cascade delete members, decks, exams)
        db.query(Class).filter(Class.teacher_id == user_id).delete()
        db.commit()
        
        # Delete user badges
        db.query(UserBadges).filter(UserBadges.user_id == user_id).delete()
        # Delete user stats
        db.query(UserStats).filter(UserStats.user_id == user_id).delete()
        # Delete card retention data
        db.query(CardRetentionData).filter(CardRetentionData.user_id == user_id).delete()
        # Delete review logs
        db.query(ReviewLogs).filter(ReviewLogs.user_id == user_id).delete()
        # Delete algo configs
        db.query(AlgoConfigs).filter(AlgoConfigs.user_id == user_id).delete()
        # Delete favorite decks
        db.query(UserFavoriteDecks).filter(UserFavoriteDecks.user_id == user_id).delete()
        # Delete class memberships
        db.query(ClassMembers).filter(ClassMembers.student_id == user_id).delete()
        
        db.commit()
        
        # Now delete the user
        success = UserRepository.delete(db, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        error_detail = str(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {error_detail}"
        )

