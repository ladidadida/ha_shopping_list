"""Business logic for category operations."""

from __future__ import annotations

from sqlmodel import Session, select

from ..models.category import CategoryCreate, CategoryDB


def list_categories(session: Session) -> list[CategoryDB]:
    return list(session.exec(select(CategoryDB).order_by(CategoryDB.sort_order)).all())  # type: ignore[arg-type]


def create_category(session: Session, data: CategoryCreate) -> CategoryDB:
    category = CategoryDB.model_validate(data)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def delete_category(session: Session, category_id: int) -> bool:
    """Delete a category; items in that category become uncategorised."""
    category = session.get(CategoryDB, category_id)
    if category is None:
        return False
    session.delete(category)
    session.commit()
    return True
