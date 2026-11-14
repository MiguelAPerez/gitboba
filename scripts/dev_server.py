#!/usr/bin/env python3
"""Local dev server with GitHub Pages-style extensionless URLs."""

from __future__ import annotations

import argparse
import http.server
import os
import sys
from functools import partial
from typing import Callable

from lib.repo import ROOT


LONG_CACHE_SUFFIXES = (
    ".css",
    ".js",
    ".png",
    ".webp",
    ".jpg",
    ".jpeg",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
)

LONG_CACHE = "public, max-age=86400, must-revalidate"
NO_CACHE = "no-cache"


def cache_control(request_path: str) -> str | None:
    """Cache-Control value for a request path (query string ignored), if any."""
    path = request_path.split("?", 1)[0]
    if path.endswith(LONG_CACHE_SUFFIXES):
        return LONG_CACHE
    if path.endswith(".html") or path.endswith("/"):
        return NO_CACHE
    return None


def rewrite_extensionless(request_path: str, is_file: Callable[[str], bool]) -> str:
    """Map /foo to /foo/index.html or /foo.html when one exists, like GitHub Pages.

    `is_file` receives a URL path (e.g. "/foo.html") and says whether it exists.
    Paths that are not extensionless, or that match nothing, come back unchanged.
    """
    path, _, query = request_path.partition("?")
    suffix = f"?{query}" if query else ""

    if path == "/" or path.endswith("/") or os.path.splitext(path)[1]:
        return request_path

    rel = path.lstrip("/")
    for candidate in (f"/{rel}/index.html", f"/{rel}.html"):
        if is_file(candidate):
            return f"{candidate}{suffix}"
    return request_path


class DevHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        value = cache_control(self.path)
        if value is not None:
            self.send_header("Cache-Control", value)
        super().end_headers()

    def _rewrite_extensionless_path(self) -> None:
        self.path = rewrite_extensionless(
            self.path, lambda url_path: os.path.isfile(self.translate_path(url_path))
        )

    def do_GET(self) -> None:
        self._rewrite_extensionless_path()
        super().do_GET()

    def do_HEAD(self) -> None:
        self._rewrite_extensionless_path()
        super().do_HEAD()

    def log_message(self, format: str, *args) -> None:
        sys.stdout.write(f"[dev] {self.address_string()} - {format % args}\n")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", "-p", type=int, default=8000)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    root = str(ROOT)
    os.chdir(root)

    handler = partial(DevHTTPRequestHandler, directory=root)
    server = http.server.ThreadingHTTPServer((args.host, args.port), handler)

    print(f"Serving {root}")
    print(f"Open http://{args.host}:{args.port}/")
    print("Press Ctrl+C to stop.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
