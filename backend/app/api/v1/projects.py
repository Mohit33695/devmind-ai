from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.core.database import get_db
from app.models.models import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse, RepositorySummary

router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, summary="Create new project")
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new workspace project.
    """
    new_project = Project(
        name=project_in.name,
        description=project_in.description
    )
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)

    return ProjectResponse(
        id=new_project.id,
        name=new_project.name,
        description=new_project.description,
        created_at=new_project.created_at,
        updated_at=new_project.updated_at,
        repository_count=0,
        repositories=[]
    )


@router.get("", response_model=ProjectListResponse, summary="List all projects")
async def list_projects(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves all projects ordered by creation date (newest first).
    """
    query = select(Project).options(selectinload(Project.repositories)).order_by(Project.created_at.desc())
    result = await db.execute(query)
    projects = result.scalars().all()

    project_responses = []
    for proj in projects:
        repos_summary = [
            RepositorySummary.model_validate(r) for r in proj.repositories
        ]
        project_responses.append(
            ProjectResponse(
                id=proj.id,
                name=proj.name,
                description=proj.description,
                created_at=proj.created_at,
                updated_at=proj.updated_at,
                repository_count=len(proj.repositories),
                repositories=repos_summary
            )
        )

    return ProjectListResponse(
        total=len(project_responses),
        projects=project_responses
    )


@router.get("/{project_id}", response_model=ProjectResponse, summary="Get project by ID")
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Gets detailed information for a specific project.
    """
    query = select(Project).options(selectinload(Project.repositories)).where(Project.id == project_id)
    result = await db.execute(query)
    proj = result.scalar_one_or_none()

    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )

    repos_summary = [RepositorySummary.model_validate(r) for r in proj.repositories]
    return ProjectResponse(
        id=proj.id,
        name=proj.name,
        description=proj.description,
        created_at=proj.created_at,
        updated_at=proj.updated_at,
        repository_count=len(proj.repositories),
        repositories=repos_summary
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete project")
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes a project and all associated repositories & parsed AST files.
    """
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    proj = result.scalar_one_or_none()

    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )

    await db.delete(proj)
    await db.commit()
    return None
