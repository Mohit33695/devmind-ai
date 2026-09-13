import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ChatQueryInput(BaseModel):
    message: str = Field(..., min_length=1, description="Question about codebase")
    session_id: Optional[str] = Field(None, description="Existing chat session ID")


class SourceCitation(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    snippet: str


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    sender: str
    message: str
    sources: List[SourceCitation] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("sources", mode="before")
    @classmethod
    def parse_sources_json(cls, v):
        if isinstance(v, str):
            try:
                data = json.loads(v)
                return [SourceCitation(**item) for item in data]
            except Exception:
                return []
        return v or []


class ChatHistoryResponse(BaseModel):
    session_id: str
    total_messages: int
    messages: List[ChatMessageResponse]


class IndexRepositoryResponse(BaseModel):
    repository_id: str
    repository_name: str
    chunks_indexed: int
    status: str
