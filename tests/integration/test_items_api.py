"""Integration tests for /api/v1/items."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
def test_list_items_empty(client: TestClient) -> None:
    response = client.get("/api/v1/items")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.integration
def test_create_item_minimal(client: TestClient) -> None:
    response = client.post("/api/v1/items", json={"name": "Milk"})
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Milk"
    assert body["checked"] is False
    assert body["quantity"] is None
    assert body["category_id"] is None
    assert isinstance(body["id"], int)


@pytest.mark.integration
def test_create_item_full(client: TestClient) -> None:
    cat = client.post("/api/v1/categories", json={"name": "Dairy"}).json()
    response = client.post(
        "/api/v1/items",
        json={"name": "Butter", "quantity": "250g", "category_id": cat["id"]},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Butter"
    assert body["quantity"] == "250g"
    assert body["category_id"] == cat["id"]


@pytest.mark.integration
def test_create_item_empty_name_rejected(client: TestClient) -> None:
    response = client.post("/api/v1/items", json={"name": ""})
    assert response.status_code == 422


@pytest.mark.integration
def test_patch_item_check(client: TestClient) -> None:
    item_id = client.post("/api/v1/items", json={"name": "Eggs"}).json()["id"]
    response = client.patch(f"/api/v1/items/{item_id}", json={"checked": True})
    assert response.status_code == 200
    assert response.json()["checked"] is True


@pytest.mark.integration
def test_patch_item_rename(client: TestClient) -> None:
    item_id = client.post("/api/v1/items", json={"name": "OldName"}).json()["id"]
    response = client.patch(f"/api/v1/items/{item_id}", json={"name": "NewName"})
    assert response.status_code == 200
    assert response.json()["name"] == "NewName"


@pytest.mark.integration
def test_patch_item_not_found(client: TestClient) -> None:
    response = client.patch("/api/v1/items/99999", json={"checked": True})
    assert response.status_code == 404


@pytest.mark.integration
def test_filter_items_by_checked(client: TestClient) -> None:
    client.post("/api/v1/items", json={"name": "Bread"})
    item2_id = client.post("/api/v1/items", json={"name": "Cheese"}).json()["id"]
    client.patch(f"/api/v1/items/{item2_id}", json={"checked": True})

    unchecked = client.get("/api/v1/items?checked=false").json()
    checked = client.get("/api/v1/items?checked=true").json()

    assert all(not i["checked"] for i in unchecked)
    assert all(i["checked"] for i in checked)
    assert len(unchecked) == 1
    assert len(checked) == 1


@pytest.mark.integration
def test_delete_item(client: TestClient) -> None:
    item_id = client.post("/api/v1/items", json={"name": "Yoghurt"}).json()["id"]
    del_resp = client.delete(f"/api/v1/items/{item_id}")
    assert del_resp.status_code == 204

    remaining_ids = [i["id"] for i in client.get("/api/v1/items").json()]
    assert item_id not in remaining_ids


@pytest.mark.integration
def test_delete_item_not_found(client: TestClient) -> None:
    response = client.delete("/api/v1/items/99999")
    assert response.status_code == 404


@pytest.mark.integration
def test_bulk_delete_checked_items(client: TestClient) -> None:
    id1 = client.post("/api/v1/items", json={"name": "Keep"}).json()["id"]
    id2 = client.post("/api/v1/items", json={"name": "Remove"}).json()["id"]
    client.patch(f"/api/v1/items/{id2}", json={"checked": True})

    response = client.delete("/api/v1/items?checked=true")
    assert response.status_code == 204

    remaining_ids = [i["id"] for i in client.get("/api/v1/items").json()]
    assert id1 in remaining_ids
    assert id2 not in remaining_ids


@pytest.mark.integration
def test_bulk_delete_checked_false_rejected(client: TestClient) -> None:
    response = client.delete("/api/v1/items?checked=false")
    assert response.status_code == 422
