#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[1/3] JavaScript syntax"
node --check src/game.js

echo "[2/3] Required files"
test -f index.html
test -f src/style.css
test -f desktop/launcher.go

echo "[3/3] Sensitive file check"
if find . -type f \( -name '*.pfx' -o -name '*.p12' -o -name '*.key' -o -name '.env' \) | grep -q .; then
  echo "Sensitive/signing file detected. Do not commit it."
  exit 1
fi

echo "OK — portfolio beta validation passed."
