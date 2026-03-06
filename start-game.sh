#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"

printf '\n🎮 Legend Builder is starting...\n'
printf 'Open this URL in your browser: http://localhost:%s\n\n' "$PORT"
python3 -m http.server "$PORT"
