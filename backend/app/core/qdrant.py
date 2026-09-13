import os
from typing import Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
COLLECTION_NAME = "code_chunks"
VECTOR_SIZE = 384

_global_qdrant_client: Optional[QdrantClient] = None


def get_qdrant_client() -> QdrantClient:
    """
    Returns a shared QdrantClient instance. Connects to external Qdrant server if reachable,
    otherwise uses a persistent in-memory Qdrant instance.
    """
    global _global_qdrant_client

    if _global_qdrant_client is not None:
        return _global_qdrant_client

    try:
        client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, timeout=1.0, check_compatibility=False)
        client.get_collections()
        _global_qdrant_client = client
        return _global_qdrant_client
    except Exception:
        # Fallback to shared in-memory vector storage
        _global_qdrant_client = QdrantClient(location=":memory:")
        return _global_qdrant_client


def init_qdrant_collection(client: QdrantClient):
    """
    Ensures the 'code_chunks' collection exists in Qdrant with Cosine distance metric.
    """
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in collections:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(
                size=VECTOR_SIZE,
                distance=qmodels.Distance.COSINE
            )
        )
