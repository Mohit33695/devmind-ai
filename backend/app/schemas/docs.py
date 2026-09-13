from typing import Dict, List
from pydantic import BaseModel, ConfigDict


class ReadmeResponse(BaseModel):
    repository_id: str
    repository_name: str
    readme_markdown: str
    tech_stack: Dict[str, List[str]]

    model_config = ConfigDict(from_attributes=True)
