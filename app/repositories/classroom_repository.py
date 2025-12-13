from sqlalchemy.orm import Session
from typing import Optional, List
import secrets
from app.models.classroom import Class, ClassDecks, ClassMembers
from app.schemas.classroom import ClassCreate, ClassUpdate


class ClassRepository:
    @staticmethod
    def create(db: Session, class_data: ClassCreate, teacher_id: int) -> Class:
        # Generate unique invite code
        invite_code = secrets.token_urlsafe(8)[:10].upper()
        while ClassRepository.get_by_invite_code(db, invite_code):
            invite_code = secrets.token_urlsafe(8)[:10].upper()
        
        db_class = Class(**class_data.model_dump(), teacher_id=teacher_id, invite_code=invite_code)
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        return db_class
    
    @staticmethod
    def get_by_id(db: Session, class_id: int) -> Optional[Class]:
        return db.query(Class).filter(Class.id == class_id).first()
    
    @staticmethod
    def get_by_invite_code(db: Session, invite_code: str) -> Optional[Class]:
        return db.query(Class).filter(Class.invite_code == invite_code).first()
    
    @staticmethod
    def get_by_teacher(db: Session, teacher_id: int) -> List[Class]:
        return db.query(Class).filter(Class.teacher_id == teacher_id).all()
    
    @staticmethod
    def get_by_student(db: Session, student_id: int) -> List[Class]:
        memberships = db.query(ClassMembers).filter(ClassMembers.student_id == student_id).all()
        class_ids = [m.class_id for m in memberships]
        return db.query(Class).filter(Class.id.in_(class_ids)).all()
    
    @staticmethod
    def update(db: Session, class_id: int, class_update: ClassUpdate) -> Optional[Class]:
        class_obj = ClassRepository.get_by_id(db, class_id)
        if not class_obj:
            return None
        
        update_data = class_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(class_obj, field, value)
        
        db.commit()
        db.refresh(class_obj)
        return class_obj
    
    @staticmethod
    def delete(db: Session, class_id: int) -> bool:
        class_obj = ClassRepository.get_by_id(db, class_id)
        if not class_obj:
            return False
        
        db.delete(class_obj)
        db.commit()
        return True


class ClassDecksRepository:
    @staticmethod
    def assign_deck(db: Session, class_id: int, deck_id: int) -> ClassDecks:
        class_deck = ClassDecks(class_id=class_id, deck_id=deck_id)
        db.add(class_deck)
        db.commit()
        db.refresh(class_deck)
        return class_deck
    
    @staticmethod
    def remove_deck(db: Session, class_id: int, deck_id: int) -> bool:
        class_deck = db.query(ClassDecks).filter(
            ClassDecks.class_id == class_id,
            ClassDecks.deck_id == deck_id
        ).first()
        if not class_deck:
            return False
        db.delete(class_deck)
        db.commit()
        return True
    
    @staticmethod
    def get_decks_by_class(db: Session, class_id: int) -> List:
        from app.models.deck import Deck
        class_decks = db.query(ClassDecks).filter(ClassDecks.class_id == class_id).all()
        deck_ids = [cd.deck_id for cd in class_decks]
        return db.query(Deck).filter(Deck.id.in_(deck_ids)).all()


class ClassMembersRepository:
    @staticmethod
    def add_member(db: Session, class_id: int, student_id: int) -> ClassMembers:
        class_member = ClassMembers(class_id=class_id, student_id=student_id)
        db.add(class_member)
        db.commit()
        db.refresh(class_member)
        return class_member
    
    @staticmethod
    def remove_member(db: Session, class_id: int, student_id: int) -> bool:
        class_member = db.query(ClassMembers).filter(
            ClassMembers.class_id == class_id,
            ClassMembers.student_id == student_id
        ).first()
        if not class_member:
            return False
        db.delete(class_member)
        db.commit()
        return True
    
    @staticmethod
    def get_members_by_class(db: Session, class_id: int) -> List:
        from app.models.user import User
        members = db.query(ClassMembers).filter(ClassMembers.class_id == class_id).all()
        student_ids = [m.student_id for m in members]
        return db.query(User).filter(User.id.in_(student_ids)).all()
    
    @staticmethod
    def is_member(db: Session, class_id: int, student_id: int) -> bool:
        return db.query(ClassMembers).filter(
            ClassMembers.class_id == class_id,
            ClassMembers.student_id == student_id
        ).first() is not None
    
    @staticmethod
    def get_classes_by_student(db: Session, student_id: int) -> List[Class]:
        members = db.query(ClassMembers).filter(ClassMembers.student_id == student_id).all()
        class_ids = [m.class_id for m in members]
        if not class_ids:
            return []
        return db.query(Class).filter(Class.id.in_(class_ids)).all()

