"""
Core learning models for lessons, exercises, and progress tracking.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any, Dict, List, Optional

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


class Lesson(Base):
    """Lesson model representing a learning unit."""

    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_language: Mapped[str] = mapped_column(String, nullable=False)
    difficulty_level: Mapped[str] = mapped_column(String, nullable=False)  # beginner, intermediate, advanced
    category: Mapped[str] = mapped_column(String, nullable=False)  # vocabulary, grammar, conversation, culture

    # Content structure
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)  # Structured lesson content
    learning_objectives: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # List of learning objectives
    prerequisites: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)  # List of prerequisite lesson IDs

    # Metadata
    estimated_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)  # in minutes
    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # List of tags for categorization
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    exercises: Mapped[List["Exercise"]] = relationship(back_populates="lesson")
    user_progress: Mapped[List["UserLessonProgress"]] = relationship(back_populates="lesson")

    def __repr__(self) -> str:
        return f"<Lesson(id={self.id}, title='{self.title}', level='{self.difficulty_level}')>"

    def get_difficulty_score(self) -> float:
        """Get numerical difficulty score."""
        difficulty_map = {"beginner": 1.0, "intermediate": 2.0, "advanced": 3.0}
        return difficulty_map.get(self.difficulty_level, 1.0)

    def is_accessible_for_user(self, user_proficiency: str) -> bool:
        """Check if lesson is accessible for user's proficiency level."""
        proficiency_order = ["beginner", "intermediate", "advanced"]
        user_level = proficiency_order.index(user_proficiency)
        lesson_level = proficiency_order.index(self.difficulty_level)
        return user_level >= lesson_level


class Exercise(Base):
    """Exercise model for interactive learning activities."""

    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    exercise_type: Mapped[str] = mapped_column(
        String, nullable=False
    )  # multiple_choice, fill_blank, speaking, listening

    # Exercise content
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)  # Exercise-specific content
    correct_answer: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)  # Correct answer(s)
    hints: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # List of hints
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)  # Explanation of correct answer

    # Difficulty and scoring
    difficulty_score: Mapped[float] = mapped_column(Float, default=1.0)
    base_xp: Mapped[int] = mapped_column(Integer, default=25)
    time_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)  # in seconds

    # Metadata
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    lesson: Mapped["Lesson"] = relationship(back_populates="exercises")
    user_attempts: Mapped[List["UserExerciseAttempt"]] = relationship(back_populates="exercise")

    def __repr__(self) -> str:
        return f"<Exercise(id={self.id}, title='{self.title}', type='{self.exercise_type}')>"

    def calculate_xp_reward(self, performance: float, time_taken: Optional[int] = None) -> int:
        """Calculate XP reward based on performance and time."""
        base_reward = self.base_xp

        # Performance bonus (0-100% performance)
        performance_bonus = int(base_reward * performance)

        # Time bonus (if time limit exists)
        time_bonus = 0
        if self.time_limit and time_taken:
            if time_taken < self.time_limit * 0.5:  # Fast completion
                time_bonus = int(base_reward * 0.2)
            elif time_taken < self.time_limit:  # On time
                time_bonus = int(base_reward * 0.1)

        return performance_bonus + time_bonus


