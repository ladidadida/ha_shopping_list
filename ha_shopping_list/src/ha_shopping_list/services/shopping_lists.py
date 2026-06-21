"""Business logic for shopping-list operations."""

from __future__ import annotations

from sqlmodel import Session, select

from ..models.shopping_list import ShoppingListCreate, ShoppingListDB


def list_shopping_lists(session: Session) -> list[ShoppingListDB]:
    return list(session.exec(select(ShoppingListDB).order_by(ShoppingListDB.sort_order)).all())  # type: ignore[arg-type]


def get_shopping_list(session: Session, list_id: int) -> ShoppingListDB | None:
    return session.get(ShoppingListDB, list_id)


def create_shopping_list(session: Session, data: ShoppingListCreate) -> ShoppingListDB:
    sl = ShoppingListDB.model_validate(data)
    session.add(sl)
    session.commit()
    session.refresh(sl)
    return sl


def delete_shopping_list(session: Session, list_id: int) -> bool:
    sl = session.get(ShoppingListDB, list_id)
    if sl is None:
        return False
    session.delete(sl)
    session.commit()
    return True
