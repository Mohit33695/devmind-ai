from fastapi.testclient import TestClient
from app.main import app
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hashing_and_verification():
    raw_pass = "SecureDevPass123!"
    hashed = hash_password(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPass", hashed) is False


def test_jwt_token_creation_and_decoding():
    payload = {"sub": "user-uuid-123", "email": "test@devmind.ai"}
    token = create_access_token(payload)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-uuid-123"
    assert decoded["email"] == "test@devmind.ai"


def test_user_register_login_profile_flow():
    with TestClient(app) as client:
        # 1. Register User
        reg_payload = {
            "email": "student@devmind.ai",
            "password": "Password123!",
            "full_name": "Dev Student"
        }
        reg_res = client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code == 201
        reg_data = reg_res.json()
        assert reg_data["email"] == "student@devmind.ai"
        assert "id" in reg_data

        # 2. Login User
        login_res = client.post(
            "/api/v1/auth/login",
            json={"email": "student@devmind.ai", "password": "Password123!"}
        )
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        token = token_data["access_token"]

        # 3. Access Protected /me Endpoint
        headers = {"Authorization": f"Bearer {token}"}
        profile_res = client.get("/api/v1/auth/me", headers=headers)
        assert profile_res.status_code == 200
        prof_data = profile_res.json()
        assert prof_data["email"] == "student@devmind.ai"
        assert prof_data["full_name"] == "Dev Student"

        # 4. Reject invalid token
        bad_res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token"})
        assert bad_res.status_code == 401
