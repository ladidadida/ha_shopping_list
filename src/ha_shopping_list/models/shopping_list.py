"""ShoppingList DB table model and request/response schemas."""

from __future__ import annotations

from typing import ClassVar

from sqlmodel import Field, SQLModel


class ShoppingListBase(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    sort_order: int = 0


class ShoppingListDB(ShoppingListBase, table=True):
    __tablename__: ClassVar[str] = "shopping_list"

    id: int | None = Field(default=None, primary_key=True)


class ShoppingListCreate(ShoppingListBase):
    pass


class ShoppingListRead(ShoppingListBase):
    id: int
