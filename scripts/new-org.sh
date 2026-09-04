#!/bin/bash
# Clone revamp-info for a new organization
#
# Usage: ./scripts/new-org.sh <org-name>
# Example: ./scripts/new-org.sh zurich-hilft
#
# This creates a new directory with a clean clone ready for onboarding.
# Claude Code does the actual content work — this just sets up the structure.

set -e

ORG=$1

if [ -z "$ORG" ]; then
  echo "Usage: ./scripts/new-org.sh <org-name>"
  echo "Example: ./scripts/new-org.sh zurich-hilft"
  exit 1
fi

echo "Setting up $ORG-info..."

# Clone the repo
git clone . "../$ORG-info"
cd "../$ORG-info"

# Create org context directory
mkdir -p "org-context/$ORG"
echo "# $ORG" > "org-context/$ORG/README.md"
echo "" >> "org-context/$ORG/README.md"
echo "Drop your Verein's documents here (statutes, annual report, website URL)." >> "org-context/$ORG/README.md"
echo "Then ask Claude Code: 'Onboard this org using docs in org-context/$ORG'" >> "org-context/$ORG/README.md"

# Clean generated files
rm -f src/lib/config/foundations/stiftungen-generated.ts

echo ""
echo "Done! Next steps:"
echo "  1. cd ../$ORG-info"
echo "  2. Drop documents into org-context/$ORG/"
echo "  3. Ask Claude Code to onboard the new org"
echo "  4. pnpm run build && git push"
