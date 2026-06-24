"""API router for /api/persons."""

from __future__ import annotations

import uuid

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import Session

from .. import ha_client
from ..database import get_session
from ..models.person import PersonCreate, PersonRead
from ..services import persons as svc

router = APIRouter(prefix="/persons", tags=["persons"])


@router.get("", response_model=list[PersonRead])
def get_persons(session: Session = Depends(get_session)) -> list[PersonRead]:
    return svc.list_persons(session)  # type: ignore[return-value]


@router.post("", response_model=PersonRead, status_code=201)
def post_person(data: PersonCreate, session: Session = Depends(get_session)) -> PersonRead:
    return svc.create_person(session, data)  # type: ignore[return-value]


@router.delete("/{person_id}", status_code=204)
def delete_person(person_id: uuid.UUID, session: Session = Depends(get_session)) -> None:
    if not svc.delete_person(session, person_id):
        raise HTTPException(status_code=404, detail="Person not found")


@router.post("/{person_id}/claim", response_model=PersonRead)
def post_claim(
    person_id: uuid.UUID,
    session: Session = Depends(get_session),
    x_ingress_user: str | None = Header(default=None, alias="X-Ingress-User"),
) -> PersonRead:
    """Bind the requesting HA user to an existing person, fixing up the `mine` filter
    for persons created manually (no HA account to sync from)."""
    if not x_ingress_user:
        raise HTTPException(status_code=422, detail="No X-Ingress-User header on this request")
    person = svc.claim_person(session, person_id, x_ingress_user)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return person  # type: ignore[return-value]


@router.post("/sync")
async def post_sync(session: Session = Depends(get_session)) -> dict[str, int]:
    try:
        entries = await ha_client.fetch_persons()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=503, detail=f"Could not reach Home Assistant: {exc}"
        ) from exc
    count = svc.sync_persons(session, entries)
    return {"synced": count}
