import io
import zipfile
from fastapi.testclient import TestClient
from app.main import app
from app.services.architecture_service import analyze_code_quality_and_security, build_dependency_graph


def test_static_security_analyzer(tmp_path):
    # Create file with secret and unsafe call
    vuln_code = """
def connect():
    api_key = 'sk-12345678901234567890123456789012'
    eval('print(123)')
"""
    (tmp_path / "app.py").write_text(vuln_code)
    scanned_files = [{"file_path": "app.py", "file_type": "py", "size_bytes": 100}]

    insights = analyze_code_quality_and_security(tmp_path, scanned_files)
    assert insights["critical_issues"] >= 1
    assert insights["warning_issues"] >= 1
    assert insights["health_score"] < 100
    categories = [f["category"] for f in insights["security_findings"]]
    assert "Hardcoded Secret" in categories
    assert "Security Violation" in categories


def test_dependency_graph_builder():
    scanned_files = [
        {"file_path": "app/main.py", "file_type": "py", "size_bytes": 100},
        {"file_path": "app/services.py", "file_type": "py", "size_bytes": 150},
    ]
    ast_symbols = [
        {"symbol_type": "import", "name": "app.services", "file_path": "app/main.py"}
    ]

    graph = build_dependency_graph(scanned_files, ast_symbols)
    assert graph["total_nodes"] == 2
    assert graph["total_edges"] >= 1
    assert graph["edges"][0]["source"] == "app/main.py"
    assert graph["edges"][0]["target"] == "app/services.py"


def test_architecture_and_quality_api_endpoints():
    with TestClient(app) as client:
        # Create project
        proj_res = client.post("/api/v1/projects", json={"name": "Architecture Test Project"})
        project_id = proj_res.json()["id"]

        # Upload repository zip
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("app/main.py", "import app.utils\ndef main(): pass\n")
            zf.writestr("app/utils.py", "def helper(): pass\n")

        files = {"file": ("arch_test_repo.zip", buf.getvalue(), "application/zip")}
        upload_res = client.post(
            f"/api/v1/projects/{project_id}/repositories/upload-zip",
            files=files
        )
        repo_id = upload_res.json()["id"]

        # 1. Test Architecture Graph Endpoint
        graph_res = client.get(f"/api/v1/repositories/{repo_id}/architecture-graph")
        assert graph_res.status_code == 200
        graph_data = graph_res.json()
        assert graph_data["total_nodes"] == 2

        # 2. Test Quality Insights Endpoint
        insights_res = client.get(f"/api/v1/repositories/{repo_id}/quality-insights")
        assert insights_res.status_code == 200
        insights_data = insights_res.json()
        assert "health_score" in insights_data
        assert insights_data["total_lines_of_code"] >= 2
