"""Progress endpoint placeholder."""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_progress():
    """Get progress placeholder."""
    return {"message": "Progress endpoint - not implemented yet"}
