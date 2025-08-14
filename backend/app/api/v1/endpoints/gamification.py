"""Gamification endpoint placeholder."""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_gamification():
    """Get gamification placeholder."""
    return {"message": "Gamification endpoint - not implemented yet"}
