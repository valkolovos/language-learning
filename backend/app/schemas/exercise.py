"""Exercise schemas placeholder."""

from pydantic import BaseModel, Field


class Exercise(BaseModel):
    id: int = Field(..., description="Exercise ID")
    title: str = Field(..., description="Exercise title")


class ExerciseCreate(BaseModel):
    title: str = Field(..., description="Exercise title")


class ExerciseUpdate(BaseModel):
    title: str = Field(..., description="Exercise title")


class ExerciseResponse(BaseModel):
    id: int = Field(..., description="Exercise ID")
    title: str = Field(..., description="Exercise title")