class UserLessonProgress(Base):
    """Track user progress through lessons with spaced repetition."""

    __tablename__ = "user_lesson_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)

    # Progress tracking
    status: Mapped[str] = mapped_column(String, default="not_started")  # not_started, in_progress, completed, mastered
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    attempts: Mapped[int] = mapped_column(Integer, default=0)

    # Spaced repetition data
    last_reviewed: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_review: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)  # SuperMemo SM-2 algorithm

    # Performance metrics
    average_score: Mapped[float] = mapped_column(Float, default=0.0)
    best_score: Mapped[float] = mapped_column(Float, default=0.0)
    total_time_spent: Mapped[int] = mapped_column(Integer, default=0)  # in minutes

    # Metadata
    started_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="user_progress")
    lesson: Mapped["Lesson"] = relationship(back_populates="user_progress")

    def __repr__(self) -> str:
        return f"<UserLessonProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, status='{self.status}')>"

    def update_progress(self, score: float, time_spent: int) -> None:
        """Update progress with new attempt data."""
        self.attempts += 1
        self.total_time_spent += time_spent

        # Update scores
        if score > self.best_score:
            self.best_score = score

        # Update average score
        if self.attempts == 1:  # First attempt
            self.average_score = score
        else:
            new_average = ((self.average_score * (self.attempts - 1)) + score) / self.attempts
            self.average_score = new_average

        # Update completion percentage
        if score >= 0.8:  # 80% threshold for progress
            self.completion_percentage = min(100.0, self.completion_percentage + 20.0)

        # Update status
        if self.completion_percentage >= 100.0:
            self.status = "completed"
            self.completed_at = datetime.now()
        elif self.completion_percentage > 0:
            self.status = "in_progress"

        self.updated_at = datetime.now()

    def schedule_next_review(self, performance: float) -> None:
        """Schedule next review using spaced repetition algorithm."""

        # SuperMemo SM-2 algorithm
        if performance >= 0.6:  # Successful recall
            if self.review_count == 0:
                interval = 1
            elif self.review_count == 1:
                interval = 6
            else:
                interval = int(self.ease_factor * self.review_count)

            # Update ease factor
            new_ease_factor = max(
                1.3,
                self.ease_factor + (0.1 - (5 - performance * 5) * (0.08 + (5 - performance * 5) * 0.02)),
            )
            self.ease_factor = new_ease_factor
        else:  # Failed recall
            interval = 1
            self.ease_factor = max(1.3, self.ease_factor - 0.2)

        self.review_count += 1
        self.next_review = datetime.now() + timedelta(days=interval)
        self.last_reviewed = datetime.now()
        self.updated_at = datetime.now()

        logger.info(
            "Next review scheduled",
            user_id=self.user_id,
            lesson_id=self.lesson_id,
            interval=interval,
            next_review=self.next_review,
            ease_factor=self.ease_factor,
        )


class UserExerciseAttempt(Base):
    """Track individual exercise attempts for detailed analytics."""

    __tablename__ = "user_exercise_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(Integer, ForeignKey("exercises.id"), nullable=False)

    # Attempt data
    user_answer: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)  # 0.0 to 1.0
    time_taken: Mapped[int | None] = mapped_column(Integer, nullable=True)  # in seconds
    hints_used: Mapped[int] = mapped_column(Integer, default=0)

    # Feedback and learning
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Metadata
    attempted_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="user_exercise_attempts")
    exercise: Mapped["Exercise"] = relationship(back_populates="user_attempts")

    def __repr__(self) -> str:
        return f"<UserExerciseAttempt(user_id={self.user_id}, exercise_id={self.exercise_id}, score={self.score})>"

    def calculate_performance_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive performance metrics."""
        if self.score is None or self.time_taken is None:
            return {}

        # Get exercise time limit if available
        exercise_time_limit = None
        if hasattr(self, "exercise") and self.exercise and hasattr(self.exercise, "time_limit"):
            exercise_time_limit = self.exercise.time_limit

        return {
            "accuracy": self.score,
            "speed": (exercise_time_limit / self.time_taken if exercise_time_limit and self.time_taken > 0 else None),
            "efficiency": (self.score / (self.time_taken / 60) if self.time_taken > 0 else 0),  # score per minute
            "hint_usage": self.hints_used,
            "performance_category": self._categorize_performance(),
        }

    def _categorize_performance(self) -> str:
        """Categorize performance for analytics."""
        if self.score is None:
            return "unknown"

        if self.score >= 0.9:
            return "excellent"
        elif self.score >= 0.8:
            return "good"
        elif self.score >= 0.6:
            return "fair"
        else:
            return "needs_improvement"
