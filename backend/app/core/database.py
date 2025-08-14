"""
Database configuration and connection management.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool
import structlog
from typing import AsyncGenerator

from app.core.config import settings

logger = structlog.get_logger(__name__)

# Database URL conversion for async support
def get_async_database_url() -> str:
    """Convert synchronous database URL to async URL."""
    if settings.DATABASE_URL.startswith("postgresql://"):
        return settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
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
    
    test_engine = create_async_engine(
        settings.TEST_DATABASE_URL or get_async_database_url().replace(
            "/language_learning", "/test_language_learning"
        ),
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
