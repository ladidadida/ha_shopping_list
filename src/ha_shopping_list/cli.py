"""CLI entry point for ha_shopping_list."""

from __future__ import annotations

import argparse
import sys
from typing import Sequence

from ._version import __version__


def main(argv: Sequence[str] | None = None) -> int:
    """Main entry point for the CLI.

    Args:
        argv: Command-line arguments (None = sys.argv[1:]).

    Returns:
        Exit code (0 for success, non-zero for failure).
    """
    parser = argparse.ArgumentParser(
        prog="ha_shopping_list",
        description="A better shopping list for homeassistant",
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {__version__}",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose output",
    )

    args = parser.parse_args(argv)

    if args.verbose:
        print(f"Running {parser.prog} v{__version__}")

    # Add your CLI logic here
    print("Hello from ha_shopping_list!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
