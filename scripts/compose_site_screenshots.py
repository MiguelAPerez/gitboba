#!/usr/bin/env python3
"""Build gitboba.app phone mockups: raw UI + device frame, transparent outside."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from lib.repo import ROOT, app_repo

APP_REPO = app_repo()
BEZELS = APP_REPO / "scripts" / "add_bezels.py"
RAW_DIR = APP_REPO / "screenshots"
FRAMES = APP_REPO / "marketing" / "frames"
OUT = ROOT / "images"
PHONE = "1242x2688"

# (raw screenshot name, output name, output width in px)
EXPORTS: list[tuple[str, str, int]] = [
    ("home", "screenshot-home", 780),
    ("home", "screenshot-home-docs", 390),
    ("pr-detail", "screenshot-pull-request", 390),
    ("actions", "screenshot-actions", 390),
    ("notifications", "screenshot-notifications", 390),
]


def scaled_height(size: tuple[int, int], width: int) -> int:
    """Height after resizing an image of `size` to `width`, keeping aspect ratio."""
    w, h = size
    return round(h * width / w)


def export_jobs(
    raw_dir: Path = RAW_DIR,
    out_dir: Path = OUT,
    exports: list[tuple[str, str, int]] = EXPORTS,
    phone: str = PHONE,
) -> list[tuple[Path, Path, int]]:
    """(raw input, output file, width) for every export."""
    return [
        (raw_dir / f"{raw_name}-{phone}.png", out_dir / f"{out_name}.png", width)
        for raw_name, out_name, width in exports
    ]


def _load_compose():
    spec = importlib.util.spec_from_file_location("add_bezels", BEZELS)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {BEZELS}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.compose_device_rgba, mod._pick_frame


def compose_one(raw_path: Path, width: int):
    from PIL import Image

    compose_device_rgba, pick_frame = _load_compose()
    shot = Image.open(raw_path).convert("RGBA")
    frame_path = pick_frame(FRAMES, shot.size, color_hint=None)
    if frame_path is None:
        raise RuntimeError(f"No device frame in {FRAMES} for {raw_path.name}")
    frame = Image.open(frame_path).convert("RGBA")
    canvas = compose_device_rgba(shot, frame)
    if canvas is None:
        raise RuntimeError(f"compose_device_rgba failed for {raw_path.name}")
    return canvas.resize(
        (width, scaled_height(canvas.size, width)), Image.Resampling.LANCZOS
    )


def main() -> int:
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("Install Pillow first.", file=sys.stderr)
        return 1

    if not RAW_DIR.is_dir():
        print(f"Missing {RAW_DIR} — run take_screenshots.sh in GitBobaApp.", file=sys.stderr)
        return 1
    if not FRAMES.is_dir():
        print(f"Missing {FRAMES} — extract Apple bezels in GitBobaApp.", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    for raw, dest, width in export_jobs():
        if not raw.is_file():
            print(f"Missing {raw}", file=sys.stderr)
            return 1
        img = compose_one(raw, width)
        img.save(dest, "PNG", optimize=True)
        print(f"  {dest.name} ({img.size[0]}×{img.size[1]}, RGBA)")

    print("Done — device frames, transparent outside phone (matches hero style).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
