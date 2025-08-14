"""AI service endpoint placeholder."""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_ai_services():
    """Get AI services placeholder."""
    return {"message": "AI services endpoint - not implemented yet"}
