#!/usr/bin/env python3
"""Build gitboba.app phone mockups: raw UI + device frame, transparent outside."""

from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow first.", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
APP_REPO = Path(os.environ.get("GITBOBA_APP_REPO", Path.home() / "development/GitBobaApp"))
BEZELS = APP_REPO / "scripts" / "add_bezels.py"
RAW_DIR = APP_REPO / "screenshots"
FRAMES = APP_REPO / "marketing" / "frames"
OUT = ROOT / "images"
PHONE = "1242x2688"

EXPORTS: list[tuple[str, str, int]] = [
    ("home", "screenshot-home", 780),
    ("home", "screenshot-home-docs", 390),
    ("pr-detail", "screenshot-pull-request", 390),
    ("actions", "screenshot-actions", 390),
    ("notifications", "screenshot-notifications", 390),
]


def _load_compose():
    spec = importlib.util.spec_from_file_location("add_bezels", BEZELS)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {BEZELS}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.compose_device_rgba, mod._pick_frame


def compose_one(raw_path: Path, width: int) -> Image.Image:
    compose_device_rgba, pick_frame = _load_compose()
    shot = Image.open(raw_path).convert("RGBA")
    frame_path = pick_frame(FRAMES, shot.size, color_hint=None)
    if frame_path is None:
        raise RuntimeError(f"No device frame in {FRAMES} for {raw_path.name}")
    frame = Image.open(frame_path).convert("RGBA")
    canvas = compose_device_rgba(shot, frame)
    if canvas is None:
        raise RuntimeError(f"compose_device_rgba failed for {raw_path.name}")
    w, h = canvas.size
    out_h = round(h * width / w)
    return canvas.resize((width, out_h), Image.Resampling.LANCZOS)


def main() -> int:
    if not RAW_DIR.is_dir():
        print(f"Missing {RAW_DIR} — run take_screenshots.sh in GitBobaApp.", file=sys.stderr)
        return 1
    if not FRAMES.is_dir():
        print(f"Missing {FRAMES} — extract Apple bezels in GitBobaApp.", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    for raw_name, out_name, width in EXPORTS:
        raw = RAW_DIR / f"{raw_name}-{PHONE}.png"
        if not raw.is_file():
            print(f"Missing {raw}", file=sys.stderr)
            return 1
        img = compose_one(raw, width)
        dest = OUT / f"{out_name}.png"
        img.save(dest, "PNG", optimize=True)
        print(f"  {dest.name} ({img.size[0]}×{img.size[1]}, RGBA)")

    print("Done — device frames, transparent outside phone (matches hero style).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
