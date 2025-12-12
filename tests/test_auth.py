from fastapi import status


def test_register_and_login(client):
    # Register
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
        },
    )
    assert resp.status_code == status.HTTP_201_CREATED, resp.text
    data = resp.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

    # Login
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "password123"},
    )
    assert resp.status_code == status.HTTP_200_OK, resp.text
    token = resp.json().get("access_token")
    assert token

    # Access protected route
    me = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == status.HTTP_200_OK, me.text
    assert me.json()["username"] == "testuser"

