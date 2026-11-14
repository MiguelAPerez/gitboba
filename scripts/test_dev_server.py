import http.client
import tempfile
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path

from dev_server import (
    LONG_CACHE,
    NO_CACHE,
    DevHTTPRequestHandler,
    cache_control,
    rewrite_extensionless,
)


class CacheControlTest(unittest.TestCase):
    def test_static_assets_get_long_cache(self):
        for path in ("/css/doc.css", "/js/app.js", "/images/a.png", "/fonts/x.woff2"):
            self.assertEqual(cache_control(path), LONG_CACHE, path)

    def test_query_string_is_ignored(self):
        self.assertEqual(cache_control("/css/doc.css?v=3"), LONG_CACHE)

    def test_html_and_directories_are_not_cached(self):
        self.assertEqual(cache_control("/index.html"), NO_CACHE)
        self.assertEqual(cache_control("/docs/"), NO_CACHE)

    def test_other_paths_get_no_header(self):
        self.assertIsNone(cache_control("/privacy"))
        self.assertIsNone(cache_control("/CNAME"))


class RewriteTest(unittest.TestCase):
    def rewrite(self, path, *existing):
        return rewrite_extensionless(path, lambda p: p in existing)

    def test_directory_index_wins(self):
        self.assertEqual(
            self.rewrite("/docs", "/docs/index.html", "/docs.html"),
            "/docs/index.html",
        )

    def test_falls_back_to_html_file(self):
        self.assertEqual(
            self.rewrite("/api-compatibility", "/api-compatibility.html"),
            "/api-compatibility.html",
        )

    def test_query_string_is_preserved(self):
        self.assertEqual(
            self.rewrite("/docs?x=1", "/docs/index.html"), "/docs/index.html?x=1"
        )

    def test_unmatched_path_is_unchanged(self):
        self.assertEqual(self.rewrite("/nope"), "/nope")

    def test_root_trailing_slash_and_extensions_are_unchanged(self):
        for path in ("/", "/docs/", "/css/doc.css", "/index.html?x=1"):
            self.assertEqual(self.rewrite(path, "/docs/index.html"), path)


class QuietHandler(DevHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


class ServerTest(unittest.TestCase):
    """End to end over a real socket, serving a throwaway directory."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        root = Path(cls.tmp.name)
        (root / "docs").mkdir()
        (root / "docs" / "index.html").write_text("docs index")
        (root / "privacy.html").write_text("privacy page")
        (root / "site.css").write_text("body{}")
        handler = partial(QuietHandler, directory=cls.tmp.name)
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        cls.tmp.cleanup()

    def get(self, path):
        conn = http.client.HTTPConnection("127.0.0.1", self.server.server_port)
        try:
            conn.request("GET", path)
            resp = conn.getresponse()
            return resp.status, resp.getheader("Cache-Control"), resp.read().decode()
        finally:
            conn.close()

    def test_extensionless_html_page(self):
        status, cache, body = self.get("/privacy")
        self.assertEqual((status, body), (200, "privacy page"))
        self.assertEqual(cache, NO_CACHE)

    def test_extensionless_directory(self):
        status, _, body = self.get("/docs")
        self.assertEqual((status, body), (200, "docs index"))

    def test_asset_is_served_with_long_cache(self):
        status, cache, _ = self.get("/site.css")
        self.assertEqual((status, cache), (200, LONG_CACHE))

    def test_missing_path_is_404(self):
        self.assertEqual(self.get("/missing")[0], 404)


if __name__ == "__main__":
    unittest.main()
