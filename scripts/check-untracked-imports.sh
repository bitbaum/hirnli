#!/usr/bin/env bash
#
# check-untracked-imports.sh — Pre-push safety check
#
# Problem this solves: Files created locally but never `git add`'ed pass
# the local build (files exist on disk) but fail on Vercel (only committed
# files exist). This caused 4 consecutive failed deployments.
#
# How it works: Finds untracked files under src/ that could be imports,
# then checks if any tracked file imports them. If so, blocks the push.

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get untracked files in src/ (excluding test fixtures, etc.)
untracked=$(git ls-files --others --exclude-standard -- 'src/' | grep -E '\.(ts|tsx)$' || true)

if [ -z "$untracked" ]; then
  exit 0
fi

# Build a list of potential import paths from untracked files
# e.g., src/lib/utils/share-token.ts → @/lib/utils/share-token
errors=()
for file in $untracked; do
  # Strip src/ prefix and .ts/.tsx extension
  import_path=$(echo "$file" | sed 's|^src/||; s|\.tsx\?$||; s|/index$||')

  # Check if any tracked file imports this path
  # Look for @/path or ./relative-path patterns
  if git grep -l "from ['\"]@/${import_path}['\"]" -- '*.ts' '*.tsx' 2>/dev/null | head -1 > /dev/null 2>&1; then
    importers=$(git grep -l "from ['\"]@/${import_path}['\"]" -- '*.ts' '*.tsx' 2>/dev/null | head -3)
    errors+=("  ${RED}✗${NC} ${file} (imported by: $(echo "$importers" | tr '\n' ', ' | sed 's/,$//'))")
  fi
done

if [ ${#errors[@]} -eq 0 ]; then
  # Untracked files exist but none are imported — just warn
  count=$(echo "$untracked" | wc -l)
  echo -e "${YELLOW}⚠ ${count} untracked file(s) in src/ — consider committing:${NC}"
  echo "$untracked" | head -5 | while read -r f; do echo "  $f"; done
  [ "$count" -gt 5 ] && echo "  ... and $((count - 5)) more"
  echo ""
  exit 0
fi

# Imported untracked files found — this WILL break the Vercel build
echo ""
echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  PUSH BLOCKED — Untracked files are imported by your code  ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "These files exist locally but are NOT in git."
echo -e "The Vercel build WILL fail because it only sees committed files."
echo ""
for err in "${errors[@]}"; do
  echo -e "$err"
done
echo ""
echo -e "Fix: ${YELLOW}git add <files>${NC} and commit before pushing."
echo ""
exit 1
