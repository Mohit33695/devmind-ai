from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Repository, CodeFile, ASTSymbol
from app.schemas.parser import ASTSymbolResponse, ParseRepositorySummary, SymbolListResponse
from app.services.code_parser import extract_file_ast_symbols

router = APIRouter()


@router.post(
    "/repositories/{repository_id}/parse",
    response_model=ParseRepositorySummary,
    summary="Parse AST code metadata for repository"
)
async def parse_repository_ast(
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

    # Delete existing AST symbols for clean re-parse
    file_ids = [f.id for f in repo.files]
    if file_ids:
        existing_symbols = await db.execute(select(ASTSymbol).where(ASTSymbol.file_id.in_(file_ids)))
        for sym in existing_symbols.scalars().all():
            await db.delete(sym)

    files_parsed_count = 0
    total_symbols_extracted = 0

    for code_file in repo.files:
        full_file_path = repo_dir / code_file.file_path
        symbols_data = extract_file_ast_symbols(full_file_path, code_file.file_type)

        if symbols_data:
            files_parsed_count += 1
            for sym in symbols_data:
                ast_entity = ASTSymbol(
                    file_id=code_file.id,
                    symbol_type=sym["symbol_type"],
                    name=sym["name"],
                    start_line=sym["start_line"],
                    end_line=sym["end_line"],
                    signature=sym["signature"],
                    docstring=sym["docstring"],
                )
                db.add(ast_entity)
                total_symbols_extracted += 1

    repo.status = "parsed"
    await db.commit()

    return ParseRepositorySummary(
        repository_id=repo.id,
        repository_name=repo.name,
        files_parsed=files_parsed_count,
        total_symbols_extracted=total_symbols_extracted,
    )


@router.get(
    "/repositories/{repository_id}/symbols",
    response_model=SymbolListResponse,
    summary="Get parsed AST symbols for repository"
)
async def get_repository_symbols(
    repository_id: str,
    symbol_type: Optional[str] = Query(None, description="Filter by function, class, or import"),
    query: Optional[str] = Query(None, description="Search symbol name"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ASTSymbol, CodeFile.file_path)
        .join(CodeFile, ASTSymbol.file_id == CodeFile.id)
        .where(CodeFile.repository_id == repository_id)
    )
    rows = result.all()

    symbol_responses = []
    for ast_sym, file_path in rows:
        if symbol_type and ast_sym.symbol_type.lower() != symbol_type.lower():
            continue
        if query and query.lower() not in ast_sym.name.lower():
            continue

        resp = ASTSymbolResponse.model_validate(ast_sym)
        resp.file_path = file_path
        symbol_responses.append(resp)

    return SymbolListResponse(
        total=len(symbol_responses),
        symbols=symbol_responses
    )


@router.get(
    "/files/{file_id}/symbols",
    response_model=List[ASTSymbolResponse],
    summary="Get symbols for specific file"
)
async def get_file_symbols(
    file_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ASTSymbol).where(ASTSymbol.file_id == file_id))
    symbols = result.scalars().all()
    return [ASTSymbolResponse.model_validate(s) for s in symbols]
