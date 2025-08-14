"""
Lesson-related schemas.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Lesson(BaseModel):
    """Base lesson schema."""
    id: int = Field(..., description="Lesson ID")
    title: str = Field(..., description="Lesson title")
    description: str = Field(..., description="Lesson description")
    target_language: str = Field(..., description="Target language")
    difficulty_level: str = Field(..., description="Difficulty level")
    estimated_duration: int = Field(..., description="Estimated duration in minutes")
    created_at: datetime = Field(..., description="Creation date")

    class Config:
        from_attributes = True


class LessonCreate(BaseModel):
    """Schema for creating a lesson."""
    title: str = Field(..., description="Lesson title")
    description: str = Field(..., description="Lesson description")
    target_language: str = Field(..., description="Target language")
    difficulty_level: str = Field(..., description="Difficulty level")
    estimated_duration: int = Field(..., description="Estimated duration in minutes")


class LessonUpdate(BaseModel):
    """Schema for updating a lesson."""
    title: Optional[str] = Field(None, description="Lesson title")
    description: Optional[str] = Field(None, description="Lesson description")
    difficulty_level: Optional[str] = Field(None, description="Difficulty level")
    estimated_duration: Optional[int] = Field(None, description="Estimated duration in minutes")


class LessonResponse(BaseModel):
    """Schema for lesson response."""
    id: int = Field(..., description="Lesson ID")
    title: str = Field(..., description="Lesson title")
    description: str = Field(..., description="Lesson description")
    target_language: str = Field(..., description="Target language")
    difficulty_level: str = Field(..., description="Difficulty level")
    estimated_duration: int = Field(..., description="Estimated duration in minutes")
    created_at: datetime = Field(..., description="Creation date")

    class Config:
        from_attributes = True
