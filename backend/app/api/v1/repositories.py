import os
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Project, Repository, CodeFile
from app.schemas.repository import (
    GitHubCloneInput,
    RepositoryResponse,
    FileTreeResponse,
    FileContentResponse,
)
from app.services.repo_scanner import (
    safe_extract_zip,
    clone_github_repo,
    scan_repository_tree,
    MAX_SINGLE_FILE_SIZE_BYTES,
)

router = APIRouter()
STORAGE_DIR = Path("storage/repos").resolve()
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


@router.post(
    "/projects/{project_id}/repositories/upload-zip",
    response_model=RepositoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and scan repository ZIP file"
)
async def upload_repository_zip(
    project_id: str,
    file: UploadFile = File(...),
    repo_name: str = Form(None),
    db: AsyncSession = Depends(get_db)
):
    # Verify project exists
    result = await db.execute(select(Project).where(Project.id == project_id))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")

    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported.")

    display_name = repo_name.strip() if repo_name else Path(file.filename).stem

    # Create new Repository record
    repo = Repository(
        project_id=project_id,
        name=display_name,
        status="scanning"
    )
    db.add(repo)
    await db.commit()
    await db.refresh(repo)

    # Storage path setup
    repo_dir = STORAGE_DIR / repo.id
    try:
        content = await file.read()
        safe_extract_zip(content, repo_dir)

        # Handle nested root directory in extracted zip if present
        sub_items = [p for p in repo_dir.iterdir() if p.name not in [".git", "__MACOSX"]]
        scan_target = repo_dir
        if len(sub_items) == 1 and sub_items[0].is_dir():
            scan_target = sub_items[0]

        # Scan files
        tree_struct, code_files_data, total_files = scan_repository_tree(scan_target)

        # Store CodeFile entities
        for file_info in code_files_data:
            code_file = CodeFile(
                repository_id=repo.id,
                file_path=file_info["file_path"],
                file_type=file_info["file_type"],
                size_bytes=file_info["size_bytes"],
            )
            db.add(code_file)

        repo.storage_path = str(scan_target)
        repo.status = "scanned"
        repo.total_files = total_files
        await db.commit()
        await db.refresh(repo)

    except Exception as e:
        repo.status = "error"
        await db.commit()
        if repo_dir.exists():
            shutil.rmtree(repo_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(e))

    return repo


@router.post(
    "/projects/{project_id}/repositories/clone-github",
    response_model=RepositoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Clone public GitHub repository"
)
async def import_github_repository(
    project_id: str,
    payload: GitHubCloneInput,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")

    display_name = payload.name.strip() if payload.name else payload.repo_url.rstrip("/").split("/")[-1].replace(".git", "")

    repo = Repository(
        project_id=project_id,
        name=display_name,
        clone_url=payload.repo_url,
        status="scanning"
    )
    db.add(repo)
    await db.commit()
    await db.refresh(repo)

    repo_dir = STORAGE_DIR / repo.id
    try:
        clone_github_repo(payload.repo_url, repo_dir)
        tree_struct, code_files_data, total_files = scan_repository_tree(repo_dir)

        for file_info in code_files_data:
            code_file = CodeFile(
                repository_id=repo.id,
                file_path=file_info["file_path"],
                file_type=file_info["file_type"],
                size_bytes=file_info["size_bytes"],
            )
            db.add(code_file)

        repo.storage_path = str(repo_dir)
        repo.status = "scanned"
        repo.total_files = total_files
        await db.commit()
        await db.refresh(repo)

    except Exception as e:
        repo.status = "error"
        await db.commit()
        if repo_dir.exists():
            shutil.rmtree(repo_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(e))

    return repo


@router.get(
    "/projects/{project_id}/repositories",
    response_model=List[RepositoryResponse],
    summary="List repositories for a project"
)
async def list_repositories(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Repository).where(Repository.project_id == project_id).order_by(Repository.created_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/repositories/{repository_id}/file-tree",
    response_model=FileTreeResponse,
    summary="Get interactive repository file tree"
)
async def get_repository_file_tree(
    repository_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Repository).where(Repository.id == repository_id))
    repo = result.scalar_one_or_none()
    if not repo or not repo.storage_path:
        raise HTTPException(status_code=404, detail="Repository not found or not yet scanned.")

    repo_path = Path(repo.storage_path)
    if not repo_path.exists():
        raise HTTPException(status_code=404, detail="Repository directory storage not found.")

    tree_struct, _, total_files = scan_repository_tree(repo_path)
    return FileTreeResponse(
        repository_id=repo.id,
        repository_name=repo.name,
        total_files=total_files,
        file_tree=tree_struct
    )


@router.get(
    "/repositories/{repository_id}/file-content",
    response_model=FileContentResponse,
    summary="Read raw source code file content safely"
)
async def get_file_content(
    repository_id: str,
    file_path: str = Query(..., description="Relative file path inside the repository"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Repository).where(Repository.id == repository_id))
    repo = result.scalar_one_or_none()
    if not repo or not repo.storage_path:
        raise HTTPException(status_code=404, detail="Repository not found.")

    repo_root = Path(repo.storage_path).resolve()
    target_path = (repo_root / file_path).resolve()

    # Path traversal security check
    try:
        target_path.relative_to(repo_root)
    except ValueError:
        raise HTTPException(status_code=400, detail="Path traversal security violation.")

    if not target_path.exists() or not target_path.is_file():
        raise HTTPException(status_code=404, detail=f"File '{file_path}' not found in repository.")

    if target_path.stat().st_size > MAX_SINGLE_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds maximum viewable size limit of 2 MB.")

    try:
        with open(target_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file content: {str(e)}")

    file_ext = target_path.suffix.lstrip(".").lower() or "text"
    return FileContentResponse(
        repository_id=repo.id,
        file_path=file_path,
        content=content,
        size_bytes=target_path.stat().st_size,
        file_type=file_ext
    )


@router.delete(
    "/repositories/{repository_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete repository"
)
async def delete_repository(
    repository_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Repository).where(Repository.id == repository_id))
    repo = result.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    if repo.storage_path:
        repo_dir = Path(repo.storage_path).parent if Path(repo.storage_path).name != repo.id else Path(repo.storage_path)
        if repo_dir.exists():
            shutil.rmtree(repo_dir, ignore_errors=True)

    await db.delete(repo)
    await db.commit()
    return None
