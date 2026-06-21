"""Integration tests for /api/v1/lists."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
def test_list_lists_contains_default(client: TestClient) -> None:
    """The default list is seeded on startup."""
    response = client.get("/api/v1/lists")
    assert response.status_code == 200
    body = response.json()
    assert len(body) >= 1
    assert body[0]["name"] == "Einkaufsliste"


@pytest.mark.integration
def test_create_list(client: TestClient) -> None:
    response = client.post("/api/v1/lists", json={"name": "Aldi"})
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Aldi"
    assert isinstance(body["id"], int)


@pytest.mark.integration
def test_create_list_empty_name_rejected(client: TestClient) -> None:
    response = client.post("/api/v1/lists", json={"name": ""})
    assert response.status_code == 422


@pytest.mark.integration
def test_delete_list(client: TestClient) -> None:
    list_id = client.post("/api/v1/lists", json={"name": "Temp"}).json()["id"]
    assert client.delete(f"/api/v1/lists/{list_id}").status_code == 204
    ids = [sl["id"] for sl in client.get("/api/v1/lists").json()]
    assert list_id not in ids


@pytest.mark.integration
def test_delete_list_not_found(client: TestClient) -> None:
    assert client.delete("/api/v1/lists/99999").status_code == 404


@pytest.mark.integration
def test_items_scoped_to_list(client: TestClient) -> None:
    """Items created in different lists are filtered independently."""
    list_a = client.post("/api/v1/lists", json={"name": "Edeka"}).json()["id"]
    list_b = client.post("/api/v1/lists", json={"name": "Aldi"}).json()["id"]

    client.post("/api/v1/items", json={"name": "Apfel", "list_id": list_a})
    client.post("/api/v1/items", json={"name": "Brot", "list_id": list_b})

    items_a = client.get(f"/api/v1/items?list_id={list_a}").json()
    items_b = client.get(f"/api/v1/items?list_id={list_b}").json()

    assert [i["name"] for i in items_a] == ["Apfel"]
    assert [i["name"] for i in items_b] == ["Brot"]


@pytest.mark.integration
def test_delete_checked_scoped_to_list(client: TestClient) -> None:
    """Bulk-delete checked only removes items from the specified list."""
    list_a = client.post("/api/v1/lists", json={"name": "A"}).json()["id"]
    list_b = client.post("/api/v1/lists", json={"name": "B"}).json()["id"]

    id_a = client.post("/api/v1/items", json={"name": "In A", "list_id": list_a}).json()["id"]
    id_b = client.post("/api/v1/items", json={"name": "In B", "list_id": list_b}).json()["id"]

    client.patch(f"/api/v1/items/{id_a}", json={"checked": True})
    client.patch(f"/api/v1/items/{id_b}", json={"checked": True})

    # Delete checked only in list A
    assert client.delete(f"/api/v1/items?checked=true&list_id={list_a}").status_code == 204

    remaining_a = [i["id"] for i in client.get(f"/api/v1/items?list_id={list_a}").json()]
    remaining_b = [i["id"] for i in client.get(f"/api/v1/items?list_id={list_b}").json()]

    assert id_a not in remaining_a
    assert id_b in remaining_b
