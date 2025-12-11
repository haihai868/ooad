from fastapi import APIRouter
from app.api.v1 import auth, users, decks, learning, classroom, exam, gamification

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(decks.router, prefix="/decks", tags=["Decks"])
api_router.include_router(learning.router, prefix="/learning", tags=["Learning"])
api_router.include_router(classroom.router, prefix="/classes", tags=["Classes"])
api_router.include_router(exam.router, prefix="/exams", tags=["Exams"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])

