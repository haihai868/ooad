from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, BIGINT, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_exams", foreign_keys=[owner_id])
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    exam_assignments = relationship("ExamAssignment", back_populates="exam")
    exam_results = relationship("ExamResult", back_populates="exam")


class ExamAssignment(Base):
    __tablename__ = "exam_assignments"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)

    class_entity = relationship("Class", back_populates="exam_assignments")
    exam = relationship("Exam", back_populates="exam_assignments")


class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(BIGINT, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    time_taken_seconds = Column(Integer, nullable=False)

    user = relationship("User", back_populates="exam_results")
    exam = relationship("Exam", back_populates="exam_results")


class Question(Base):
    __tablename__ = "questions"

    id = Column(BIGINT, primary_key=True, index=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    content = Column(String(500), nullable=False)
    options_json = Column(JSON, nullable=False)
    correct_option = Column(String(10), nullable=False)
    score_value = Column(Float, default=1.0)

    exam = relationship("Exam", back_populates="questions")

