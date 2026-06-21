"""Shared pytest fixtures for ha_shopping_list tests."""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

import ha_shopping_list.database as db_module
from ha_shopping_list.app import create_app
from ha_shopping_list.database import get_session


@pytest.fixture
def sample_workspace(tmp_path: Path) -> Path:
    """Create a temporary workspace for CLI and config tests."""
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    return workspace


@pytest.fixture(name="engine")
def engine_fixture():
    """In-memory SQLite engine shared across the test via StaticPool."""
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(test_engine)

    # Patch the module-level engine so lifespan helpers also use this engine.
    original = db_module._engine
    db_module._engine = test_engine
    yield test_engine
    db_module._engine = original
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture(name="session")
def session_fixture(engine) -> Generator[Session]:
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(engine, session: Session) -> Generator[TestClient]:
    def override_get_session() -> Generator[Session]:
        yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client
    app.dependency_overrides.clear()
