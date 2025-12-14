from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.exam import Exam, ExamAssignment, ExamResult, Question
from app.schemas.exam import ExamCreate, ExamUpdate, QuestionCreate, QuestionUpdate, ExamAssignmentCreate


class ExamRepository:
    @staticmethod
    def create(db: Session, exam_data: ExamCreate, owner_id: int) -> Exam:
        db_exam = Exam(**exam_data.model_dump(), owner_id=owner_id)
        db.add(db_exam)
        db.commit()
        db.refresh(db_exam)
        return db_exam
    
    @staticmethod
    def get_by_id(db: Session, exam_id: int) -> Optional[Exam]:
        return db.query(Exam).filter(Exam.id == exam_id).first()
    
    @staticmethod
    def get_by_owner(db: Session, owner_id: int) -> List[Exam]:
        return db.query(Exam).filter(Exam.owner_id == owner_id).all()
    
    @staticmethod
    def update(db: Session, exam_id: int, exam_update: ExamUpdate) -> Optional[Exam]:
        exam = ExamRepository.get_by_id(db, exam_id)
        if not exam:
            return None
        
        update_data = exam_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(exam, field, value)
        
        db.commit()
        db.refresh(exam)
        return exam
    
    @staticmethod
    def delete(db: Session, exam_id: int) -> bool:
        exam = ExamRepository.get_by_id(db, exam_id)
        if not exam:
            return False
        
        db.delete(exam)
        db.commit()
        return True


class QuestionRepository:
    @staticmethod
    def create(db: Session, question_data: QuestionCreate) -> Question:
        db_question = Question(**question_data.model_dump())
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        return db_question
    
    @staticmethod
    def get_by_id(db: Session, question_id: int) -> Optional[Question]:
        return db.query(Question).filter(Question.id == question_id).first()
    
    @staticmethod
    def get_by_exam(db: Session, exam_id: int) -> List[Question]:
        return db.query(Question).filter(Question.exam_id == exam_id).all()
    
    @staticmethod
    def update(db: Session, question_id: int, question_update: QuestionUpdate) -> Optional[Question]:
        question = QuestionRepository.get_by_id(db, question_id)
        if not question:
            return None
        
        update_data = question_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(question, field, value)
        
        db.commit()
        db.refresh(question)
        return question
    
    @staticmethod
    def delete(db: Session, question_id: int) -> bool:
        question = QuestionRepository.get_by_id(db, question_id)
        if not question:
            return False
        
        db.delete(question)
        db.commit()
        return True


class ExamAssignmentRepository:
    @staticmethod
    def create(db: Session, assignment_data: ExamAssignmentCreate, exam_id: int) -> ExamAssignment:
        assignment_dict = assignment_data.model_dump()
        assignment_dict['exam_id'] = exam_id
        db_assignment = ExamAssignment(**assignment_dict)
        db.add(db_assignment)
        db.commit()
        db.refresh(db_assignment)
        return db_assignment
    
    @staticmethod
    def get_by_id(db: Session, assignment_id: int) -> Optional[ExamAssignment]:
        return db.query(ExamAssignment).filter(ExamAssignment.id == assignment_id).first()
    
    @staticmethod
    def get_by_class(db: Session, class_id: int) -> List[ExamAssignment]:
        return db.query(ExamAssignment).filter(ExamAssignment.class_id == class_id).all()
    
    @staticmethod
    def get_by_exam(db: Session, exam_id: int) -> List[ExamAssignment]:
        return db.query(ExamAssignment).filter(ExamAssignment.exam_id == exam_id).all()


class ExamResultRepository:
    @staticmethod
    def create(db: Session, user_id: int, exam_id: int, score: float, time_taken_seconds: int) -> ExamResult:
        db_result = ExamResult(
            user_id=user_id,
            exam_id=exam_id,
            score=score,
            time_taken_seconds=time_taken_seconds
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        return db_result
    
    @staticmethod
    def get_by_user_and_exam(db: Session, user_id: int, exam_id: int) -> Optional[ExamResult]:
        return db.query(ExamResult).filter(
            ExamResult.user_id == user_id,
            ExamResult.exam_id == exam_id
        ).first()
    
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[ExamResult]:
        return db.query(ExamResult).filter(ExamResult.user_id == user_id).all()
    
    @staticmethod
    def get_by_exam(db: Session, exam_id: int) -> List[ExamResult]:
        return db.query(ExamResult).filter(ExamResult.exam_id == exam_id).all()

