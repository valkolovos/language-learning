"""
Authentication endpoints for user registration and login.
"""

from datetime import timedelta
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    verify_token,
)
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserResponse
from app.services.user_service import UserService

logger = structlog.get_logger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    """Register a new user."""
    try:
        user_service = UserService(db)

        # Check if user already exists
        existing_user = await user_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        existing_username = await user_service.get_user_by_username(user_data.username)
        if existing_username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

        # Create new user
        user = await user_service.create_user(user_data)

        logger.info("New user registered", user_id=user.id, email=user.email)

        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            native_language=user.native_language,
            target_language=user.target_language,
            proficiency_level=user.proficiency_level,
            is_active=user.is_active,
            total_xp=user.total_xp,
            current_streak=user.current_streak,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("User registration failed", error=str(e), email=user_data.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed",
        )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)) -> Any:
    """Authenticate user and return access token."""
    try:
        user_service = UserService(db)

        # Authenticate user
        user = await user_service.authenticate_user(form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)

        logger.info("User logged in", user_id=user.id, username=user.username)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("User login failed", error=str(e), username=form_data.username)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed")


@router.post("/refresh", response_model=Token)
async def refresh_token(current_token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> Any:
    """Refresh access token."""
    try:
        # This would validate the current token and create a new one
        # Implementation depends on your token validation logic
        pass

    except Exception as e:
        logger.error("Token refresh failed", error=str(e))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("/logout")
async def logout(current_token: str = Depends(oauth2_scheme)) -> Any:
    """Logout user (invalidate token)."""
    try:
        # In a real implementation, you might add the token to a blacklist
        # or use Redis to track invalidated tokens

        logger.info("User logged out")

        return {"message": "Successfully logged out"}

    except Exception as e:
        logger.error("Logout failed", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Logout failed")


async def get_current_user_dependency(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """Dependency to get the current user from the token."""
    try:
        # Decode the token to get user ID
        payload = verify_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        user_service = UserService(db)
        user = await user_service.get_user_by_id(int(user_id))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get current user from token", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user_dependency),
) -> Any:
    """Get current authenticated user information."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        native_language=current_user.native_language,
        target_language=current_user.target_language,
        proficiency_level=current_user.proficiency_level,
        is_active=current_user.is_active,
        created_at=(current_user.created_at.isoformat() if current_user.created_at else None),
        updated_at=(current_user.updated_at.isoformat() if current_user.updated_at else None),
    )
