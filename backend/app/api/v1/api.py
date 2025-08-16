"""
Main API router for version 1 of the language learning API.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai,
    auth,
    exercises,
    gamification,
    lessons,
    progress,
    users,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
