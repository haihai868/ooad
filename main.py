from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.core.database import Base, engine


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Flashcard Learning System API",
    description="Backend API for Flashcard Learning System",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {"message": "Flashcard Learning System API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

