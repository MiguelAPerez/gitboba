#!/usr/bin/env bash
# Run every script test: Node (node:test) and Python (unittest). CI calls this too.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== node =="
node --test 'scripts/**/*.test.js'

echo "== python =="
python3 -m unittest discover -s scripts -p 'test_*.py' -v
