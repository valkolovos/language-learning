"""Gamification schemas placeholder."""
from pydantic import BaseModel, Field

class Achievement(BaseModel):
    id: int = Field(..., description="Achievement ID")

class UserAchievement(BaseModel):
    id: int = Field(..., description="User Achievement ID")

class LearningStreak(BaseModel):
    id: int = Field(..., description="Learning Streak ID")

class DailyGoal(BaseModel):
    id: int = Field(..., description="Daily Goal ID")
