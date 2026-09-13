from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ASTSymbolResponse(BaseModel):
    id: str
    file_id: str
    file_path: Optional[str] = None
    symbol_type: str
    name: str
    start_line: int
    end_line: int
    signature: Optional[str] = None
    docstring: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ParseRepositorySummary(BaseModel):
    repository_id: str
    repository_name: str
    files_parsed: int
    total_symbols_extracted: int


class SymbolListResponse(BaseModel):
    total: int
    symbols: List[ASTSymbolResponse]
