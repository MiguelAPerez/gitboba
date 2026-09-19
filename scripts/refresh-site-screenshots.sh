#!/usr/bin/env bash
# Raw UI from GitBobaApp/screenshots/ → gitboba.app/images (no bezels, no white mat).
set -euo pipefail

APP_REPO="${GITBOBA_APP_REPO:-$HOME/development/GitBobaApp}"
SRC="$APP_REPO/screenshots"
DST="$(cd "$(dirname "$0")/.." && pwd)/images"
PHONE="1242x2688"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREPARE="$ROOT/scripts/prepare_site_screenshot.py"

if [[ ! -d "$SRC" ]]; then
  echo "Missing $SRC — run take_screenshots.sh in GitBobaApp first." >&2
  exit 1
fi

if ! python3 -c "import PIL" 2>/dev/null; then
  echo "Need Pillow: python3 -m venv .venv-site && .venv-site/bin/pip install Pillow" >&2
  exit 1
fi

prep() {
  local name="$1" out="$2" width="$3"
  local src="$SRC/${name}-${PHONE}.png"
  [[ -f "$src" ]] || { echo "Missing $src" >&2; exit 1; }
  python3 "$PREPARE" "$src" "$DST/${out}.png" --width "$width"
}

prep home screenshot-home 780
prep home screenshot-home-docs 390
prep pr-detail screenshot-pull-request 390
prep actions screenshot-actions 390
prep notifications screenshot-notifications 390

echo "Updated site screenshots from $SRC (raw UI, letterbox trimmed)"
