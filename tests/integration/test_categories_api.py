"""Integration tests for /api/v1/categories."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
def test_list_categories_returns_seeded_defaults(client: TestClient) -> None:
    """The lifespan seeds 8 default categories; the list must not be empty."""
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8
    assert data[0]["name"] == "Obst & Gemüse"


@pytest.mark.integration
def test_create_category(client: TestClient) -> None:
    response = client.post("/api/v1/categories", json={"name": "Snacks", "sort_order": 10})
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Snacks"
    assert body["sort_order"] == 10
    assert isinstance(body["id"], int)


@pytest.mark.integration
def test_create_category_default_sort_order(client: TestClient) -> None:
    response = client.post("/api/v1/categories", json={"name": "Misc"})
    assert response.status_code == 201
    assert response.json()["sort_order"] == 0


@pytest.mark.integration
def test_create_category_empty_name_rejected(client: TestClient) -> None:
    response = client.post("/api/v1/categories", json={"name": ""})
    assert response.status_code == 422


@pytest.mark.integration
def test_list_categories_sorted(client: TestClient) -> None:
    """Custom categories with high sort_order values appear at the end in order."""
    client.post("/api/v1/categories", json={"name": "Middle", "sort_order": 100})
    client.post("/api/v1/categories", json={"name": "Last", "sort_order": 200})
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    names = [c["name"] for c in response.json()]
    # Default categories have sort_order 0-7; our two appear after them.
    assert names[-2] == "Middle"
    assert names[-1] == "Last"


@pytest.mark.integration
def test_delete_category(client: TestClient) -> None:
    create_resp = client.post("/api/v1/categories", json={"name": "ToDelete"})
    category_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/categories/{category_id}")
    assert del_resp.status_code == 204

    list_resp = client.get("/api/v1/categories")
    ids = [c["id"] for c in list_resp.json()]
    assert category_id not in ids


@pytest.mark.integration
def test_delete_category_not_found(client: TestClient) -> None:
    response = client.delete("/api/v1/categories/99999")
    assert response.status_code == 404
