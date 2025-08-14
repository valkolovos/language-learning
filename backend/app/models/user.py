"""
User model with learning progress and gamification features.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from typing import Optional, List
import structlog

from app.core.database import Base

logger = structlog.get_logger(__name__)


class User(Base):
    """User model with learning progress tracking."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    
    # Learning preferences
    native_language = Column(String, nullable=False, default="en")
    target_language = Column(String, nullable=False)
    proficiency_level = Column(String, default="beginner")  # beginner, intermediate, advanced
    learning_goals = Column(JSON)  # {"daily_goal": 30, "weekly_goal": 180}
    
    # Progress tracking
    total_xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_study_time = Column(Integer, default=0)  # in minutes
    lessons_completed = Column(Integer, default=0)
    exercises_completed = Column(Integer, default=0)
    
    # Learning statistics
    last_study_date = Column(DateTime)
    average_session_length = Column(Float, default=0.0)
    preferred_study_time = Column(String)  # "morning", "afternoon", "evening"
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    learning_sessions = relationship("LearningSession", back_populates="user")
    progress_records = relationship("ProgressRecord", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', target_language='{self.target_language}')>"
    
    @property
    def level(self) -> int:
        """Calculate user level based on total XP."""
        # Simple level calculation: every 1000 XP = 1 level
        return (self.total_xp // 1000) + 1
    
    @property
    def xp_to_next_level(self) -> int:
        """Calculate XP needed for next level."""
        current_level = self.level
        xp_for_current_level = (current_level - 1) * 1000
        return current_level * 1000 - self.total_xp
    
    @property
    def progress_to_next_level(self) -> float:
        """Calculate progress percentage to next level."""
        if self.xp_to_next_level == 0:
            return 1.0
        return 1 - (self.xp_to_next_level / 1000)
    
    def add_xp(self, amount: int, source: str = "lesson") -> None:
        """Add XP and update related statistics."""
        self.total_xp += amount
        self.updated_at = func.now()
        
        logger.info(
            "User XP added",
            user_id=self.id,
            amount=amount,
            source=source,
            new_total=self.total_xp
        )
    
    def update_streak(self, study_date: datetime) -> None:
        """Update learning streak based on study date."""
        if not self.last_study_date:
            self.current_streak = 1
        else:
            days_diff = (study_date.date() - self.last_study_date.date()).days
            
            if days_diff == 1:  # Consecutive day
                self.current_streak += 1
            elif days_diff == 0:  # Same day
                pass  # Keep current streak
            else:  # Break in streak
                self.current_streak = 1
        
        # Update longest streak if current is longer
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.last_study_date = study_date
        self.updated_at = func.now()
    
    def add_study_time(self, minutes: int) -> None:
        """Add study time and update statistics."""
        self.total_study_time += minutes
        self.updated_at = func.now()
        
        # Update average session length
        if self.lessons_completed > 0:
            self.average_session_length = self.total_study_time / self.lessons_completed
    
    def get_learning_recommendations(self) -> dict:
        """Get personalized learning recommendations."""
        recommendations = {
            "daily_goal": self.learning_goals.get("daily_goal", 30) if self.learning_goals else 30,
            "suggested_session_length": min(45, max(15, self.average_session_length * 1.2)),
            "focus_areas": self._identify_focus_areas(),
            "difficulty_adjustment": self._calculate_difficulty_adjustment()
        }
        
        return recommendations
    
    def _identify_focus_areas(self) -> List[str]:
        """Identify areas where user needs more practice."""
        # This would be implemented based on progress analysis
        focus_areas = []
        
        if self.proficiency_level == "beginner":
            focus_areas.extend(["basic_vocabulary", "simple_grammar", "pronunciation"])
        elif self.proficiency_level == "intermediate":
            focus_areas.extend(["conversation", "complex_grammar", "idioms"])
        else:
            focus_areas.extend(["advanced_conversation", "cultural_context", "academic_language"])
        
        return focus_areas
    
    def _calculate_difficulty_adjustment(self) -> float:
        """Calculate difficulty adjustment based on performance."""
        # Simple algorithm: adjust based on completion rate and XP gain
        if self.lessons_completed == 0:
            return 1.0
        
        # This would be more sophisticated in practice
        return 1.0 + (self.current_streak * 0.05)  # Increase difficulty with streak
