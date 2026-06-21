"""Integration tests for ha_shopping_list CLI."""

from __future__ import annotations

import subprocess
import sys

import pytest


@pytest.mark.integration
def test_cli_entrypoint() -> None:
    """Test CLI entry point via console script."""
    result = subprocess.run(
        ["ha_shopping_list", "--help"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0
    assert (
        "usage:" in result.stdout.lower()
        or "A better shopping list for homeassistant" in result.stdout
    )


@pytest.mark.integration
def test_cli_module_invocation() -> None:
    """Test CLI via python -m invocation."""
    result = subprocess.run(
        [sys.executable, "-m", "ha_shopping_list", "--help"],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0
    assert (
        "usage:" in result.stdout.lower()
        or "A better shopping list for homeassistant" in result.stdout
    )
