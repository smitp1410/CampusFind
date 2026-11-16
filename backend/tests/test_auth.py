from app.core.security import verify_password, get_password_hash, validate_college_email

def test_password_hashing():
    raw = "MySecurePass123!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_college_email_validator():
    # If set to '*' all are accepted
    assert validate_college_email("student@campus.edu") is True
    assert validate_college_email("invalid_format") is False

def test_register_and_login_flow(client):
    # Register new student
    reg_payload = {
        "email": "test.student@campus.edu",
        "password": "Password123!",
        "full_name": "Test Student",
        "student_faculty_id": "STU-9999",
        "role": "student"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test.student@campus.edu"
    assert data["user"]["role"] == "student"

    # Login with correct credentials
    login_payload = {
        "email": "test.student@campus.edu",
        "password": "Password123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # Login with wrong password
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "test.student@campus.edu",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # Protected me endpoint
    token = login_data["access_token"]
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "test.student@campus.edu"
