import io
import zipfile
from fastapi.testclient import TestClient
from app.main import app
from app.services.code_parser import parse_python_ast, parse_javascript_typescript


def test_python_ast_parser_extraction():
    python_code = '''
"""Module docstring."""
import os
from datetime import datetime

class UserService(BaseService):
    """Manages user accounts."""
    def __init__(self, db):
        self.db = db

    async def get_user_by_id(self, user_id):
        """Fetches user entity."""
        return await self.db.find(user_id)

def calculate_tax(amount, rate=0.2):
    return amount * rate
'''
    symbols = parse_python_ast(python_code)
    types = [s["symbol_type"] for s in symbols]
    names = [s["name"] for s in symbols]

    assert "import" in types
    assert "class" in types
    assert "function" in types

    assert "UserService" in names
    assert "calculate_tax" in names
    assert "os" in names

    # Verify docstring extraction
    user_service_sym = next(s for s in symbols if s["name"] == "UserService")
    assert user_service_sym["docstring"] == "Manages user accounts."


def test_js_ts_ast_parser_extraction():
    js_code = '''
import { useState } from 'react';
import axios from 'axios';

export class ApiClient extends BaseClient {
    constructor() {}
}

export async function fetchHealth() {
    return true;
}

const formatCurrency = (val) => {
    return "$" + val;
};
'''
    symbols = parse_javascript_typescript(js_code)
    names = [s["name"] for s in symbols]

    assert "react" in names or "axios" in names
    assert "ApiClient" in names
    assert "fetchHealth" in names
    assert "formatCurrency" in names


def test_repository_parse_api_endpoint():
    with TestClient(app) as client:
        # Create project
        proj_res = client.post("/api/v1/projects", json={"name": "Parser Test Project"})
        project_id = proj_res.json()["id"]

        # Upload zip with python code
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("app/services.py", "def process_data(item):\n    return item * 2\n")
            zf.writestr("app/models.py", "class Item:\n    pass\n")
        
        files = {"file": ("test_parse.zip", buf.getvalue(), "application/zip")}
        upload_res = client.post(
            f"/api/v1/projects/{project_id}/repositories/upload-zip",
            files=files
        )
        repo_id = upload_res.json()["id"]

        # Trigger AST Parse API
        parse_res = client.post(f"/api/v1/repositories/{repo_id}/parse")
        assert parse_res.status_code == 200
        parse_data = parse_res.json()
        assert parse_data["files_parsed"] >= 1
        assert parse_data["total_symbols_extracted"] >= 2

        # Fetch extracted symbols
        sym_res = client.get(f"/api/v1/repositories/{repo_id}/symbols")
        assert sym_res.status_code == 200
        sym_data = sym_res.json()
        assert sym_data["total"] >= 2
        extracted_names = [s["name"] for s in sym_data["symbols"]]
        assert "process_data" in extracted_names
        assert "Item" in extracted_names
