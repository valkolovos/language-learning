"""Lessons endpoint placeholder."""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_lessons():
    """Get lessons placeholder."""
    return {"message": "Lessons endpoint - not implemented yet"}
