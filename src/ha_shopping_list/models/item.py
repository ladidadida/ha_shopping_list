"""Item DB table model and request/response schemas."""

from __future__ import annotations

from typing import ClassVar

from sqlmodel import Field, SQLModel


class ItemBase(SQLModel):
    name: str = Field(min_length=1, max_length=200)
    quantity: str | None = None
    checked: bool = False
    category_id: int | None = None
    list_id: int | None = None


class ItemDB(ItemBase, table=True):
    __tablename__: ClassVar[str] = "item"

    id: int | None = Field(default=None, primary_key=True)


class ItemCreate(SQLModel):
    name: str = Field(min_length=1, max_length=200)
    quantity: str | None = None
    category_id: int | None = None
    list_id: int | None = None


class ItemUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    quantity: str | None = None
    checked: bool | None = None
    category_id: int | None = None
    list_id: int | None = None


class ItemRead(ItemBase):
    id: int
