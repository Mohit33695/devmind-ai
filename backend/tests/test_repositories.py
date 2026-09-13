import io
import zipfile
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.services.repo_scanner import safe_extract_zip


def create_sample_zip_bytes() -> bytes:
    """Helper to create a zip file in memory containing sample python and javascript code files."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("app/main.py", "def hello():\n    print('Hello World')\n")
        zf.writestr("app/utils.py", "def add(a, b):\n    return a + b\n")
        zf.writestr("frontend/index.js", "console.log('App started');\n")
        zf.writestr("README.md", "# Sample Repo\n")
    return buf.getvalue()


def test_zip_upload_and_file_tree_scanning(tmp_path):
    with TestClient(app) as client:
        # 1. Create a project
        proj_res = client.post("/api/v1/projects", json={"name": "Repo Scan Test Project"})
        assert proj_res.status_code == 201
        project_id = proj_res.json()["id"]

        # 2. Upload ZIP repository
        zip_bytes = create_sample_zip_bytes()
        files = {"file": ("test_repo.zip", zip_bytes, "application/zip")}
        upload_res = client.post(
            f"/api/v1/projects/{project_id}/repositories/upload-zip",
            files=files,
            data={"repo_name": "Sample Microservice"}
        )
        assert upload_res.status_code == 201
        repo_data = upload_res.json()
        assert repo_data["name"] == "Sample Microservice"
        assert repo_data["status"] == "scanned"
        assert repo_data["total_files"] == 4
        repository_id = repo_data["id"]

        # 3. Get file tree
        tree_res = client.get(f"/api/v1/repositories/{repository_id}/file-tree")
        assert tree_res.status_code == 200
        tree_data = tree_res.json()
        assert tree_data["total_files"] == 4
        assert tree_data["file_tree"]["type"] == "directory"

        # 4. Get raw file content safely
        content_res = client.get(
            f"/api/v1/repositories/{repository_id}/file-content",
            params={"file_path": "app/main.py"}
        )
        assert content_res.status_code == 200
        file_data = content_res.json()
        assert "def hello():" in file_data["content"]
        assert file_data["file_type"] == "py"

        # 5. Clean up repository
        del_res = client.delete(f"/api/v1/repositories/{repository_id}")
        assert del_res.status_code == 204


def test_path_traversal_security_defense(tmp_path):
    # Attempt extracting malicious path traversal entry
    malicious_buf = io.BytesIO()
    with zipfile.ZipFile(malicious_buf, "w") as zf:
        zf.writestr("../../etc/passwd", "malicious_content")
    
    with pytest.raises(Exception) as exc_info:
        safe_extract_zip(malicious_buf.getvalue(), tmp_path / "extract")
    
    assert "Path Traversal" in str(exc_info.value) or "Security alert" in str(exc_info.value)
