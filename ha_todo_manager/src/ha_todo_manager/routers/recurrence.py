"""API router for /api/recurrence."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..database import get_session
from ..services import recurrence as svc

router = APIRouter(prefix="/recurrence", tags=["recurrence"])


@router.post("/materialise")
def post_materialise(session: Session = Depends(get_session)) -> dict[str, int]:
    count = svc.materialize_due_todos(session)
    return {"materialised": count}
