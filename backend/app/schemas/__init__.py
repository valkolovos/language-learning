"""Schemas package for the AI Language Learning application."""

from .auth import UserCreate, UserLogin, UserResponse, UserUpdate
from .exercise import ExerciseCreate, ExerciseResponse, ExerciseUpdate
from .gamification import Achievement, LearningStreak
from .lesson import LessonCreate, LessonResponse, LessonUpdate
from .progress import ProgressCreate, ProgressUpdate
from .user import UserProfile, UserStats

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "UserProfile",
    "UserStats",
    "LessonCreate",
    "LessonResponse",
    "LessonUpdate",
    "ExerciseCreate",
    "ExerciseResponse",
    "ExerciseUpdate",
    "ProgressCreate",
    "ProgressUpdate",
    "Achievement",
    "LearningStreak",
]
