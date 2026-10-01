#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[1/4] JavaScript syntax"
node --check src/game.js

echo "[2/4] i18n wrappers glued to keywords (ex.: return\$t)"
if grep -nE '[A-Za-z0-9_]\$[tT][(`]' src/game.js; then
  echo "Found an i18n wrapper glued to an identifier/keyword. Add a space before \$t/\$T."
  exit 1
fi

echo "[3/4] Required files"
test -f index.html
test -f src/style.css
test -f desktop/launcher.go

echo "[4/4] Sensitive file check"
if find . -type f \( -name '*.pfx' -o -name '*.p12' -o -name '*.key' -o -name '.env' \) | grep -q .; then
  echo "Sensitive/signing file detected. Do not commit it."
  exit 1
fi

echo "OK — portfolio beta validation passed."
