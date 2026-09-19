#!/usr/bin/env bash
# Copy raw UI captures from GitBobaApp into gitboba.app/images.
#
# Use gitignored screenshots/ (simulator PNGs from take_screenshots.sh).
# Do NOT use marketing/screenshots/ — those are bezeled with a white mat, or
# marketing/app-store/ — captioned App Store slides.
set -euo pipefail

APP_REPO="${GITBOBA_APP_REPO:-$HOME/development/GitBobaApp}"
SRC="$APP_REPO/screenshots"
DST="$(cd "$(dirname "$0")/.." && pwd)/images"
PHONE="1242x2688"

if [[ ! -d "$SRC" ]]; then
  echo "Missing $SRC — run take_screenshots.sh in GitBobaApp first." >&2
  exit 1
fi

for pair in \
  "home:screenshot-home:780" \
  "home:screenshot-home-docs:390" \
  "pr-detail:screenshot-pull-request:390" \
  "actions:screenshot-actions:390" \
  "notifications:screenshot-notifications:390"
do
  IFS=: read -r name out width <<<"$pair"
  src="$SRC/${name}-${PHONE}.png"
  if [[ ! -f "$src" ]]; then
    echo "Missing $src" >&2
    exit 1
  fi
  sips --resampleWidth "$width" "$src" --out "$DST/${out}.png" >/dev/null
done

echo "Updated site screenshots from $SRC (raw UI, no bezels)"
