"""Business logic for item operations."""

from __future__ import annotations

from sqlmodel import Session, select

from ..models.item import ItemCreate, ItemDB, ItemUpdate


def list_items(
    session: Session, checked: bool | None = None, list_id: int | None = None
) -> list[ItemDB]:
    stmt = select(ItemDB)
    if checked is not None:
        stmt = stmt.where(ItemDB.checked == checked)  # noqa: E712
    if list_id is not None:
        stmt = stmt.where(ItemDB.list_id == list_id)
    return list(session.exec(stmt).all())


def create_item(session: Session, data: ItemCreate) -> ItemDB:
    item = ItemDB.model_validate(data)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def update_item(session: Session, item_id: int, data: ItemUpdate) -> ItemDB | None:
    item = session.get(ItemDB, item_id)
    if item is None:
        return None
    patch = data.model_dump(exclude_unset=True)
    item.sqlmodel_update(patch)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_item(session: Session, item_id: int) -> bool:
    item = session.get(ItemDB, item_id)
    if item is None:
        return False
    session.delete(item)
    session.commit()
    return True


def delete_checked_items(session: Session, list_id: int | None = None) -> int:
    stmt = select(ItemDB).where(ItemDB.checked == True)  # noqa: E712
    if list_id is not None:
        stmt = stmt.where(ItemDB.list_id == list_id)
    items = list(session.exec(stmt).all())
    for item in items:
        session.delete(item)
    session.commit()
    return len(items)
