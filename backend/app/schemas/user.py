"""
User-related schemas.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    """Base user schema."""
    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., description="Username")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    native_language: str = Field(..., description="Native language code")
    target_language: str = Field(..., description="Target language code")
    proficiency_level: str = Field(..., description="Proficiency level")
    is_active: bool = Field(..., description="User account status")
    created_at: datetime = Field(..., description="Account creation date")
    updated_at: Optional[datetime] = Field(None, description="Last update date")

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for user updates."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Last name")
    native_language: Optional[str] = Field(None, description="Native language code")
    target_language: Optional[str] = Field(None, description="Target language code")
    proficiency_level: Optional[str] = Field(None, description="Proficiency level")


class UserProfile(BaseModel):
    """Schema for user profile."""
    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., description="Username")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    native_language: str = Field(..., description="Native language code")
    target_language: str = Field(..., description="Target language code")
    proficiency_level: str = Field(..., description="Proficiency level")
    is_active: bool = Field(..., description="User account status")
    created_at: datetime = Field(..., description="Account creation date")
    updated_at: Optional[datetime] = Field(None, description="Last update date")

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """Schema for user statistics."""
    total_lessons_completed: int = Field(default=0, description="Total lessons completed")
    total_exercises_completed: int = Field(default=0, description="Total exercises completed")
    current_streak: int = Field(default=0, description="Current learning streak")
    longest_streak: int = Field(default=0, description="Longest learning streak")
    total_xp: int = Field(default=0, description="Total experience points")
    level: int = Field(default=1, description="Current level")
    achievements_count: int = Field(default=0, description="Number of achievements earned")
