from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.projects import router as projects_router
from app.api.v1.repositories import router as repositories_router
from app.api.v1.parser import router as parser_router
from app.api.v1.chat import router as chat_router
from app.api.v1.docs import router as docs_router
from app.api.v1.architecture import router as architecture_router
from app.api.v1.auth import router as auth_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(repositories_router, tags=["Repositories"])
api_router.include_router(parser_router, tags=["AST Code Parser"])
api_router.include_router(chat_router, tags=["RAG AI Chat"])
api_router.include_router(docs_router, tags=["Documentation Generator"])
api_router.include_router(architecture_router, tags=["Architecture & Insights"])
