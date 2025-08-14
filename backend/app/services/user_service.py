"""
User service for managing user operations.
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.schemas.auth import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
import structlog

logger = structlog.get_logger(__name__)


class UserService:
    """Service for user-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        try:
            # Check if user already exists
            existing_user = await self.get_user_by_email(user_data.email)
            if existing_user:
                raise ValueError("User with this email already exists")

            existing_username = await self.get_user_by_username(user_data.username)
            if existing_username:
                raise ValueError("Username already taken")

            # Create new user
            hashed_password = get_password_hash(user_data.password)
            db_user = User(
                email=user_data.email,
                username=user_data.username,
                hashed_password=hashed_password,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                native_language=user_data.native_language,
                target_language=user_data.target_language,
                proficiency_level=user_data.proficiency_level,
                is_active=True
            )

            self.db.add(db_user)
            await self.db.commit()
            await self.db.refresh(db_user)

            logger.info("User created successfully", user_id=db_user.id, email=db_user.email)
            return db_user

        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to create user", error=str(e), email=user_data.email)
            raise

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        try:
            result = await self.db.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error("Failed to get user by ID", error=str(e), user_id=user_id)
            return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        try:
            result = await self.db.execute(
                select(User).where(User.email == email)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error("Failed to get user by email", error=str(e), email=email)
            return None

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        try:
            result = await self.db.execute(
                select(User).where(User.username == username)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error("Failed to get user by username", error=str(e), username=username)
            return None

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        try:
            user = await self.get_user_by_email(email)
            if not user:
                return None
            if not verify_password(password, user.hashed_password):
                return None
            return user
        except Exception as e:
            logger.error("Failed to authenticate user", error=str(e), email=email)
            return None

    async def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update user information."""
        try:
            # Get existing user
            user = await self.get_user_by_id(user_id)
            if not user:
                return None

            # Update fields
            update_data = user_data.dict(exclude_unset=True)
            if update_data:
                await self.db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(**update_data)
                )
                await self.db.commit()
                await self.db.refresh(user)

                logger.info("User updated successfully", user_id=user_id)
                return user

        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to update user", error=str(e), user_id=user_id)
            return None

    async def deactivate_user(self, user_id: int) -> bool:
        """Deactivate a user account."""
        try:
            result = await self.db.execute(
                update(User)
                .where(User.id == user_id)
                .values(is_active=False)
            )
            await self.db.commit()

            if result.rowcount > 0:
                logger.info("User deactivated successfully", user_id=user_id)
                return True
            return False

        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to deactivate user", error=str(e), user_id=user_id)
            return False

    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get list of users with pagination."""
        try:
            result = await self.db.execute(
                select(User)
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        except Exception as e:
            logger.error("Failed to get users", error=str(e))
            return []

    async def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password."""
        try:
            user = await self.get_user_by_id(user_id)
            if not user:
                return False

            if not verify_password(current_password, user.hashed_password):
                return False

            hashed_new_password = get_password_hash(new_password)
            await self.db.execute(
                update(User)
                .where(User.id == user_id)
                .values(hashed_password=hashed_new_password)
            )
            await self.db.commit()

            logger.info("Password changed successfully", user_id=user_id)
            return True

        except Exception as e:
            await self.db.rollback()
            logger.error("Failed to change password", error=str(e), user_id=user_id)
            return False

    async def get_user_stats(self, user_id: int) -> dict:
        """Get user statistics."""
        try:
            user = await self.get_user_by_id(user_id)
            if not user:
                return {}

            # This would typically query related tables for actual stats
            # For now, return placeholder data
            stats = {
                "total_lessons_completed": 0,
                "total_exercises_completed": 0,
                "current_streak": 0,
                "longest_streak": 0,
                "total_xp": 0,
                "level": 1,
                "achievements_count": 0
            }

            return stats

        except Exception as e:
            logger.error("Failed to get user stats", error=str(e), user_id=user_id)
            return {}
