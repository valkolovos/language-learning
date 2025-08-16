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

    # Allowed Hosts - For host validation
    ALLOWED_HOSTS: str = "http://localhost:3000,http://localhost:8000"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@postgres:5432/language_learning"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30

    # Redis
    REDIS_URL: str = "redis://redis:6379"
    REDIS_POOL_SIZE: int = 10

    # Database credentials for environment detection
    POSTGRES_PASSWORD: str = "password"

    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = "your-google-cloud-project-id"
    GOOGLE_APPLICATION_CREDENTIALS: str = "/app/credentials/google-credentials.json"

    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL_NAME: str = "gpt-4"

    # OpenAI API Key Validation Settings
    # These can be updated if OpenAI changes their key format
    # Last verified: 2024 - check https://platform.openai.com/docs/api-keys for current format
    # To update: modify these values and update the "Last verified" comment above
    OPENAI_API_KEY_PREFIX: str = "sk-"
    OPENAI_API_KEY_MIN_LENGTH: int = 20
    OPENAI_API_KEY_TYPICAL_LENGTH: int = 51

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
    TEST_DB_USER: Optional[str] = None
    TEST_DB_PASSWORD: Optional[str] = None
    TEST_DB_HOST: Optional[str] = None
    TEST_DB_PORT: Optional[int] = None
    TEST_DB_NAME: Optional[str] = None

    # Environment Detection
    # Note: When running in Docker, the backend will automatically use the correct
    # database host (postgres) and redis host (redis) due to Docker networking.
    # When running locally, it will use localhost for both.

    @property
    def database_url(self) -> str:
        """Get database URL with environment-aware host detection."""
        # Check if we're running in Docker by looking for container environment
        import os

        if os.path.exists("/.dockerenv") or os.environ.get("DOCKER_CONTAINER"):
            # Running in Docker - use service names
            return f"postgresql://postgres:{self.POSTGRES_PASSWORD}@postgres:5432/language_learning"
        else:
            # Running locally - use localhost
            return f"postgresql://postgres:{self.POSTGRES_PASSWORD}@localhost:5432/language_learning"

    @property
    def redis_url(self) -> str:
        """Get Redis URL with environment-aware host detection."""
        # Check if we're running in Docker
        import os

        if os.path.exists("/.dockerenv") or os.environ.get("DOCKER_CONTAINER"):
            # Running in Docker - use service names
            return "redis://redis:6379"
        else:
            # Running locally - use localhost
            return "redis://localhost:6379"

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
