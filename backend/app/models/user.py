"""
User model with learning progress and gamification features.
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
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .gamification import DailyGoal, LearningStreak, UserAchievement
    from .learning import UserExerciseAttempt
    from .progress import LearningSession, ProgressRecord

logger = structlog.get_logger(__name__)


class User(Base):
    """User model with learning progress tracking."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str | None] = mapped_column(String, nullable=True)
    last_name: Mapped[str | None] = mapped_column(String, nullable=True)

    # Learning preferences
    native_language: Mapped[str] = mapped_column(String, nullable=False, default="en")
    target_language: Mapped[str] = mapped_column(String, nullable=False)
    proficiency_level: Mapped[str] = mapped_column(String, default="beginner")  # beginner, intermediate, advanced
    learning_goals: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    # Progress tracking
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    total_study_time: Mapped[int] = mapped_column(Integer, default=0)  # in minutes
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    exercises_completed: Mapped[int] = mapped_column(Integer, default=0)

    # Learning statistics
    last_study_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    average_session_length: Mapped[float] = mapped_column(Float, default=0.0)
    preferred_study_time: Mapped[str | None] = mapped_column(String, nullable=True)  # "morning", "afternoon", "evening"

    # Account status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    learning_sessions: Mapped[List["LearningSession"]] = relationship(back_populates="user")
    progress_records: Mapped[List["ProgressRecord"]] = relationship(back_populates="user")
    achievements: Mapped[List["UserAchievement"]] = relationship(back_populates="user")
    user_exercise_attempts: Mapped[List["UserExerciseAttempt"]] = relationship(back_populates="user")
    learning_streaks: Mapped[List["LearningStreak"]] = relationship(back_populates="user")
    daily_goals: Mapped[List["DailyGoal"]] = relationship(back_populates="user")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', target_language='{self.target_language}')>"

    @classmethod
    def create_user(
        cls,
        email: str,
        username: str,
        hashed_password: str,
        first_name: str | None = None,
        last_name: str | None = None,
        native_language: str = "en",
        target_language: str = "es",
        proficiency_level: str = "beginner",
        is_active: bool = True,
    ) -> "User":
        """Create a new user instance with proper initialization."""
        user = cls()
        user.email = email
        user.username = username
        user.hashed_password = hashed_password
        user.first_name = first_name
        user.last_name = last_name
        user.native_language = native_language
        user.target_language = target_language
        user.proficiency_level = proficiency_level
        user.is_active = is_active
        return user

    @property
    def level(self) -> int:
        """Calculate user level based on total XP."""
        # Simple level calculation: every 1000 XP = 1 level
        return (self.total_xp // 1000) + 1

    @property
    def xp_to_next_level(self) -> int:
        """Calculate XP needed for next level."""
        current_level = self.level
        return current_level * 1000 - self.total_xp

    @property
    def progress_to_next_level(self) -> float:
        """Calculate progress percentage to next level."""
        xp_needed = self.xp_to_next_level
        if xp_needed == 0:
            return 1.0
        return 1 - (xp_needed / 1000)

    def add_xp(self, amount: int, source: str = "lesson") -> None:
        """Add XP and update related statistics."""
        self.total_xp += amount
        self.updated_at = datetime.now()

        logger.info(
            "User XP added",
            user_id=self.id,
            amount=amount,
            source=source,
            new_total=self.total_xp,
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
        self.updated_at = datetime.now()

    def add_study_time(self, minutes: int) -> None:
        """Add study time and update statistics."""
        self.total_study_time += minutes
        self.updated_at = datetime.now()

        # Update average session length
        if self.lessons_completed > 0:
            self.average_session_length = self.total_study_time / self.lessons_completed

    def get_learning_recommendations(self) -> Dict[str, Any]:
        """Get personalized learning recommendations."""
        recommendations = {
            "daily_goal": (self.learning_goals.get("daily_goal", 30) if self.learning_goals else 30),
            "suggested_session_length": min(45, max(15, self.average_session_length * 1.2)),
            "focus_areas": self._identify_focus_areas(),
            "difficulty_adjustment": self._calculate_difficulty_adjustment(),
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

        # Calculate completion rate
        lessons_started = getattr(self, "lessons_started", self.lessons_completed)
        completion_rate = self.lessons_completed / max(1, lessons_started)

        # Calculate XP efficiency
        xp_efficiency = self.total_xp / max(1, self.total_study_time)

        # Adjust difficulty based on performance
        if completion_rate > 0.8 and xp_efficiency > 2.0:
            return 1.2  # Increase difficulty
        elif completion_rate < 0.6 or xp_efficiency < 1.0:
            return 0.8  # Decrease difficulty
        else:
            return 1.0  # Keep current difficulty
