"""
Lessons endpoints.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_lessons() -> dict[str, str]:
    """Get all lessons."""
    return {"message": "Lessons endpoint - not implemented yet"}
