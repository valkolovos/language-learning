"""
pytest configuration and fixtures for the AI Language Learning application.
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

from app.core.database import Base
from app.models.gamification import (
    Achievement,
    DailyGoal,
    LearningStreak,
    UserAchievement,
)
from app.models.learning import (
    Exercise,
    Lesson,
    UserExerciseAttempt,
    UserLessonProgress,
)
from app.models.user import User


# Test database configuration
def get_test_database_url():
    """Get test database URL from environment variables with fallback defaults."""
    return (
        os.getenv("TEST_DATABASE_URL")
        or f"postgresql+asyncpg://{os.getenv('TEST_DB_USER', 'postgres')}:"
        f"{os.getenv('TEST_DB_PASSWORD', 'password')}@"
        f"{os.getenv('TEST_DB_HOST', 'localhost')}:"
        f"{os.getenv('TEST_DB_PORT', '5432')}/"
        f"{os.getenv('TEST_DB_NAME', 'test_language_learning')}"
    )


TEST_DATABASE_URL = get_test_database_url()


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Cleanup
    await engine.dispose()


@pytest.fixture
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    TestSessionLocal = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


@pytest.fixture
async def test_user(test_session: AsyncSession):
    """Create a test user."""
    from app.core.security import get_password_hash

    user = User.create_user(
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("testpassword"),
        first_name="Test",
        last_name="User",
        native_language="en",
        target_language="es",
        proficiency_level="beginner",
    )

    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@pytest.fixture
async def test_lesson(test_session: AsyncSession):
    """Create a test lesson."""
    lesson = Lesson(
        title="Basic Greetings",
        description="Learn basic greetings in Spanish",
        target_language="es",
        difficulty_level="beginner",
        category="conversation",
        content={
            "vocabulary": [
                {
                    "word": "hola",
                    "translation": "hello",
                    "example_sentence": "¡Hola! ¿Cómo estás?",
                    "pronunciation": "oh-lah",
                }
            ],
            "grammar_points": [],
            "conversation_practice": [],
        },
        learning_objectives=["Learn basic greetings", "Practice pronunciation"],
        estimated_duration=15,
    )

    test_session.add(lesson)
    await test_session.commit()
    await test_session.refresh(lesson)
    return lesson


@pytest.fixture
async def test_exercise(test_session: AsyncSession, test_lesson):
    """Create a test exercise."""
    exercise = Exercise(
        lesson_id=test_lesson.id,
        title="Translate Greeting",
        description="Translate the greeting from English to Spanish",
        exercise_type="multiple_choice",
        content={
            "question": "Translate 'Hello' to Spanish",
            "options": ["hola", "adiós", "gracias", "por favor"],
            "correct_answer": 0,
            "hints": ["Think of a common greeting"],
            "explanation": "'Hola' is the standard Spanish greeting for 'Hello'",
        },
        correct_answer=0,
        hints=["Think of a common greeting"],
        explanation="'Hola' is the standard Spanish greeting for 'Hello'",
        difficulty_score=1.0,
        base_xp=25,
    )

    test_session.add(exercise)
    await test_session.commit()
    await test_session.refresh(exercise)
    return exercise


@pytest.fixture
async def test_achievement(test_session: AsyncSession):
    """Create a test achievement."""
    achievement = Achievement(
        name="First Steps",
        description="Complete your first lesson",
        achievement_type="lessons",
        criteria={"threshold": 1, "timeframe": "lifetime"},
        xp_reward=50,
        rarity="common",
    )

    test_session.add(achievement)
    await test_session.commit()
    await test_session.refresh(achievement)
    return achievement


@pytest.fixture
async def test_learning_streak(test_session: AsyncSession, test_user):
    """Create a test learning streak."""
    streak = LearningStreak(user_id=test_user.id, current_streak=0, longest_streak=0, total_streaks=0)

    test_session.add(streak)
    await test_session.commit()
    await test_session.refresh(streak)
    return streak


@pytest.fixture
async def test_daily_goal(test_session: AsyncSession, test_user):
    """Create a test daily goal."""
    from datetime import datetime

    goal = DailyGoal(
        user_id=test_user.id,
        date=datetime.now(),
        goal_type="study_time",
        target_value=30,
        current_value=0,
    )

    test_session.add(goal)
    await test_session.commit()
    await test_session.refresh(goal)
    return goal


@pytest.fixture
async def setup_test_environment(test_session: AsyncSession):
    """Setup test environment before each test."""
    # Set testing environment
    os.environ["TESTING"] = "true"
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL

    yield

    # Cleanup after each test
    await test_session.rollback()


# pytest-bdd specific fixtures
@pytest.fixture
def pytestbdd_strict_gherkin_validation():
    """Enable strict Gherkin validation."""
    return True


@pytest.fixture
def pytestbdd_strict_validation():
    """Enable strict validation."""
    return True


# Mock fixtures for external services
@pytest.fixture
def mock_ai_service(monkeypatch):
    """Mock AI service for testing."""

    class MockAIService:
        async def translate_text(self, text, source_language, target_language):
            return {
                "translated_text": f"Translated: {text}",
                "source_language": source_language,
                "target_language": target_language,
                "confidence": 0.95,
                "processing_time": 0.1,
            }

        async def text_to_speech(self, text, language_code, voice_name=None):
            return {
                "audio_content": b"mock_audio_content",
                "language_code": language_code,
                "voice_name": voice_name or "default_voice",
                "processing_time": 0.1,
                "audio_format": "mp3",
            }

        async def generate_lesson_content(self, topic, difficulty_level, target_language, native_language="en"):
            return {
                "lesson_content": {
                    "title": f"Mock Lesson: {topic}",
                    "description": f"Mock description for {topic}",
                    "learning_objectives": ["Learn mock content"],
                    "vocabulary": [],
                    "grammar_points": [],
                    "conversation_practice": [],
                    "cultural_notes": [],
                    "estimated_duration": "15 minutes",
                },
                "topic": topic,
                "difficulty_level": difficulty_level,
                "target_language": target_language,
                "processing_time": 0.1,
            }

    return MockAIService()


@pytest.fixture
def mock_redis(monkeypatch):
    """Mock Redis for testing."""

    class MockRedis:
        async def get(self, key):
            return None

        async def set(self, key, value, ex=None):
            return True

        async def delete(self, key):
            return True

        async def exists(self, key):
            return False

    return MockRedis()


# Test data factories
@pytest.fixture
def user_factory(test_session: AsyncSession):
    """Factory for creating test users."""

    async def _create_user(**kwargs):
        from app.core.security import get_password_hash

        user_data = {
            "email": "user@example.com",
            "username": "testuser",
            "hashed_password": get_password_hash("testpass"),
            "native_language": "en",
            "target_language": "es",
            "proficiency_level": "beginner",
            **kwargs,
        }

        user = User.create_user(**user_data)
        test_session.add(user)
        await test_session.commit()
        await test_session.refresh(user)
        return user

    return _create_user


@pytest.fixture
def lesson_factory(test_session: AsyncSession):
    """Factory for creating test lessons."""

    async def _create_lesson(**kwargs):
        lesson_data = {
            "title": "Test Lesson",
            "description": "Test lesson description",
            "target_language": "es",
            "difficulty_level": "beginner",
            "category": "vocabulary",
            "content": {
                "vocabulary": [],
                "grammar_points": [],
                "conversation_practice": [],
            },
            "learning_objectives": ["Test objective"],
            "estimated_duration": 15,
            **kwargs,
        }

        lesson = Lesson(**lesson_data)
        test_session.add(lesson)
        await test_session.commit()
        await test_session.refresh(lesson)
        return lesson

    return _create_lesson


@pytest.fixture
def exercise_factory(test_session: AsyncSession):
    """Factory for creating test exercises."""

    async def _create_exercise(lesson_id, **kwargs):
        exercise_data = {
            "lesson_id": lesson_id,
            "title": "Test Exercise",
            "description": "Test exercise description",
            "exercise_type": "multiple_choice",
            "content": {
                "question": "Test question?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 0,
                "hints": ["Test hint"],
                "explanation": "Test explanation",
            },
            "correct_answer": 0,
            "hints": ["Test hint"],
            "explanation": "Test explanation",
            "difficulty_score": 1.0,
            "base_xp": 25,
            **kwargs,
        }

        exercise = Exercise(**exercise_data)
        test_session.add(exercise)
        await test_session.commit()
        await test_session.refresh(exercise)
        return exercise

    return _create_exercise
