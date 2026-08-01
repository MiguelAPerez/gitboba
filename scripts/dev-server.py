#!/usr/bin/env python3
"""Local dev server with GitHub Pages-style extensionless URLs."""

from __future__ import annotations

import argparse
import http.server
import os
import sys
from functools import partial


class DevHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def _rewrite_extensionless_path(self) -> None:
        path, _, query = self.path.partition("?")
        suffix = f"?{query}" if query else ""

        if path != "/" and not path.endswith("/") and not os.path.splitext(path)[1]:
            rel = path.lstrip("/")
            index_path = self.translate_path(f"/{rel}/index.html")
            if os.path.isfile(index_path):
                self.path = f"/{rel}/index.html{suffix}"
                return

            html_file = rel + ".html"
            html_path = self.translate_path(f"/{html_file}")
            if os.path.isfile(html_path):
                self.path = f"/{html_file}{suffix}"

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

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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
