"""Exercises endpoint placeholder."""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_exercises():
    """Get exercises placeholder."""
    return {"message": "Exercises endpoint - not implemented yet"}
