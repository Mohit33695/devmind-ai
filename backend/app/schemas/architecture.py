from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class GraphNode(BaseModel):
    id: str
    label: str
    file_path: str
    file_type: str
    size: int


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str


class ArchitectureGraphResponse(BaseModel):
    repository_id: str
    total_nodes: int
    total_edges: int
    nodes: List[GraphNode]
    edges: List[GraphEdge]

    model_config = ConfigDict(from_attributes=True)


class SecurityFinding(BaseModel):
    file_path: str
    line_number: int
    severity: str
    category: str
    description: str
    snippet: str


class FileComplexity(BaseModel):
    file_path: str
    lines_of_code: int
    complexity_score: int
    rating: str


class QualityInsightsResponse(BaseModel):
    repository_id: str
    health_score: int
    total_lines_of_code: int
    total_decision_points: int
    critical_issues: int
    warning_issues: int
    security_findings: List[SecurityFinding]
    file_complexity_metrics: List[FileComplexity]

    model_config = ConfigDict(from_attributes=True)
