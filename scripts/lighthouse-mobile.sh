#!/usr/bin/env bash
# Mobile Lighthouse against the local dev server (PageSpeed-style lab run).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8765}"
URL="http://127.0.0.1:${PORT}/"
OUT="${1:-$ROOT/.lighthouse-latest.json}"

if ! curl -sf -o /dev/null "$URL"; then
  echo "Dev server not reachable at $URL" >&2
  echo "Start it: python3 scripts/dev-server.py --port $PORT" >&2
  exit 1
fi

npx --yes lighthouse "$URL" \
  --only-categories=performance,accessibility \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=json \
  --output-path="$OUT" \
  --quiet \
  --chrome-flags="--headless --no-sandbox"

python3 - "$OUT" <<'PY'
import json, sys
path = sys.argv[1]
data = json.load(open(path))
for name in ("performance", "accessibility"):
    print(f"{name}: {int(data['categories'][name]['score'] * 100)}")
for aid in (
    "first-contentful-paint",
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
):
    audit = data["audits"][aid]
    print(f"{aid}: {audit.get('displayValue')} (score {audit.get('score')})")
PY

echo "Full report: $OUT"
