"""
AI service endpoints.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_ai_services() -> dict[str, str]:
    """Get all AI services."""
    return {"message": "AI services endpoint - not implemented yet"}
