"""
Application configuration using Pydantic settings.
"""

from typing import List, Optional, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "AI Language Learning"
    DEBUG: bool = Field(default=False, env="DEBUG")
    VERSION: str = "1.0.0"
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Security
    SECRET_KEY: str = Field(default="dev-secret-key-change-in-production", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # CORS - Origins for CORS middleware
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:8000",
        env="CORS_ORIGINS"
    )
    
    # Trusted Hosts - Hostnames for TrustedHostMiddleware
    TRUSTED_HOSTS: str = Field(
        default="localhost,127.0.0.1,0.0.0.0",
        env="TRUSTED_HOSTS"
    )
    
    # Database
    DATABASE_URL: str = Field(default="postgresql://postgres:password@postgres:5432/language_learning", env="DATABASE_URL")
    DATABASE_POOL_SIZE: int = Field(default=20, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=30, env="DATABASE_MAX_OVERFLOW")
    
    # Redis
    REDIS_URL: str = Field(default="redis://redis:6379", env="REDIS_URL")
    REDIS_POOL_SIZE: int = Field(default=10, env="REDIS_POOL_SIZE")
    
    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = Field(default="your-google-cloud-project-id", env="GOOGLE_CLOUD_PROJECT")
    GOOGLE_APPLICATION_CREDENTIALS: str = Field(default="/app/credentials/google-credentials.json", env="GOOGLE_APPLICATION_CREDENTIALS")
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    AI_MODEL_NAME: str = Field(default="gpt-4", env="AI_MODEL_NAME")
    
    # Learning Engine - Using default values to avoid parsing issues
    SPACED_REPETITION_INTERVALS: str = Field(
        default="1,3,7,14,30,90,180,365",
        env="SPACED_REPETITION_INTERVALS"
    )
    MAX_DAILY_LESSONS: int = Field(default=5, env="MAX_DAILY_LESSONS")
    MIN_LEARNING_SESSION_TIME: int = Field(default=300, env="MIN_LEARNING_SESSION_TIME")  # 5 minutes
    
    # Gamification
    XP_PER_LESSON: int = Field(default=100, env="XP_PER_LESSON")
    XP_PER_EXERCISE: int = Field(default=25, env="XP_PER_EXERCISE")
    STREAK_MULTIPLIER: float = Field(default=1.1, env="STREAK_MULTIPLIER")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    
    # Testing
    TESTING: bool = Field(default=False, env="TESTING")
    TEST_DATABASE_URL: Optional[str] = Field(default=None, env="TEST_DATABASE_URL")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        if isinstance(self.CORS_ORIGINS, str):
            return [item.strip() for item in self.CORS_ORIGINS.split(',') if item.strip()]
        return self.CORS_ORIGINS
    
    @property
    def trusted_hosts_list(self) -> List[str]:
        """Get trusted hosts as a list."""
        if isinstance(self.TRUSTED_HOSTS, str):
            return [item.strip() for item in self.TRUSTED_HOSTS.split(',') if item.strip()]
        return self.TRUSTED_HOSTS
    
    @property
    def spaced_repetition_intervals_list(self) -> List[int]:
        """Get spaced repetition intervals as a list of integers."""
        if isinstance(self.SPACED_REPETITION_INTERVALS, str):
            return [int(item.strip()) for item in self.SPACED_REPETITION_INTERVALS.split(',') if item.strip()]
        return self.SPACED_REPETITION_INTERVALS
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()


# Development settings override
if settings.DEBUG:
    # Add additional hosts for development
    additional_hosts = [
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    # Combine with existing hosts
    existing_hosts = settings.cors_origins_list
    all_hosts = existing_hosts + additional_hosts
    # Update the CORS_ORIGINS string with the combined hosts
    settings.CORS_ORIGINS = ",".join(all_hosts)
