import unittest
from pathlib import Path

from compose_site_screenshots import EXPORTS, PHONE, export_jobs, scaled_height


class ScaledHeightTest(unittest.TestCase):
    def test_keeps_aspect_ratio(self):
        self.assertEqual(scaled_height((1242, 2688), 621), 1344)

    def test_rounds_to_nearest_pixel(self):
        self.assertEqual(scaled_height((3, 5), 2), 3)  # 3.33 -> 3
        self.assertEqual(scaled_height((4, 7), 2), 4)  # 3.5 -> 4 (banker's: even)

    def test_upscaling_works(self):
        self.assertEqual(scaled_height((100, 200), 300), 600)


class ExportJobsTest(unittest.TestCase):
    def test_maps_every_export_to_raw_and_output_paths(self):
        jobs = export_jobs(Path("/raw"), Path("/out"))
        self.assertEqual(len(jobs), len(EXPORTS))
        self.assertIn(
            (Path(f"/raw/home-{PHONE}.png"), Path("/out/screenshot-home.png"), 780),
            jobs,
        )

    def test_output_names_are_unique(self):
        outputs = [dest for _, dest, _ in export_jobs(Path("/raw"), Path("/out"))]
        self.assertEqual(len(outputs), len(set(outputs)))

    def test_widths_are_positive(self):
        for _, _, width in export_jobs(Path("/raw"), Path("/out")):
            self.assertGreater(width, 0)


if __name__ == "__main__":
    unittest.main()
