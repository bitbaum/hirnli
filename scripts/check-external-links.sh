#!/usr/bin/env bash
# Every external source URL cited in config must still resolve.
#
# These are the citations behind the numbers in a Gesuch — the CO2-per-laptop
# figure, the labour-market projection. A foundation clicking one and getting a
# 404 is worse for the argument than no citation at all, and that is what
# happened: the Fraunhofer IZM link died when the institute renamed the
# department, and nothing noticed because nothing looks.
#
# NOT part of `verify`, deliberately: it makes real network calls, so a third
# party's outage must never turn this repo's CI red (see the fleet rule about
# gates that judge state outside the commit). Run it periodically, and whenever
# touching a citation.
#
# Usage: bash scripts/check-external-links.sh
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
# Only complete literals — a URL built with ${...} is a search template, not a
# citation, and cannot be fetched without its argument.
urls=$(grep -rhoE "https://[^'\"\`) ]+" src/lib/config/*.ts \
  | grep -v '\${' | sed 's/[.,)]*$//' | grep -v 'example\.ch' | sort -u)

while read -r url; do
  code=$(curl -sS -o /dev/null -m 15 -L -w '%{http_code}' "$url" 2>/dev/null || echo 000)
  case "$code" in
    200|403) ;;  # 403 = bot-blocked (weforum.org); the page is there for a reader
    *) echo "DEAD  $code  $url"; fail=1 ;;
  esac
done <<< "$urls"

[ "$fail" -eq 0 ] && echo "All cited source URLs resolve." || echo "Dead citations above — fix or remove them."
exit "$fail"
