import io
import zipfile
from fastapi.testclient import TestClient
from app.main import app
from app.services.rag_service import generate_dense_embedding, chunk_code_file, generate_rag_answer


def test_dense_embedding_vector_generation():
    text = "def process_payment(user_id, amount): return True"
    embedding = generate_dense_embedding(text)
    assert len(embedding) == 384
    assert sum(embedding) > 0.0


def test_code_chunking():
    sample_code = "\n".join([f"line {i}" for i in range(1, 100)])
    chunks = chunk_code_file("app/main.py", sample_code, chunk_size_lines=30, overlap_lines=5)
    assert len(chunks) >= 3
    assert chunks[0]["start_line"] == 1
    assert chunks[0]["end_line"] == 30


def test_rag_indexing_and_chat_flow():
    with TestClient(app) as client:
        # Create Project
        proj_res = client.post("/api/v1/projects", json={"name": "RAG Chat Test Project"})
        project_id = proj_res.json()["id"]

        # Upload Repository ZIP
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr(
                "services/auth.py",
                "def authenticate_user(token):\n    '''Validates JWT authentication token.'''\n    return {'user_id': 123}\n"
            )
            zf.writestr(
                "services/payment.py",
                "def process_stripe_payment(card_number, amount):\n    '''Executes credit card charge via Stripe API.'''\n    return {'status': 'success'}\n"
            )
        
        files = {"file": ("rag_test_repo.zip", buf.getvalue(), "application/zip")}
        upload_res = client.post(
            f"/api/v1/projects/{project_id}/repositories/upload-zip",
            files=files
        )
        repo_id = upload_res.json()["id"]

        # Index Repository in Qdrant Vector Store
        index_res = client.post(f"/api/v1/repositories/{repo_id}/index")
        assert index_res.status_code == 200
        index_data = index_res.json()
        assert index_data["chunks_indexed"] >= 2
        assert index_data["status"] == "indexed"

        # Query RAG Chatbot
        chat_res = client.post(
            f"/api/v1/projects/{project_id}/chat",
            json={"message": "How does user authentication work?"}
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert "message" in chat_data
        assert len(chat_data["sources"]) >= 1
        assert any("auth.py" in src["file_path"] for src in chat_data["sources"])

        # Fetch Chat History
        hist_res = client.get(f"/api/v1/projects/{project_id}/chat/history")
        assert hist_res.status_code == 200
        hist_data = hist_res.json()
        assert hist_data["total_messages"] >= 2
