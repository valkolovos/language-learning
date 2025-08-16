"""API endpoints package for the AI Language Learning application."""

from .ai import router as ai_router
from .auth import router as auth_router
from .exercises import router as exercises_router
from .gamification import router as gamification_router
from .lessons import router as lessons_router
from .progress import router as progress_router
from .users import router as users_router

__all__ = [
    "auth_router",
    "users_router",
    "lessons_router",
    "exercises_router",
    "progress_router",
    "gamification_router",
    "ai_router",
]
