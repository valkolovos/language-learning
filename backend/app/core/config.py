"""
Application configuration using Pydantic settings.
"""

from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "AI Language Learning"
    DEBUG: bool = False
    VERSION: str = "1.0.0"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS - Origins for CORS middleware
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # Trusted Hosts - Hostnames for TrustedHostMiddleware
    TRUSTED_HOSTS: str = "localhost,127.0.0.1,0.0.0.0"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@postgres:5432/language_learning"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30

    # Redis
    REDIS_URL: str = "redis://redis:6379"
    REDIS_POOL_SIZE: int = 10

    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = "your-google-cloud-project-id"
    GOOGLE_APPLICATION_CREDENTIALS: str = "/app/credentials/google-credentials.json"

    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL_NAME: str = "gpt-4"

    # Learning Engine - Using default values to avoid parsing issues
    SPACED_REPETITION_INTERVALS: str = "1,3,7,14,30,90,180,365"
    MAX_DAILY_LESSONS: int = 5
    MIN_LEARNING_SESSION_TIME: int = 300  # 5 minutes

    # Gamification
    XP_PER_LESSON: int = 100
    XP_PER_EXERCISE: int = 25
    STREAK_MULTIPLIER: float = 1.1

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    ENABLE_METRICS: bool = True

    # Testing
    TESTING: bool = False
    TEST_DATABASE_URL: Optional[str] = None

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        return [item.strip() for item in self.CORS_ORIGINS.split(",") if item.strip()]

    @property
    def trusted_hosts_list(self) -> List[str]:
        """Get trusted hosts as a list."""
        return [item.strip() for item in self.TRUSTED_HOSTS.split(",") if item.strip()]

    @property
    def spaced_repetition_intervals_list(self) -> List[int]:
        """Get spaced repetition intervals as a list of integers."""
        return [int(item.strip()) for item in self.SPACED_REPETITION_INTERVALS.split(",") if item.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
