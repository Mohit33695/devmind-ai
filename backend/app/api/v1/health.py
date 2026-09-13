from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="API Health Check")
async def health_check():
    """
    Returns API health status, service state, and timestamp.
    """
    return {
        "status": "healthy",
        "service": "DevMind AI Core API",
        "version": "0.1.0",
        "environment": "development",
    }
