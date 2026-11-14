#!/usr/bin/env python3
"""Build images/og-share.png (1200×630) from the composed phone screenshot."""

from __future__ import annotations

import os
import sys

from lib.repo import ROOT

PHONE_SHOT = ROOT / "images" / "screenshot-home.png"
OUT = ROOT / "images" / "og-share.png"

W, H = 1200, 630
PHONE_HEIGHT = 520
PHONE_MARGIN_RIGHT = 48
BG = (18, 18, 20)
GREEN = (120, 200, 150)
AMBER = (230, 190, 120)
TEXT = (245, 245, 242)
MUTED = (160, 160, 168)


def phone_layout(
    phone_size: tuple[int, int],
    canvas: tuple[int, int] = (W, H),
    target_h: int = PHONE_HEIGHT,
    margin_right: int = PHONE_MARGIN_RIGHT,
) -> tuple[int, int, int, int]:
    """(width, height, x, y) for the phone: scaled to target_h, right-aligned, centered vertically."""
    canvas_w, canvas_h = canvas
    scale = target_h / phone_size[1]
    target_w = int(phone_size[0] * scale)
    return target_w, target_h, canvas_w - target_w - margin_right, (canvas_h - target_h) // 2


def main() -> int:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print(
            "Install Pillow: python3 -m venv .venv-og && .venv-og/bin/pip install Pillow",
            file=sys.stderr,
        )
        return 1

    if not PHONE_SHOT.is_file():
        print(f"Missing {PHONE_SHOT}", file=sys.stderr)
        return 1

    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)

    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 52)
        sub_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 28)
        tag_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
    except OSError:
        title_font = ImageFont.load_default()
        sub_font = tag_font = title_font

    draw.text((64, 120), "GitBoba", font=title_font, fill=TEXT)
    draw.text((64, 195), "Gitea iOS app", font=sub_font, fill=GREEN)
    draw.text((64, 248), "for iPhone & iPad", font=sub_font, fill=AMBER)
    draw.text((64, 320), "Self-hosted · Native SwiftUI · Free", font=tag_font, fill=MUTED)

    phone = Image.open(PHONE_SHOT).convert("RGBA")
    target_w, target_h, x, y = phone_layout(phone.size)
    phone = phone.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas.paste(phone, (x, y), phone)

    os.makedirs(OUT.parent, exist_ok=True)
    canvas.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
