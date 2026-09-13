from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Repository, CodeFile, ASTSymbol
from app.schemas.docs import ReadmeResponse
from app.services.docs_generator import detect_tech_stack, generate_repository_readme

router = APIRouter()


@router.post(
    "/repositories/{repository_id}/generate-readme",
    response_model=ReadmeResponse,
    summary="Generate README documentation for repository"
)
async def generate_readme_documentation(
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

    # Query extracted AST symbols for repository files
    file_ids = [f.id for f in repo.files]
    ast_symbols = []
    if file_ids:
        sym_res = await db.execute(select(ASTSymbol).where(ASTSymbol.file_id.in_(file_ids)))
        for s in sym_res.scalars().all():
            ast_symbols.append({
                "symbol_type": s.symbol_type,
                "name": s.name,
                "signature": s.signature,
                "docstring": s.docstring,
            })

    readme_content = generate_repository_readme(
        repo_name=repo.name,
        repo_dir=repo_dir,
        scanned_files=scanned_files,
        ast_symbols=ast_symbols
    )

    tech_stack = detect_tech_stack(repo_dir, scanned_files)

    return ReadmeResponse(
        repository_id=repo.id,
        repository_name=repo.name,
        readme_markdown=readme_content,
        tech_stack=tech_stack
    )
