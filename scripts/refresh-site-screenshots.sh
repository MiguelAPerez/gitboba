#!/usr/bin/env bash
# Copy UI captures from GitBobaApp into gitboba.app/images (not app-store bezels).
set -euo pipefail

APP_REPO="${GITBOBA_APP_REPO:-$HOME/development/GitBobaApp}"
SRC="$APP_REPO/marketing/screenshots"
DST="$(cd "$(dirname "$0")/.." && pwd)/images"
PHONE="1242x2688"

if [[ ! -d "$SRC" ]]; then
  echo "Missing $SRC — set GITBOBA_APP_REPO to your GitBobaApp checkout." >&2
  exit 1
fi

sips --resampleWidth 780 "$SRC/home-$PHONE.png" --out "$DST/screenshot-home.png" >/dev/null
sips --resampleWidth 390 "$SRC/home-$PHONE.png" --out "$DST/screenshot-home-docs.png" >/dev/null
sips --resampleWidth 390 "$SRC/pr-detail-$PHONE.png" --out "$DST/screenshot-pull-request.png" >/dev/null
sips --resampleWidth 390 "$SRC/actions-$PHONE.png" --out "$DST/screenshot-actions.png" >/dev/null
sips --resampleWidth 390 "$SRC/notifications-$PHONE.png" --out "$DST/screenshot-notifications.png" >/dev/null

echo "Updated site screenshots from $SRC"
