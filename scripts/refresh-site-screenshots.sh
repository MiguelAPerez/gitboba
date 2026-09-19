#!/usr/bin/env bash
# Raw UI + device frames → transparent PNGs for gitboba.app (hero + showcase).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_REPO="${GITBOBA_APP_REPO:-$HOME/development/GitBobaApp}"

export GITBOBA_APP_REPO="$APP_REPO"

if [[ ! -d "$APP_REPO/screenshots" ]]; then
  echo "Missing $APP_REPO/screenshots — run take_screenshots.sh in GitBobaApp first." >&2
  exit 1
fi

if ! python3 -c "import PIL" 2>/dev/null; then
  echo "Need Pillow: python3 -m venv .venv-site && .venv-site/bin/pip install Pillow" >&2
  exit 1
fi

python3 "$ROOT/scripts/compose_site_screenshots.py"
python3 "$ROOT/scripts/generate-og-share.py" 2>/dev/null || true
