"""Asyncio periodic task, registered from app.py's lifespan.

Currently only ticks recurrence materialisation. HA person sync will be added here in
Phase 3 (see spec/roadmap.md).
"""

from __future__ import annotations

import asyncio
import logging

from sqlmodel import Session

from .database import get_engine
from .services import recurrence

logger = logging.getLogger(__name__)


async def _tick() -> None:
    with Session(get_engine()) as session:
        count = recurrence.materialize_due_todos(session)
        if count:
            logger.info("Materialised %d recurring todo(s).", count)


async def run_periodic(interval_minutes: int) -> None:
    """Run a materialisation tick immediately, then every `interval_minutes`."""
    await _tick()
    while True:
        await asyncio.sleep(interval_minutes * 60)
        await _tick()
