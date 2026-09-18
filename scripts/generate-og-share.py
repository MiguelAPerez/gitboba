#!/usr/bin/env python3
"""Build images/og-share.png (1200×630) from marketing/screenshots UI capture."""

from __future__ import annotations

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Install Pillow: python3 -m venv .venv-og && .venv-og/bin/pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_REPO = os.environ.get("GITBOBA_APP_REPO", os.path.expanduser("~/development/GitBobaApp"))
PHONE_SHOT = os.path.join(APP_REPO, "marketing", "screenshots", "home-1242x2688.png")
OUT = os.path.join(ROOT, "images", "og-share.png")

W, H = 1200, 630
BG = (18, 18, 20)
GREEN = (120, 200, 150)
AMBER = (230, 190, 120)
TEXT = (245, 245, 242)
MUTED = (160, 160, 168)


def main() -> int:
    if not os.path.isfile(PHONE_SHOT):
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
    target_h = 520
    scale = target_h / phone.height
    target_w = int(phone.width * scale)
    phone = phone.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = W - target_w - 48
    y = (H - target_h) // 2
    canvas.paste(phone, (x, y), phone)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    canvas.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
