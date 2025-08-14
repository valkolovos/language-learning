"""
Gamification models for achievements, badges, and learning motivation.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import structlog

from app.core.database import Base

logger = structlog.get_logger(__name__)


class Achievement(Base):
    """Achievement model for gamification rewards."""
    
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    icon_url = Column(String)
    
    # Achievement criteria
    achievement_type = Column(String, nullable=False)  # streak, xp, lessons, exercises, time
    criteria = Column(JSON, nullable=False)  # {"threshold": 100, "timeframe": "daily"}
    xp_reward = Column(Integer, default=0)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")
    
    def __repr__(self):
        return f"<Achievement(id={self.id}, name='{self.name}', type='{self.achievement_type}')>"
    
    def check_eligibility(self, user_stats: Dict[str, Any]) -> bool:
        """Check if user is eligible for this achievement."""
        if not self.is_active:
            return False
        
        threshold = self.criteria.get("threshold", 0)
        timeframe = self.criteria.get("timeframe", "lifetime")
        
        if self.achievement_type == "streak":
            current_streak = user_stats.get("current_streak", 0)
            return current_streak >= threshold
        
        elif self.achievement_type == "xp":
            total_xp = user_stats.get("total_xp", 0)
            return total_xp >= threshold
        
        elif self.achievement_type == "lessons":
            lessons_completed = user_stats.get("lessons_completed", 0)
            return lessons_completed >= threshold
        
        elif self.achievement_type == "exercises":
            exercises_completed = user_stats.get("exercises_completed", 0)
            return exercises_completed >= threshold
        
        elif self.achievement_type == "time":
            total_study_time = user_stats.get("total_study_time", 0)
            return total_study_time >= threshold
        
        return False


class UserAchievement(Base):
    """Track user achievements and unlock dates."""
    
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    
    # Achievement data
    unlocked_at = Column(DateTime, default=func.now())
    progress_towards = Column(Float, default=0.0)  # Progress percentage towards achievement
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"
    
    @property
    def is_unlocked(self) -> bool:
        """Check if achievement is unlocked."""
        return self.unlocked_at is not None


class LearningStreak(Base):
    """Track detailed learning streaks for motivation."""
    
    __tablename__ = "learning_streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Streak data
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_streaks = Column(Integer, default=0)
    
    # Daily tracking
    last_study_date = Column(DateTime)
    study_dates = Column(JSON, default=list)  # List of study dates
    
    # Streak milestones
    milestone_7_days = Column(Boolean, default=False)
    milestone_30_days = Column(Boolean, default=False)
    milestone_100_days = Column(Boolean, default=False)
    milestone_365_days = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<LearningStreak(user_id={self.user_id}, current_streak={self.current_streak})>"
    
    def update_streak(self, study_date: datetime) -> Dict[str, Any]:
        """Update learning streak and return milestone achievements."""
        achievements = []
        
        # Convert to date for comparison
        study_date_only = study_date.date()
        
        if not self.last_study_date:
            # First study session
            self.current_streak = 1
            self.study_dates = [study_date_only.isoformat()]
        else:
            last_date = self.last_study_date.date()
            days_diff = (study_date_only - last_date).days
            
            if days_diff == 1:  # Consecutive day
                self.current_streak += 1
                self.study_dates.append(study_date_only.isoformat())
            elif days_diff == 0:  # Same day
                pass  # Keep current streak
            else:  # Break in streak
                if self.current_streak > 0:
                    self.total_streaks += 1
                self.current_streak = 1
                self.study_dates = [study_date_only.isoformat()]
        
        # Update longest streak
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        # Check milestones
        if self.current_streak >= 7 and not self.milestone_7_days:
            self.milestone_7_days = True
            achievements.append("7_day_streak")
        
        if self.current_streak >= 30 and not self.milestone_30_days:
            self.milestone_30_days = True
            achievements.append("30_day_streak")
        
        if self.current_streak >= 100 and not self.milestone_100_days:
            self.milestone_100_days = True
            achievements.append("100_day_streak")
        
        if self.current_streak >= 365 and not self.milestone_365_days:
            self.milestone_365_days = True
            achievements.append("365_day_streak")
        
        self.last_study_date = study_date
        self.updated_at = datetime.now()
        
        logger.info(
            "Learning streak updated",
            user_id=self.user_id,
            current_streak=self.current_streak,
            longest_streak=self.longest_streak,
            achievements=achievements
        )
        
        return {
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "achievements": achievements
        }
    
    def get_streak_stats(self) -> Dict[str, Any]:
        """Get comprehensive streak statistics."""
        return {
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "total_streaks": self.total_streaks,
            "study_dates_count": len(self.study_dates),
            "milestones": {
                "7_days": self.milestone_7_days,
                "30_days": self.milestone_30_days,
                "100_days": self.milestone_100_days,
                "365_days": self.milestone_365_days
            }
        }


class DailyGoal(Base):
    """Track daily learning goals and progress."""
    
    __tablename__ = "daily_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Goal data
    date = Column(DateTime, nullable=False)
    goal_type = Column(String, nullable=False)  # study_time, lessons, exercises, xp
    target_value = Column(Integer, nullable=False)
    current_value = Column(Integer, default=0)
    
    # Goal status
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    
    # Metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<DailyGoal(user_id={self.user_id}, date='{self.date.date()}', type='{self.goal_type}')>"
    
    @property
    def progress_percentage(self) -> float:
        """Calculate progress percentage towards goal."""
        if self.target_value == 0:
            return 0.0
        return min(100.0, (self.current_value / self.target_value) * 100)
    
    @property
    def is_overdue(self) -> bool:
        """Check if goal is overdue (past date and not completed)."""
        return not self.is_completed and self.date.date() < datetime.now().date()
    
    def update_progress(self, value: int) -> bool:
        """Update progress and check if goal is completed."""
        self.current_value += value
        self.updated_at = datetime.now()
        
        # Check completion
        if self.current_value >= self.target_value and not self.is_completed:
            self.is_completed = True
            self.completed_at = datetime.now()
            return True
        
        return False
    
    def get_motivational_message(self) -> str:
        """Get motivational message based on progress."""
        if self.is_completed:
            return "🎉 Goal completed! Great job!"
        elif self.progress_percentage >= 80:
            return "💪 Almost there! You're so close!"
        elif self.progress_percentage >= 50:
            return "🚀 Halfway there! Keep going!"
        elif self.progress_percentage >= 25:
            return "🌟 Good start! Every step counts!"
        else:
            return "🌱 Let's get started! You've got this!"
