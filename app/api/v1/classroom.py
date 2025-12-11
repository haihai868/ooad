from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_current_teacher, get_current_student
from app.models.user import User
from app.schemas.classroom import (
    ClassCreate, ClassUpdate, ClassResponse, ClassWithDetails,
    ClassDeckAssign, ClassMemberJoin, ClassMemberResponse
)
from app.repositories.classroom_repository import (
    ClassRepository, ClassDecksRepository, ClassMembersRepository
)

router = APIRouter()


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create a new class (Teacher only)"""
    return ClassRepository.create(db, class_data, current_user.id)


@router.get("/", response_model=List[ClassResponse])
async def get_my_classes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get classes for current user"""
    from app.models.user import UserRole
    if current_user.role == UserRole.TEACHER:
        return ClassRepository.get_by_teacher(db, current_user.id)
    else:
        return ClassRepository.get_by_student(db, current_user.id)


@router.get("/{class_id}", response_model=ClassWithDetails)
async def get_class(
    class_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get class details"""
    class_obj = ClassRepository.get_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    
    # Check access
    if class_obj.teacher_id != current_user.id:
        if not ClassMembersRepository.is_member(db, class_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this class"
            )
    
    members = ClassMembersRepository.get_members_by_class(db, class_id)
    decks = ClassDecksRepository.get_decks_by_class(db, class_id)
    
    return {
        **ClassResponse.model_validate(class_obj).model_dump(),
        "member_count": len(members),
        "deck_count": len(decks)
    }


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_update: ClassUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update class (Teacher only)"""
    class_obj = ClassRepository.get_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this class"
        )
    
    return ClassRepository.update(db, class_id, class_update)


@router.delete("/{class_id}")
async def delete_class(
    class_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Delete class (Teacher only)"""
    class_obj = ClassRepository.get_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this class"
        )
    
    ClassRepository.delete(db, class_id)
    return {"message": "Class deleted successfully"}


@router.post("/{class_id}/decks", response_model=dict)
async def assign_deck_to_class(
    class_id: int,
    deck_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Assign deck to class (Teacher only)"""
    class_obj = ClassRepository.get_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to assign decks to this class"
        )
    
    # TODO: Send notifications to class members
    ClassDecksRepository.assign_deck(db, class_id, deck_id)
    return {"message": "Deck assigned to class successfully"}


@router.delete("/{class_id}/decks/{deck_id}")
async def remove_deck_from_class(
    class_id: int,
    deck_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Remove deck from class (Teacher only)"""
    class_obj = ClassRepository.get_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove decks from this class"
        )
    
    ClassDecksRepository.remove_deck(db, class_id, deck_id)
    return {"message": "Deck removed from class successfully"}


@router.post("/join", response_model=ClassMemberResponse)
async def join_class(
    invite_code: str,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Join class using invite code (Student only)"""
    class_obj = ClassRepository.get_by_invite_code(db, invite_code)
    if not class_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite code")
    
    if ClassMembersRepository.is_member(db, class_obj.id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member of this class"
        )
    
    return ClassMembersRepository.add_member(db, class_obj.id, current_user.id)


@router.delete("/{class_id}/members/me")
async def leave_class(
    class_id: int,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Leave class (Student only)"""
    ClassMembersRepository.remove_member(db, class_id, current_user.id)
    return {"message": "Left class successfully"}

