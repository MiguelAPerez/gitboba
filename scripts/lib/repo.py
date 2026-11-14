"""Paths shared by the Python scripts."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def app_repo(env: dict[str, str] | None = None) -> Path:
    """Sibling GitBobaApp checkout, overridable with GITBOBA_APP_REPO."""
    env = os.environ if env is None else env
    return Path(env.get("GITBOBA_APP_REPO") or Path.home() / "development/GitBobaApp")
