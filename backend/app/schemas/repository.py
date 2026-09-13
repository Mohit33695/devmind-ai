from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class GitHubCloneInput(BaseModel):
    repo_url: str = Field(..., description="Public GitHub repository clone URL (e.g. https://github.com/fastapi/fastapi.git)")
    name: Optional[str] = Field(None, description="Custom display name for the repository")


class CodeFileSummary(BaseModel):
    id: str
    file_path: str
    file_type: str
    size_bytes: int

    model_config = ConfigDict(from_attributes=True)


class RepositoryResponse(BaseModel):
    id: str
    project_id: str
    name: str
    clone_url: Optional[str] = None
    storage_path: Optional[str] = None
    status: str
    total_files: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileTreeResponse(BaseModel):
    repository_id: str
    repository_name: str
    total_files: int
    file_tree: Dict[str, Any]


class FileContentResponse(BaseModel):
    repository_id: str
    file_path: str
    content: str
    size_bytes: int
    file_type: str
