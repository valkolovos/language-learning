"""
Pydantic schemas for data validation and serialization.
"""

from .auth import UserCreate, UserLogin, Token, UserResponse
from .user import User, UserUpdate, UserProfile
from .lesson import Lesson, LessonCreate, LessonUpdate, LessonResponse
from .exercise import Exercise, ExerciseCreate, ExerciseUpdate, ExerciseResponse
from .progress import UserProgress, ProgressCreate, ProgressUpdate
from .gamification import Achievement, UserAchievement, LearningStreak, DailyGoal

__all__ = [
    # Auth schemas
    "UserCreate", "UserLogin", "Token", "UserResponse",
    # User schemas
    "User", "UserUpdate", "UserProfile",
    # Lesson schemas
    "Lesson", "LessonCreate", "LessonUpdate", "LessonResponse",
    # Exercise schemas
    "Exercise", "ExerciseCreate", "ExerciseUpdate", "ExerciseResponse",
    # Progress schemas
    "UserProgress", "ProgressCreate", "ProgressUpdate",
    # Gamification schemas
    "Achievement", "UserAchievement", "LearningStreak", "DailyGoal",
]
