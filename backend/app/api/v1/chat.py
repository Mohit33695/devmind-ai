import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Project, Repository, CodeFile, ChatSession, ChatMessage
from app.schemas.chat import (
    ChatQueryInput,
    ChatMessageResponse,
    ChatHistoryResponse,
    IndexRepositoryResponse,
    SourceCitation,
)
from app.services.rag_service import (
    index_repository_in_qdrant,
    retrieve_relevant_chunks,
    generate_rag_answer,
)

router = APIRouter()


@router.post(
    "/repositories/{repository_id}/index",
    response_model=IndexRepositoryResponse,
    summary="Vectorize and index repository into Qdrant"
)
async def index_repository_vector_db(
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
    scanned_files = [{"file_path": f.file_path} for f in repo.files]

    chunks_indexed = index_repository_in_qdrant(
        repository_id=repo.id,
        project_id=repo.project_id,
        repo_dir=repo_dir,
        scanned_files=scanned_files
    )

    repo.status = "indexed"
    await db.commit()

    return IndexRepositoryResponse(
        repository_id=repo.id,
        repository_name=repo.name,
        chunks_indexed=chunks_indexed,
        status="indexed"
    )


@router.post(
    "/projects/{project_id}/chat",
    response_model=ChatMessageResponse,
    summary="Ask AI question with RAG vector context & code citations"
)
async def chat_with_repository(
    project_id: str,
    query_in: ChatQueryInput,
    db: AsyncSession = Depends(get_db)
):
    # Verify project exists
    result = await db.execute(select(Project).where(Project.id == project_id))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")

    # Find or create ChatSession
    session_id = query_in.session_id
    if session_id:
        sess_res = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = sess_res.scalar_one_or_none()
    else:
        session = None

    if not session:
        session = ChatSession(project_id=project_id)
        db.add(session)
        await db.commit()
        await db.refresh(session)

    # 1. Record User Question in DB
    user_msg = ChatMessage(
        session_id=session.id,
        sender="user",
        message=query_in.message,
    )
    db.add(user_msg)
    await db.commit()

    # 2. Perform RAG Vector Search & Synthesis
    retrieved_chunks = retrieve_relevant_chunks(project_id=project_id, query=query_in.message, top_k=4)
    ai_answer, citations = generate_rag_answer(query_in.message, retrieved_chunks)

    # 3. Record Assistant Answer & Citations in DB
    sources_json = json.dumps(citations)
    assistant_msg = ChatMessage(
        session_id=session.id,
        sender="assistant",
        message=ai_answer,
        sources_json=sources_json,
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    sources_list = [SourceCitation(**c) for c in citations]
    return ChatMessageResponse(
        id=assistant_msg.id,
        session_id=session.id,
        sender="assistant",
        message=ai_answer,
        sources=sources_list,
        created_at=assistant_msg.created_at
    )


@router.get(
    "/projects/{project_id}/chat/history",
    response_model=ChatHistoryResponse,
    summary="Get project chat conversation history"
)
async def get_chat_history(
    project_id: str,
    db: AsyncSession = Depends(get_db)
):
    # Find newest ChatSession for project
    sess_res = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(ChatSession.project_id == project_id)
        .order_by(ChatSession.created_at.desc())
    )
    session = sess_res.scalars().first()

    if not session:
        return ChatHistoryResponse(session_id="", total_messages=0, messages=[])

    msg_responses = []
    for msg in session.messages:
        sources_list = []
        if msg.sources_json:
            try:
                raw_data = json.loads(msg.sources_json)
                sources_list = [SourceCitation(**c) for c in raw_data]
            except Exception:
                sources_list = []

        msg_responses.append(
            ChatMessageResponse(
                id=msg.id,
                session_id=session.id,
                sender=msg.sender,
                message=msg.message,
                sources=sources_list,
                created_at=msg.created_at
            )
        )

    return ChatHistoryResponse(
        session_id=session.id,
        total_messages=len(msg_responses),
        messages=msg_responses
    )
