#!/usr/bin/env python3
"""Resize a raw GitBobaApp screenshot for the marketing site.

Trims letterboxed white bars (common at the top of simulator PNGs) so the
image doesn't show a white slab on the dark homepage.
"""

from __future__ import annotations

import argparse
import sys

try:
    from PIL import Image
except ImportError:
    print("Install Pillow (see generate-og-share.py venv note).", file=sys.stderr)
    sys.exit(1)


def _row_mostly_white(px, w: int, y: int, tol: int, ratio: float) -> bool:
    white = 0
    for x in range(w):
        r, g, b = px[x, y][:3]
        if r >= 255 - tol and g >= 255 - tol and b >= 255 - tol:
            white += 1
    return white / w >= ratio


def _col_mostly_white(px, w: int, h: int, x: int, tol: int, ratio: float) -> bool:
    white = 0
    for y in range(h):
        r, g, b = px[x, y][:3]
        if r >= 255 - tol and g >= 255 - tol and b >= 255 - tol:
            white += 1
    return white / h >= ratio


def trim_letterbox(im: Image.Image, tol: int = 10, ratio: float = 0.985) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()

    top = 0
    while top < h and _row_mostly_white(px, w, top, tol, ratio):
        top += 1
    bottom = h - 1
    while bottom > top and _row_mostly_white(px, w, bottom, tol, ratio):
        bottom -= 1
    left = 0
    while left < w and _col_mostly_white(px, w, h, left, tol, ratio):
        left += 1
    right = w - 1
    while right > left and _col_mostly_white(px, w, h, right, tol, ratio):
        right -= 1

    if left >= right or top >= bottom:
        return im
    return im.crop((left, top, right + 1, bottom + 1))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("src")
    parser.add_argument("dst")
    parser.add_argument("--width", type=int, required=True)
    args = parser.parse_args()

    im = Image.open(args.src)
    im = trim_letterbox(im)
    w, h = im.size
    out_h = int(h * args.width / w)
    im = im.resize((args.width, out_h), Image.Resampling.LANCZOS)
    im.save(args.dst, "PNG", optimize=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
