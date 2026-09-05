#!/usr/bin/env bash
# How much of what a tenant sees is actually ITS OWN?
#
# Renders every tenant-facing page as two different tenants and reports how many
# text lines differ. A genuinely multi-tenant page differs a lot; a page that is
# one organisation's content with the name swapped differs by a handful of lines.
#
# Measured 2026-09-05, before the content migration: 6,502 lines, 982 differing
# => 85% IDENTICAL. Excluding the two DB-backed pages (/fundraising/stiftungen,
# /fundraising/scoring-methodik) the remaining 16 pages were 96.5% identical.
# That contrast is the point: pages that read the database already work, pages
# that read TypeScript constants do not.
#
# Run against the deployed app (it needs both hosts and real tenant rows):
#   ssh ubuntu@167.233.22.31 'bash -s' < scripts/tenant-divergence.sh
#
# Not part of `verify`: it needs a running server and two seeded tenants.
set -uo pipefail

BASE="${BASE:-http://127.0.0.1:4012}"
A_HOST="${A_HOST:-revamp-info.orangecat.ch}"
B_HOST="${B_HOST:-evig.hirnli.orangecat.ch}"

PAGES="/ /wirkung /finanzen /team /methodik /strategie /revamp-2030 /wie-wir-arbeiten
/operations /preismodell /dokumente /fundraising /fundraising/hub /fundraising/bildung
/fundraising/scoring-methodik /fundraising/pipeline-methodik /fundraising/stiftungen
/fundraising/gesuch-vorlagen"

render() { # host, path -> visible text, one line per node
  curl -sS -m 30 -H "Host: $1" "$BASE$2" \
    | sed 's/<[^>]*>/\n/g' | sed 's/^ *//;s/ *$//' | grep -v '^$'
}

printf '%-34s %7s %7s %7s\n' PAGE A B DIFF
total=0; differing=0
for p in $PAGES; do
  render "$A_HOST" "$p" > /tmp/_a.txt
  render "$B_HOST" "$p" > /tmp/_b.txt
  a=$(wc -l < /tmp/_a.txt); b=$(wc -l < /tmp/_b.txt)
  d=$(diff /tmp/_a.txt /tmp/_b.txt | grep -c '^[<>]')
  printf '%-34s %7s %7s %7s\n' "$p" "$a" "$b" "$d"
  total=$((total + a)); differing=$((differing + d))
done

echo
[ "$total" -gt 0 ] && echo "TOTAL: $total lines, $differing differ => $((100 - differing * 100 / total))% IDENTICAL between the two tenants"
echo "Lower 'identical' is better. 85% was the pre-migration baseline."
