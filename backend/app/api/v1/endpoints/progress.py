"""
Progress endpoints.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_progress() -> dict[str, str]:
    """Get all progress."""
    return {"message": "Progress endpoint - not implemented yet"}
