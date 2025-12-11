from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Exam Schemas
class ExamBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    duration_minutes: int = Field(..., gt=0)


class ExamCreate(ExamBase):
    pass


class ExamUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    duration_minutes: Optional[int] = Field(None, gt=0)


class ExamResponse(ExamBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExamWithDetails(ExamResponse):
    question_count: int = 0
    total_score: float = 0.0


# Question Schemas
class QuestionBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)
    options_json: Dict[str, Any] = Field(..., description="JSON object with options")
    correct_option: str = Field(..., max_length=10)
    score_value: float = 1.0


class QuestionCreate(QuestionBase):
    exam_id: int


class QuestionUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=500)
    options_json: Optional[Dict[str, Any]] = None
    correct_option: Optional[str] = Field(None, max_length=10)
    score_value: Optional[float] = None


class QuestionResponse(QuestionBase):
    id: int
    exam_id: int

    class Config:
        from_attributes = True


# Exam with Questions
class ExamWithQuestions(ExamResponse):
    questions: List[QuestionResponse] = []


# Exam Assignment Schemas
class ExamAssignmentBase(BaseModel):
    class_id: int
    exam_id: int
    start_date: datetime
    due_date: datetime


class ExamAssignmentCreate(ExamAssignmentBase):
    pass


class ExamAssignmentUpdate(BaseModel):
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None


class ExamAssignmentResponse(ExamAssignmentBase):
    id: int

    class Config:
        from_attributes = True


# Exam Result Schemas
class ExamResultBase(BaseModel):
    user_id: int
    exam_id: int
    score: float = Field(..., ge=0)
    time_taken_seconds: int = Field(..., ge=0)


class ExamResultCreate(ExamResultBase):
    answers: Dict[str, str] = Field(..., description="Question ID to selected option mapping")


class ExamResultResponse(ExamResultBase):
    id: int
    submitted_at: datetime

    class Config:
        from_attributes = True


# Take Exam Request
class TakeExamRequest(BaseModel):
    answers: Dict[str, str] = Field(..., description="Question ID to selected option mapping")

