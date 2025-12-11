from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    invite_code = Column(String(10), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teacher = relationship("User", back_populates="owned_classes", foreign_keys=[teacher_id])
    class_decks = relationship("ClassDecks", back_populates="class_entity")
    members = relationship("ClassMembers", back_populates="class_entity")
    exam_assignments = relationship("ExamAssignment", back_populates="class_entity")


class ClassDecks(Base):
    __tablename__ = "class_decks"

    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), primary_key=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"), primary_key=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    class_entity = relationship("Class", back_populates="class_decks", foreign_keys=[class_id])
    deck = relationship("Deck", back_populates="class_assignments", foreign_keys=[deck_id])


class ClassMembers(Base):
    __tablename__ = "class_members"

    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    class_entity = relationship("Class", back_populates="members")
    student = relationship("User", back_populates="class_memberships", foreign_keys=[student_id])

