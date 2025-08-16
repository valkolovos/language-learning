"""
Gamification models for achievements, badges, and learning motivation.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List

import structlog
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .user import User

logger = structlog.get_logger(__name__)


# Achievement and milestone constants
class StreakMilestones:
    """Constants for learning streak milestones."""

    SEVEN_DAYS = 7
    THIRTY_DAYS = 30
    HUNDRED_DAYS = 100
    YEAR = 365


class AchievementNames:
    """Constants for achievement names to maintain consistency."""

    SEVEN_DAY_STREAK = "7_day_streak"
    THIRTY_DAY_STREAK = "30_day_streak"
    HUNDRED_DAY_STREAK = "100_day_streak"
    YEAR_STREAK = "365_day_streak"


class AchievementTypes:
    """Constants for achievement types."""

    STREAK = "streak"
    XP = "xp"
    LESSONS = "lessons"
    EXERCISES = "exercises"
    TIME = "time"


class AchievementRarities:
    """Constants for achievement rarity levels."""

    COMMON = "common"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"


class GoalTypes:
    """Constants for daily goal types."""

    STUDY_TIME = "study_time"
    LESSONS = "lessons"
    EXERCISES = "exercises"
    XP = "xp"


class Achievement(Base):
    """Achievement model for gamification rewards."""

    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon_url: Mapped[str | None] = mapped_column(String, nullable=True)

    # Achievement criteria
    achievement_type: Mapped[str] = mapped_column(String, nullable=False)
    criteria: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)  # {"threshold": 100, "timeframe": "daily"}
    xp_reward: Mapped[int] = mapped_column(Integer, default=0)

    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    rarity: Mapped[str] = mapped_column(String, default=AchievementRarities.COMMON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    user_achievements: Mapped[List["UserAchievement"]] = relationship(back_populates="achievement")

    def __repr__(self) -> str:
        return f"<Achievement(id={self.id}, name='{self.name}', type='{self.achievement_type}')>"

    def check_eligibility(self, user_stats: Dict[str, Any]) -> bool:
        """Check if user is eligible for this achievement."""
        if not self.is_active:
            return False

        threshold = self.criteria.get("threshold", 0)
        self.criteria.get("timeframe", "lifetime")

        if self.achievement_type == AchievementTypes.STREAK:
            current_streak = user_stats.get("current_streak", 0)
            return bool(current_streak >= threshold)

        elif self.achievement_type == AchievementTypes.XP:
            total_xp = user_stats.get("total_xp", 0)
            return bool(total_xp >= threshold)

        elif self.achievement_type == AchievementTypes.LESSONS:
            lessons_completed = user_stats.get("lessons_completed", 0)
            return bool(lessons_completed >= threshold)

        elif self.achievement_type == AchievementTypes.EXERCISES:
            exercises_completed = user_stats.get("exercises_completed", 0)
            return bool(exercises_completed >= threshold)

        elif self.achievement_type == AchievementTypes.TIME:
            total_study_time = user_stats.get("total_study_time", 0)
            return bool(total_study_time >= threshold)

        return False


class UserAchievement(Base):
    """Track user achievements and unlock dates."""

    __tablename__ = "user_achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id: Mapped[int] = mapped_column(Integer, ForeignKey("achievements.id"), nullable=False)

    # Achievement data
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    progress_towards: Mapped[float] = mapped_column(Float, default=0.0)  # Progress percentage towards achievement

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")

    def __repr__(self) -> str:
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"

    @property
    def is_unlocked(self) -> bool:
        """Check if achievement is unlocked."""
        return self.unlocked_at is not None


class LearningStreak(Base):
    """Track detailed learning streaks for motivation."""

    __tablename__ = "learning_streaks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    # Streak data
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    total_streaks: Mapped[int] = mapped_column(Integer, default=0)

    # Daily tracking
    last_study_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    study_dates: Mapped[list[str]] = mapped_column(JSON, default=list)  # List of study dates

    # Streak milestones
    milestone_7_days: Mapped[bool] = mapped_column(Boolean, default=False)
    milestone_30_days: Mapped[bool] = mapped_column(Boolean, default=False)
    milestone_100_days: Mapped[bool] = mapped_column(Boolean, default=False)
    milestone_365_days: Mapped[bool] = mapped_column(Boolean, default=False)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="learning_streaks")

    def __repr__(self) -> str:
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
        if self.current_streak >= StreakMilestones.SEVEN_DAYS and not self.milestone_7_days:
            self.milestone_7_days = True
            achievements.append(AchievementNames.SEVEN_DAY_STREAK)

        if self.current_streak >= StreakMilestones.THIRTY_DAYS and not self.milestone_30_days:
            self.milestone_30_days = True
            achievements.append(AchievementNames.THIRTY_DAY_STREAK)

        if self.current_streak >= StreakMilestones.HUNDRED_DAYS and not self.milestone_100_days:
            self.milestone_100_days = True
            achievements.append(AchievementNames.HUNDRED_DAY_STREAK)

        if self.current_streak >= StreakMilestones.YEAR and not self.milestone_365_days:
            self.milestone_365_days = True
            achievements.append(AchievementNames.YEAR_STREAK)

        self.last_study_date = study_date
        self.updated_at = datetime.now()

        logger.info(
            "Learning streak updated",
            user_id=self.user_id,
            current_streak=self.current_streak,
            longest_streak=self.longest_streak,
            achievements=achievements,
        )

        return {
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "achievements": achievements,
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
                "365_days": self.milestone_365_days,
            },
        }


class DailyGoal(Base):
    """Track daily learning goals and progress."""

    __tablename__ = "daily_goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    # Goal data
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    goal_type: Mapped[str] = mapped_column(String, nullable=False)
    target_value: Mapped[int] = mapped_column(Integer, nullable=False)
    current_value: Mapped[int] = mapped_column(Integer, default=0)

    # Goal status
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="daily_goals")

    def __repr__(self) -> str:
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
