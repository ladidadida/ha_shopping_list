"""API router for /api/v1/items."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from ..database import get_session
from ..models.item import ItemCreate, ItemRead, ItemUpdate
from ..services import items as svc

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemRead])
def get_items(
    checked: bool | None = Query(default=None),
    list_id: int | None = Query(default=None),
    session: Session = Depends(get_session),
) -> list[ItemRead]:
    return svc.list_items(session, checked, list_id)  # type: ignore[return-value]


@router.post("", response_model=ItemRead, status_code=201)
def post_item(data: ItemCreate, session: Session = Depends(get_session)) -> ItemRead:
    return svc.create_item(session, data)  # type: ignore[return-value]


@router.patch("/{item_id}", response_model=ItemRead)
def patch_item(
    item_id: int,
    data: ItemUpdate,
    session: Session = Depends(get_session),
) -> ItemRead:
    item = svc.update_item(session, item_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item  # type: ignore[return-value]


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, session: Session = Depends(get_session)) -> None:
    if not svc.delete_item(session, item_id):
        raise HTTPException(status_code=404, detail="Item not found")


@router.delete("", status_code=204)
def delete_checked_items(
    checked: bool = Query(..., description="Must be true to bulk-delete checked items"),
    list_id: int | None = Query(default=None),
    session: Session = Depends(get_session),
) -> None:
    if not checked:
        raise HTTPException(status_code=422, detail="checked query parameter must be true")
    svc.delete_checked_items(session, list_id)
