"""
Gamification endpoints.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_gamification() -> dict[str, str]:
    """Get all gamification data."""
    return {"message": "Gamification endpoint - not implemented yet"}
