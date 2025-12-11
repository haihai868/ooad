from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_current_teacher, get_current_student
from app.models.user import User
from app.schemas.exam import (
    ExamCreate, ExamUpdate, ExamResponse, ExamWithQuestions,
    QuestionCreate, QuestionUpdate, QuestionResponse,
    ExamAssignmentCreate, ExamAssignmentResponse,
    ExamResultResponse, TakeExamRequest
)
from app.repositories.exam_repository import (
    ExamRepository, QuestionRepository, ExamAssignmentRepository, ExamResultRepository
)
from app.repositories.classroom_repository import ClassMembersRepository

router = APIRouter()


# Exam endpoints
@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_exam(
    exam_data: ExamCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create a new exam (Teacher only)"""
    return ExamRepository.create(db, exam_data, current_user.id)


@router.get("/", response_model=List[ExamResponse])
async def get_my_exams(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Get current user's exams (Teacher only)"""
    return ExamRepository.get_by_owner(db, current_user.id)


@router.get("/{exam_id}", response_model=ExamWithQuestions)
async def get_exam(
    exam_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get exam by ID with questions"""
    exam = ExamRepository.get_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    # Check access
    from app.models.user import UserRole
    if exam.owner_id != current_user.id and current_user.role not in [UserRole.STUDENT, UserRole.PAID_STUDENT]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this exam"
        )
    
    questions = QuestionRepository.get_by_exam(db, exam_id)
    total_score = sum(q.score_value for q in questions)
    
    return {
        **ExamResponse.model_validate(exam).model_dump(),
        "question_count": len(questions),
        "total_score": total_score,
        "questions": [QuestionResponse.model_validate(q).model_dump() for q in questions]
    }


@router.put("/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: int,
    exam_update: ExamUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update exam (Teacher only)"""
    exam = ExamRepository.get_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    if exam.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this exam"
        )
    
    return ExamRepository.update(db, exam_id, exam_update)


@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Delete exam (Teacher only)"""
    exam = ExamRepository.get_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    if exam.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this exam"
        )
    
    ExamRepository.delete(db, exam_id)
    return {"message": "Exam deleted successfully"}


# Question endpoints
@router.post("/{exam_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    exam_id: int,
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Create a question for an exam (Teacher only)"""
    exam = ExamRepository.get_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    if exam.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add questions to this exam"
        )
    
    question_data.exam_id = exam_id
    return QuestionRepository.create(db, question_data)


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_update: QuestionUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update question (Teacher only)"""
    question = QuestionRepository.get_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    
    exam = ExamRepository.get_by_id(db, question.exam_id)
    if exam.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this question"
        )
    
    return QuestionRepository.update(db, question_id, question_update)


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Delete question (Teacher only)"""
    question = QuestionRepository.get_by_id(db, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    
    exam = ExamRepository.get_by_id(db, question.exam_id)
    if exam.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this question"
        )
    
    QuestionRepository.delete(db, question_id)
    return {"message": "Question deleted successfully"}


# Exam Assignment endpoints
@router.post("/{exam_id}/assign", response_model=ExamAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def assign_exam_to_class(
    exam_id: int,
    assignment_data: ExamAssignmentCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Assign exam to class (Teacher only)"""
    exam = ExamRepository.get_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    if exam.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to assign this exam"
        )
    
    assignment_data.exam_id = exam_id
    assignment = ExamAssignmentRepository.create(db, assignment_data)
    
    # TODO: Send notifications to class members
    
    return assignment


# Exam Taking endpoints
@router.post("/{exam_id}/take", response_model=ExamResultResponse)
async def take_exam(
    exam_id: int,
    exam_answers: TakeExamRequest,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Take an exam (Student only)"""
    exam = ExamRepository.get_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    # Check if exam is assigned to a class the student belongs to
    assignments = ExamAssignmentRepository.get_by_exam(db, exam_id)
    can_take = False
    for assignment in assignments:
        if ClassMembersRepository.is_member(db, assignment.class_id, current_user.id):
            # Check if within time window
            now = datetime.utcnow()
            if assignment.start_date <= now <= assignment.due_date:
                can_take = True
                break
    
    if not can_take:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Exam not available or not assigned to your class"
        )
    
    # Check if already taken
    existing_result = ExamResultRepository.get_by_user_and_exam(db, current_user.id, exam_id)
    if existing_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam already taken"
        )
    
    # Grade the exam
    questions = QuestionRepository.get_by_exam(db, exam_id)
    total_score = 0.0
    earned_score = 0.0
    
    for question in questions:
        total_score += question.score_value
        selected_answer = exam_answers.answers.get(str(question.id))
        if selected_answer == question.correct_option:
            earned_score += question.score_value
    
    final_score = (earned_score / total_score * 100) if total_score > 0 else 0.0
    
    # Create result (time_taken_seconds would come from frontend)
    result = ExamResultRepository.create(
        db, current_user.id, exam_id, final_score, 0
    )
    
    return result


@router.get("/results/my", response_model=List[ExamResultResponse])
async def get_my_exam_results(
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Get current user's exam results (Student only)"""
    return ExamResultRepository.get_by_user(db, current_user.id)

