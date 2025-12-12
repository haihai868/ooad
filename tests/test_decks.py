from fastapi import status


def auth_header(client):
    # create user and login
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "deckuser",
            "email": "deck@example.com",
            "password": "password123",
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"username": "deckuser", "password": "password123"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_deck_and_flashcard(client):
    headers = auth_header(client)

    # create deck
    resp = client.post(
        "/api/v1/decks/",
        headers=headers,
        json={"title": "Biology", "description": "Cells", "is_public": True},
    )
    assert resp.status_code == status.HTTP_201_CREATED, resp.text
    deck = resp.json()
    deck_id = deck["id"]

    # add flashcard
    fc = client.post(
        f"/api/v1/decks/{deck_id}/flashcards",
        headers=headers,
        json={
            "front_content": "What is DNA?",
            "back_content": "Genetic material",
            "image_url": None,
        },
    )
    assert fc.status_code == status.HTTP_201_CREATED, fc.text
    flashcard = fc.json()
    assert flashcard["deck_id"] == deck_id

    # get deck with flashcards
    deck_resp = client.get(f"/api/v1/decks/{deck_id}", headers=headers)
    assert deck_resp.status_code == status.HTTP_200_OK, deck_resp.text
    data = deck_resp.json()
    assert len(data["flashcards"]) == 1
    assert data["flashcards"][0]["front_content"] == "What is DNA?"


def test_browse_public_decks(client):
    # reuse auth to create a public deck
    headers = auth_header(client)
    client.post(
        "/api/v1/decks/",
        headers=headers,
        json={"title": "Math", "description": "Algebra", "is_public": True},
    )

    resp = client.get("/api/v1/decks/?is_public=true")
    assert resp.status_code == status.HTTP_200_OK, resp.text
    decks = resp.json()
    assert any(d["title"] == "Math" for d in decks)

