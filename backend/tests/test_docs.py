import io
import zipfile
from fastapi.testclient import TestClient
from app.main import app
from app.services.docs_generator import detect_tech_stack, generate_repository_readme


def test_tech_stack_detector(tmp_path):
    # Create sample requirements.txt and package.json
    (tmp_path / "requirements.txt").write_text("fastapi\nsqlalchemy\nasyncpg\n")
    (tmp_path / "package.json").write_text('{"dependencies": {"react": "^18.0", "vite": "^5.0"}}')
    (tmp_path / "Dockerfile").write_text("FROM python:3.11")

    scanned_files = [
        {"file_path": "main.py", "file_type": "py", "size_bytes": 100},
        {"file_path": "App.tsx", "file_type": "tsx", "size_bytes": 200},
    ]

    stack = detect_tech_stack(tmp_path, scanned_files)
    assert "Python" in stack.get("Languages", [])
    assert "TypeScript" in stack.get("Languages", [])
    assert "FastAPI" in stack.get("Backend Frameworks", [])
    assert "React" in stack.get("Frontend Frameworks", [])
    assert "Docker" in stack.get("Databases & Tools", [])


def test_readme_generator_endpoint():
    with TestClient(app) as client:
        # Create project
        proj_res = client.post("/api/v1/projects", json={"name": "Docs Test Project"})
        project_id = proj_res.json()["id"]

        # Upload zip
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("requirements.txt", "fastapi\nuvicorn\n")
            zf.writestr("app/main.py", "def health():\n    return 'OK'\n")

        files = {"file": ("docs_test_repo.zip", buf.getvalue(), "application/zip")}
        upload_res = client.post(
            f"/api/v1/projects/{project_id}/repositories/upload-zip",
            files=files
        )
        repo_id = upload_res.json()["id"]

        # Generate README API
        readme_res = client.post(f"/api/v1/repositories/{repo_id}/generate-readme")
        assert readme_res.status_code == 200
        readme_data = readme_res.json()

        assert "readme_markdown" in readme_data
        assert "# docs_test_repo" in readme_data["readme_markdown"].lower() or "overview" in readme_data["readme_markdown"].lower()
        assert "FastAPI" in readme_data["tech_stack"].get("Backend Frameworks", [])
