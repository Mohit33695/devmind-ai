from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Repository, CodeFile, ASTSymbol
from app.schemas.architecture import ArchitectureGraphResponse, QualityInsightsResponse
from app.services.architecture_service import build_dependency_graph, analyze_code_quality_and_security

router = APIRouter()


@router.get(
    "/repositories/{repository_id}/architecture-graph",
    response_model=ArchitectureGraphResponse,
    summary="Get repository module dependency graph"
)
async def get_repository_architecture_graph(
    repository_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Repository).options(selectinload(Repository.files)).where(Repository.id == repository_id)
    )
    repo = result.scalar_one_or_none()
    if not repo or not repo.storage_path:
        raise HTTPException(status_code=404, detail="Repository not found or not scanned.")

    scanned_files = [
        {"file_path": f.file_path, "file_type": f.file_type, "size_bytes": f.size_bytes}
        for f in repo.files
    ]

    file_ids = [f.id for f in repo.files]
    ast_symbols = []
    if file_ids:
        sym_res = await db.execute(
            select(ASTSymbol, CodeFile.file_path)
            .join(CodeFile, ASTSymbol.file_id == CodeFile.id)
            .where(ASTSymbol.file_id.in_(file_ids))
        )
        for s, f_path in sym_res.all():
            ast_symbols.append({
                "symbol_type": s.symbol_type,
                "name": s.name,
                "file_path": f_path,
            })

    graph_data = build_dependency_graph(scanned_files, ast_symbols)
    return ArchitectureGraphResponse(
        repository_id=repo.id,
        total_nodes=graph_data["total_nodes"],
        total_edges=graph_data["total_edges"],
        nodes=graph_data["nodes"],
        edges=graph_data["edges"]
    )


@router.get(
    "/repositories/{repository_id}/quality-insights",
    response_model=QualityInsightsResponse,
    summary="Get code quality metrics & security findings"
)
async def get_repository_quality_insights(
    repository_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Repository).options(selectinload(Repository.files)).where(Repository.id == repository_id)
    )
    repo = result.scalar_one_or_none()
    if not repo or not repo.storage_path:
        raise HTTPException(status_code=404, detail="Repository not found or not scanned.")

    repo_dir = Path(repo.storage_path)
    scanned_files = [
        {"file_path": f.file_path, "file_type": f.file_type, "size_bytes": f.size_bytes}
        for f in repo.files
    ]

    insights = analyze_code_quality_and_security(repo_dir, scanned_files)

    return QualityInsightsResponse(
        repository_id=repo.id,
        health_score=insights["health_score"],
        total_lines_of_code=insights["total_lines_of_code"],
        total_decision_points=insights["total_decision_points"],
        critical_issues=insights["critical_issues"],
        warning_issues=insights["warning_issues"],
        security_findings=insights["security_findings"],
        file_complexity_metrics=insights["file_complexity_metrics"]
    )
