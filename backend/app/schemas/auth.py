"""
Authentication and authorization schemas.
"""

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=8, description="Password")
    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name")
    native_language: str = Field(..., description="Native language code")
    target_language: str = Field(..., description="Target language code")
    proficiency_level: str = Field(..., description="Proficiency level")


class UserUpdate(BaseModel):
    """Schema for user updates."""

    first_name: Optional[str] = Field(None, min_length=1, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Last name")
    native_language: Optional[str] = Field(None, description="Native language code")
    target_language: Optional[str] = Field(None, description="Target language code")
    proficiency_level: Optional[str] = Field(None, description="Proficiency level")


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="Password")


class Token(BaseModel):
    """Schema for authentication token."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")


class TokenData(BaseModel):
    """Schema for token payload data."""

    email: Optional[str] = None
    user_id: Optional[int] = None


class UserResponse(BaseModel):
    """Schema for user response (without sensitive data)."""

    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., description="Username")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    native_language: str = Field(..., description="Native language code")
    target_language: str = Field(..., description="Target language code")
    proficiency_level: str = Field(..., description="Proficiency level")
    is_active: bool = Field(..., description="User account status")
    total_xp: int = Field(default=0, description="Total experience points")
    current_streak: int = Field(default=0, description="Current learning streak")
    created_at: Optional[str] = Field(None, description="Account creation date")
    updated_at: Optional[str] = Field(None, description="Last update date")

    model_config = ConfigDict(from_attributes=True)


class PasswordReset(BaseModel):
    """Schema for password reset request."""

    email: EmailStr = Field(..., description="User's email address")


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""

    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password")


class ChangePassword(BaseModel):
    """Schema for password change."""

    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")


class RefreshToken(BaseModel):
    """Schema for token refresh."""

    refresh_token: str = Field(..., description="JWT refresh token")
