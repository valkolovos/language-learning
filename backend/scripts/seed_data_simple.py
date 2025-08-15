#!/usr/bin/env python3
"""
Simple seed script to populate the database with initial data.
This script uses synchronous database operations for simplicity.
"""
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.gamification import Achievement
from app.models.learning import DifficultyLevel, Lesson


def create_sample_achievements(db_session):
    """Create sample achievements in the database."""
    print("Creating sample achievements...")

    achievements_data = [
        {
            "name": "First Steps",
            "description": "Complete your first lesson",
            "achievement_type": "lessons",
            "criteria": {"threshold": 1, "timeframe": "lifetime"},
            "xp_reward": 50,
            "rarity": "common",
        },
        {
            "name": "Streak Master",
            "description": "Maintain a 7-day learning streak",
            "achievement_type": "streak",
            "criteria": {"threshold": 7, "timeframe": "daily"},
            "xp_reward": 200,
            "rarity": "rare",
        },
        {
            "name": "Language Explorer",
            "description": "Complete 10 lessons",
            "achievement_type": "lessons",
            "criteria": {"threshold": 10, "timeframe": "lifetime"},
            "xp_reward": 500,
            "rarity": "epic",
        },
        {
            "name": "Dedicated Learner",
            "description": "Study for 30 days in a row",
            "achievement_type": "streak",
            "criteria": {"threshold": 30, "timeframe": "daily"},
            "xp_reward": 1000,
            "rarity": "legendary",
        },
    ]

    for achievement_data in achievements_data:
        # Check if achievement already exists
        existing = db_session.execute(select(Achievement).filter_by(name=achievement_data["name"])).scalar_one_or_none()

        if not existing:
            achievement = Achievement(**achievement_data)
            db_session.add(achievement)
            print(f"  Created achievement: {achievement.name}")
        else:
            print(f"  Achievement already exists: {achievement_data['name']}")

    db_session.commit()
    print("Sample achievements created successfully!")


def create_sample_lessons(db_session):
    """Create sample lessons in the database."""
    print("Creating sample lessons...")

    lessons_data = [
        {
            "title": "Basic Greetings",
            "description": "Learn essential greetings in your target language",
            "target_language": "spanish",
            "difficulty_level": DifficultyLevel.BEGINNER,
            "category": "vocabulary",
            "estimated_duration": 15,
            "content": {
                "vocabulary": ["hola", "buenos días", "buenas tardes", "buenas noches"],
                "grammar": "Basic greetings and time-based salutations",
                "exercises": ["matching", "fill_blank"],
            },
        },
        {
            "title": "Numbers 1-10",
            "description": "Learn to count from 1 to 10",
            "target_language": "spanish",
            "difficulty_level": DifficultyLevel.BEGINNER,
            "category": "vocabulary",
            "estimated_duration": 20,
            "content": {
                "vocabulary": ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"],
                "grammar": "Cardinal numbers",
                "exercises": ["multiple_choice", "fill_blank"],
            },
        },
    ]

    for lesson_data in lessons_data:
        # Check if lesson already exists
        existing = db_session.execute(select(Lesson).filter_by(title=lesson_data["title"])).scalar_one_or_none()

        if not existing:
            lesson = Lesson(**lesson_data)
            db_session.add(lesson)
            print(f"  Created lesson: {lesson.title}")
        else:
            print(f"  Lesson already exists: {lesson_data['title']}")

    db_session.commit()
    print("Sample lessons created successfully!")


def main():
    """Main function to seed the database."""
    print("🌱 Starting database seeding...")

    try:
        # Create synchronous database engine
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        # Create database session
        db_session = SessionLocal()

        try:
            # Create sample data
            create_sample_achievements(db_session)
            create_sample_lessons(db_session)
            print("✅ Database seeding completed successfully!")
        finally:
            db_session.close()

    except Exception as e:
        print(f"❌ Error during database seeding: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
