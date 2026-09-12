#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f package.json ]]; then
  exit 0
fi

if OUTPUT="$(npm run check 2>&1)"; then
  exit 0
fi

ESCAPED_OUTPUT="$(printf '%s' "$OUTPUT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')"

cat <<EOF
{
  "followup_message": "Quality check failed (lint or typecheck). Fix every error and warning without changing business logic, then run \`npm run check\` until it passes.\n\nOutput:\n${ESCAPED_OUTPUT}"
}
EOF
