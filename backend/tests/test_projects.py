import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_create_and_manage_projects():
    with TestClient(app) as client:
        # 1. Create a new project
        create_payload = {
            "name": "E-Commerce Microservices",
            "description": "Backend services for inventory, orders, and payment gateway."
        }
        response = client.post("/api/v1/projects", json=create_payload)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == "E-Commerce Microservices"
        assert data["repository_count"] == 0
        project_id = data["id"]

        # 2. List all projects
        response = client.get("/api/v1/projects")
        assert response.status_code == 200
        list_data = response.json()
        assert list_data["total"] >= 1
        assert any(p["id"] == project_id for p in list_data["projects"])

        # 3. Get single project
        response = client.get(f"/api/v1/projects/{project_id}")
        assert response.status_code == 200
        proj_data = response.json()
        assert proj_data["id"] == project_id
        assert proj_data["name"] == "E-Commerce Microservices"

        # 4. Delete project
        response = client.delete(f"/api/v1/projects/{project_id}")
        assert response.status_code == 204

        # 5. Verify deletion
        response = client.get(f"/api/v1/projects/{project_id}")
        assert response.status_code == 404
