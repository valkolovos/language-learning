#!/usr/bin/env python3
"""
Seed script to populate the database with initial data.
This script should be run after the application has started and created all tables.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.gamification import Achievement
from app.models.learning import Lesson


def create_sample_achievements(db: Session) -> None:
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
        existing = db.query(Achievement).filter_by(name=achievement_data["name"]).first()
        if not existing:
            achievement = Achievement(**achievement_data)
            db.add(achievement)
            print(f"  Created achievement: {achievement.name}")
        else:
            print(f"  Achievement already exists: {achievement_data['name']}")

    db.commit()
    print("Sample achievements created successfully!")


def create_sample_lessons(db: Session) -> None:
    """Create sample lessons in the database."""
    print("Creating sample lessons...")

    lessons_data = [
        {
            "title": "Basic Greetings",
            "description": "Learn essential greetings in your target language",
            "target_language": "spanish",
            "difficulty_level": "beginner",
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
            "difficulty_level": "beginner",
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
        existing = db.query(Lesson).filter_by(title=lesson_data["title"]).first()
        if not existing:
            lesson = Lesson(**lesson_data)
            db.add(lesson)
            print(f"  Created lesson: {lesson.title}")
        else:
            print(f"  Lesson already exists: {lesson_data['title']}")

    db.commit()
    print("Sample lessons created successfully!")


async def main():
    """Main function to seed the database."""
    print("🌱 Starting database seeding...")

    try:
        # Get database session
        db = next(get_db())

        # Create sample data
        create_sample_achievements(db)
        create_sample_lessons(db)

        print("✅ Database seeding completed successfully!")

    except Exception as e:
        print(f"❌ Error during database seeding: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
