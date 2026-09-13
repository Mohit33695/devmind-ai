from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120, description="Project name")
    description: Optional[str] = Field(None, max_length=1000, description="Optional project description")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)


class RepositorySummary(BaseModel):
    id: str
    name: str
    status: str
    total_files: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    repository_count: int = 0
    repositories: List[RepositorySummary] = []

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    total: int
    projects: List[ProjectResponse]
