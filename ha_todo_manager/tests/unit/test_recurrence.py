"""Unit tests for ha_todo_manager.services.recurrence — pure RRULE date math, no DB."""

from __future__ import annotations

from datetime import date

import pytest

from ha_todo_manager.services.recurrence import advance_due_date, first_due_date


def test_first_due_date_daily_includes_dtstart() -> None:
    assert first_due_date("FREQ=DAILY", date(2026, 1, 5)) == date(2026, 1, 5)


def test_first_due_date_weekly_includes_dtstart() -> None:
    assert first_due_date("FREQ=WEEKLY", date(2026, 1, 5)) == date(2026, 1, 5)


def test_advance_due_date_daily() -> None:
    assert advance_due_date("FREQ=DAILY", date(2026, 1, 5), date(2026, 1, 5)) == date(2026, 1, 6)
    assert advance_due_date("FREQ=DAILY", date(2026, 1, 5), date(2026, 1, 10)) == date(2026, 1, 11)


def test_advance_due_date_weekly() -> None:
    assert advance_due_date("FREQ=WEEKLY", date(2026, 1, 5), date(2026, 1, 5)) == date(2026, 1, 12)


def test_advance_due_date_returns_none_when_no_more_occurrences() -> None:
    assert advance_due_date("FREQ=DAILY;COUNT=1", date(2026, 1, 5), date(2026, 1, 5)) is None


def test_invalid_rrule_raises_value_error() -> None:
    with pytest.raises(ValueError):
        first_due_date("NOT A VALID RRULE", date(2026, 1, 5))
