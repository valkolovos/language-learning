"""
Core learning models for lessons, exercises, and progress tracking.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import structlog

from app.core.database import Base

logger = structlog.get_logger(__name__)


class Lesson(Base):
    """Lesson model representing a learning unit."""
    
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    target_language = Column(String, nullable=False)
    difficulty_level = Column(String, nullable=False)  # beginner, intermediate, advanced
    category = Column(String, nullable=False)  # vocabulary, grammar, conversation, culture
    
    # Content structure
    content = Column(JSON, nullable=False)  # Structured lesson content
    learning_objectives = Column(JSON)  # List of learning objectives
    prerequisites = Column(JSON)  # List of prerequisite lesson IDs
    
    # Metadata
    estimated_duration = Column(Integer)  # in minutes
    tags = Column(JSON)  # List of tags for categorization
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    exercises = relationship("Exercise", back_populates="lesson")
    user_progress = relationship("UserLessonProgress", back_populates="lesson")
    
    def __repr__(self):
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
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    exercise_type = Column(String, nullable=False)  # multiple_choice, fill_blank, speaking, listening
    
    # Exercise content
    content = Column(JSON, nullable=False)  # Exercise-specific content
    correct_answer = Column(JSON)  # Correct answer(s)
    hints = Column(JSON)  # List of hints
    explanation = Column(Text)  # Explanation of correct answer
    
    # Difficulty and scoring
    difficulty_score = Column(Float, default=1.0)
    base_xp = Column(Integer, default=25)
    time_limit = Column(Integer)  # in seconds
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    lesson = relationship("Lesson", back_populates="exercises")
    user_attempts = relationship("UserExerciseAttempt", back_populates="exercise")
    
    def __repr__(self):
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
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    
    # Progress tracking
    status = Column(String, default="not_started")  # not_started, in_progress, completed, mastered
    completion_percentage = Column(Float, default=0.0)
    attempts = Column(Integer, default=0)
    
    # Spaced repetition data
    last_reviewed = Column(DateTime)
    next_review = Column(DateTime)
    review_count = Column(Integer, default=0)
    ease_factor = Column(Float, default=2.5)  # SuperMemo SM-2 algorithm
    
    # Performance metrics
    average_score = Column(Float, default=0.0)
    best_score = Column(Float, default=0.0)
    total_time_spent = Column(Integer, default=0)  # in minutes
    
    # Metadata
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="user_progress")
    lesson = relationship("Lesson", back_populates="user_progress")
    
    def __repr__(self):
        return f"<UserLessonProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, status='{self.status}')>"
    
    def update_progress(self, score: float, time_spent: int) -> None:
        """Update progress with new attempt data."""
        self.attempts += 1
        self.total_time_spent += time_spent
        
        # Update scores
        if score > self.best_score:
            self.best_score = score
        
        # Update average score
        if self.attempts == 1:
            self.average_score = score
        else:
            self.average_score = ((self.average_score * (self.attempts - 1)) + score) / self.attempts
        
        # Update completion percentage
        if score >= 0.8:  # 80% threshold for progress
            self.completion_percentage = min(100.0, self.completion_percentage + 20.0)
        
        # Update status
        if self.completion_percentage >= 100.0:
            self.status = "completed"
            self.completed_at = func.now()
        elif self.completion_percentage > 0:
            self.status = "in_progress"
        
        self.updated_at = func.now()
    
    def schedule_next_review(self, performance: float) -> None:
        """Schedule next review using spaced repetition algorithm."""
        from app.core.config import settings
        
        # SuperMemo SM-2 algorithm
        if performance >= 0.6:  # Successful recall
            if self.review_count == 0:
                interval = 1
            elif self.review_count == 1:
                interval = 6
            else:
                interval = int(self.ease_factor * self.review_count)
            
            # Update ease factor
            self.ease_factor = max(1.3, self.ease_factor + (0.1 - (5 - performance * 5) * (0.08 + (5 - performance * 5) * 0.02)))
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
            ease_factor=self.ease_factor
        )


class UserExerciseAttempt(Base):
    """Track individual exercise attempts for detailed analytics."""
    
    __tablename__ = "user_exercise_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    
    # Attempt data
    user_answer = Column(JSON)
    is_correct = Column(Boolean)
    score = Column(Float)  # 0.0 to 1.0
    time_taken = Column(Integer)  # in seconds
    hints_used = Column(Integer, default=0)
    
    # Feedback and learning
    feedback = Column(Text)
    learning_notes = Column(Text)
    
    # Metadata
    attempted_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    exercise = relationship("Exercise", back_populates="user_attempts")
    
    def __repr__(self):
        return f"<UserExerciseAttempt(user_id={self.user_id}, exercise_id={self.exercise_id}, score={self.score})>"
    
    def calculate_performance_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive performance metrics."""
        return {
            "accuracy": self.score,
            "speed": self.exercise.time_limit / self.time_taken if self.exercise.time_limit else None,
            "efficiency": self.score / (self.time_taken / 60) if self.time_taken > 0 else 0,  # score per minute
            "hint_usage": self.hints_used,
            "performance_category": self._categorize_performance()
        }
    
    def _categorize_performance(self) -> str:
        """Categorize performance for analytics."""
        if self.score >= 0.9:
            return "excellent"
        elif self.score >= 0.8:
            return "good"
        elif self.score >= 0.6:
            return "fair"
        else:
            return "needs_improvement"
