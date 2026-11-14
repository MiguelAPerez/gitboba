import json
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO

from lighthouse_summary import AUDITS, main, summarize


def report(perf=0.987, a11y=1.0):
    return {
        "categories": {
            "performance": {"score": perf},
            "accessibility": {"score": a11y},
        },
        "audits": {
            audit: {"displayValue": f"{i}.0 s", "score": 0.9}
            for i, audit in enumerate(AUDITS)
        },
    }


class SummarizeTest(unittest.TestCase):
    def test_category_scores_are_whole_percentages(self):
        lines = summarize(report(perf=0.987, a11y=1.0))
        self.assertEqual(lines[:2], ["performance: 98", "accessibility: 100"])

    def test_every_audit_is_listed_in_order(self):
        lines = summarize(report())
        self.assertEqual([l.split(":")[0] for l in lines[2:]], list(AUDITS))
        self.assertEqual(lines[2], "first-contentful-paint: 0.0 s (score 0.9)")

    def test_missing_display_value_prints_none(self):
        data = report()
        data["audits"]["speed-index"] = {"score": None}
        self.assertEqual(summarize(data)[-1], "speed-index: None (score None)")

    def test_missing_audit_raises(self):
        data = report()
        del data["audits"]["speed-index"]
        with self.assertRaises(KeyError):
            summarize(data)


class MainTest(unittest.TestCase):
    def test_reads_report_file_and_prints_summary(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json") as f:
            json.dump(report(), f)
            f.flush()
            out = StringIO()
            with redirect_stdout(out):
                self.assertEqual(main(["prog", f.name]), 0)
        self.assertIn("performance: 98", out.getvalue())

    def test_wrong_arg_count_is_a_usage_error(self):
        self.assertEqual(main(["prog"]), 2)


if __name__ == "__main__":
    unittest.main()
