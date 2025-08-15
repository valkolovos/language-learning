"""
Database configuration and connection management.
"""

from typing import AsyncGenerator
from urllib.parse import urlparse, urlunparse

import structlog
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = structlog.get_logger(__name__)


# Database URL conversion for async support
def get_async_database_url() -> str:
    """Convert synchronous database URL to async URL using robust URL parsing."""
    try:
        parsed = urlparse(settings.DATABASE_URL)

        # Handle PostgreSQL URLs
        if parsed.scheme in ("postgresql", "postgres"):
            # Create new URL with asyncpg driver
            new_parsed = parsed._replace(scheme="postgresql+asyncpg")
            return urlunparse(new_parsed)

        # Handle other database types (MySQL, SQLite, etc.)
        # For MySQL, you might want to add: if parsed.scheme == "mysql": return parsed._replace(scheme="mysql+aiomysql")

        return settings.DATABASE_URL
    except Exception as e:
        logger.warning("Failed to parse database URL, using original", error=str(e), url=settings.DATABASE_URL)
        return settings.DATABASE_URL


# Create async engine
engine = create_async_engine(
    get_async_database_url(),
    echo=settings.DEBUG,
    poolclass=NullPool if settings.TESTING else None,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def init_db() -> None:
    """Initialize database connection and create tables."""
    try:
        async with engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize database", error=str(e))
        raise


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error("Database session error", error=str(e))
            raise
        finally:
            await session.close()


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()
    logger.info("Database connections closed")


# Test database utilities
async def get_test_db() -> AsyncGenerator[AsyncSession, None]:
    """Get test database session."""
    if not settings.TESTING:
        raise ValueError("Test database can only be used in testing mode")

    # Use test database URL if provided, otherwise modify the main database URL
    if settings.TEST_DATABASE_URL:
        test_db_url = (
            get_async_database_url()
            if settings.TEST_DATABASE_URL.startswith(("postgresql://", "postgres://"))
            else settings.TEST_DATABASE_URL
        )
    else:
        # Fallback: modify main database URL for testing
        try:
            parsed = urlparse(get_async_database_url())
            if parsed.path and parsed.path != "/":
                # Replace the database name in the path
                path_parts = parsed.path.split("/")
                if len(path_parts) > 1:
                    path_parts[-1] = "test_language_learning"
                    new_path = "/".join(path_parts)
                    new_parsed = parsed._replace(path=new_path)
                    test_db_url = urlunparse(new_parsed)
                else:
                    test_db_url = get_async_database_url()
            else:
                test_db_url = get_async_database_url()
        except Exception as e:
            logger.warning("Failed to create test database URL, using main database", error=str(e))
            test_db_url = get_async_database_url()

    test_engine = create_async_engine(
        test_db_url,
        echo=False,
        poolclass=NullPool,
    )

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
            await session.close()
            await test_engine.dispose()
