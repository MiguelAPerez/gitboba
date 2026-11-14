#!/usr/bin/env python3
"""Print the headline scores from a Lighthouse JSON report: lighthouse_summary.py REPORT.json"""

from __future__ import annotations

import json
import sys

CATEGORIES = ("performance", "accessibility")
AUDITS = (
    "first-contentful-paint",
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
)


def summarize(report: dict) -> list[str]:
    """One output line per category score and per audit."""
    lines = [
        f"{name}: {int(report['categories'][name]['score'] * 100)}"
        for name in CATEGORIES
    ]
    for audit_id in AUDITS:
        audit = report["audits"][audit_id]
        lines.append(
            f"{audit_id}: {audit.get('displayValue')} (score {audit.get('score')})"
        )
    return lines


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__, file=sys.stderr)
        return 2
    with open(argv[1]) as f:
        report = json.load(f)
    print("\n".join(summarize(report)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
