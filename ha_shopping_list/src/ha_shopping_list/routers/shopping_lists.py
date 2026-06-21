"""API router for /api/v1/lists."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from ..database import get_session
from ..models.shopping_list import ShoppingListCreate, ShoppingListRead
from ..services import shopping_lists as svc

router = APIRouter(prefix="/lists", tags=["lists"])


@router.get("", response_model=list[ShoppingListRead])
def get_lists(session: Session = Depends(get_session)) -> list[ShoppingListRead]:
    return svc.list_shopping_lists(session)  # type: ignore[return-value]


@router.post("", response_model=ShoppingListRead, status_code=201)
def post_list(
    data: ShoppingListCreate, session: Session = Depends(get_session)
) -> ShoppingListRead:
    return svc.create_shopping_list(session, data)  # type: ignore[return-value]


@router.delete("/{list_id}", status_code=204)
def delete_list(list_id: int, session: Session = Depends(get_session)) -> None:
    if not svc.delete_shopping_list(session, list_id):
        raise HTTPException(status_code=404, detail="List not found")
