"""
Exercises endpoints.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_exercises() -> dict[str, str]:
    """Get all exercises."""
    return {"message": "Exercises endpoint - not implemented yet"}
