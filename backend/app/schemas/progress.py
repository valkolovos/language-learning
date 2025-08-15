"""Progress schemas placeholder."""

from pydantic import BaseModel, Field


class UserProgress(BaseModel):
    id: int = Field(..., description="Progress ID")


class ProgressCreate(BaseModel):
    pass


class ProgressUpdate(BaseModel):
    pass
