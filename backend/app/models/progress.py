"""
Progress tracking models for learning sessions and progress records.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

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


class LearningSession(Base):
    """Track individual learning sessions for analytics and progress tracking."""

    __tablename__ = "learning_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    # Session data
    session_type: Mapped[str] = mapped_column(String, nullable=False)  # lesson, exercise, review, practice
    start_time: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Session content
    lessons_covered: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)  # List of lesson IDs
    exercises_attempted: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)  # List of exercise IDs
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)

    # Session metadata
    device_info: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Session status
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="learning_sessions")

    def __repr__(self) -> str:
        return f"<LearningSession(id={self.id}, user_id={self.user_id}, type='{self.session_type}')>"

    def complete_session(self, end_time: datetime | None = None) -> None:
        """Mark session as completed and calculate duration."""
        if end_time is None:
            end_time = datetime.now()

        self.end_time = end_time
        self.is_completed = True

        if self.start_time:
            duration = (end_time - self.start_time).total_seconds() / 60
            self.duration_minutes = int(duration)

        self.updated_at = datetime.now()

    def add_lesson(self, lesson_id: int) -> None:
        """Add a lesson to the session."""
        if self.lessons_covered is None:
            self.lessons_covered = []
        self.lessons_covered.append(lesson_id)

    def add_exercise(self, exercise_id: int) -> None:
        """Add an exercise to the session."""
        if self.exercises_attempted is None:
            self.exercises_attempted = []
        self.exercises_attempted.append(exercise_id)

    def add_xp(self, amount: int) -> None:
        """Add XP earned during the session."""
        self.xp_earned += amount


class ProgressRecord(Base):
    """Track overall learning progress and milestones."""

    __tablename__ = "progress_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    # Progress data
    record_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    progress_type: Mapped[str] = mapped_column(String, nullable=False)  # daily, weekly, monthly, milestone

    # Metrics
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    exercises_completed: Mapped[int] = mapped_column(Integer, default=0)
    xp_gained: Mapped[int] = mapped_column(Integer, default=0)
    study_time_minutes: Mapped[int] = mapped_column(Integer, default=0)
    accuracy_rate: Mapped[float] = mapped_column(Float, default=0.0)

    # Goals and achievements
    goals_met: Mapped[int] = mapped_column(Integer, default=0)
    goals_total: Mapped[int] = mapped_column(Integer, default=0)
    achievements_unlocked: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    # Learning insights
    focus_areas: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    difficulty_level: Mapped[str | None] = mapped_column(String, nullable=True)
    learning_patterns: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    # Metadata
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="progress_records")

    def __repr__(self) -> str:
        return f"<ProgressRecord(id={self.id}, user_id={self.user_id}, date='{self.record_date.date()}')>"

    @property
    def goal_completion_rate(self) -> float:
        """Calculate goal completion rate."""
        if self.goals_total == 0:
            return 0.0
        return (self.goals_met / self.goals_total) * 100

    @property
    def study_efficiency(self) -> float:
        """Calculate study efficiency (XP per minute)."""
        if self.study_time_minutes == 0:
            return 0.0
        return self.xp_gained / self.study_time_minutes

    def add_achievement(self, achievement_name: str) -> None:
        """Add an achievement to the record."""
        if self.achievements_unlocked is None:
            self.achievements_unlocked = []
        if achievement_name not in self.achievements_unlocked:
            self.achievements_unlocked.append(achievement_name)

    def update_metrics(self, **kwargs: Any) -> None:
        """Update progress metrics."""
        for key, value in kwargs.items():
            if hasattr(self, key):
                current_value = getattr(self, key, 0)
                if isinstance(current_value, (int, float)):
                    setattr(self, key, current_value + value)
                else:
                    setattr(self, key, value)

        self.updated_at = datetime.now()
