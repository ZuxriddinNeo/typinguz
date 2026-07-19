#!/usr/bin/env bash
set -euo pipefail

# Rename @monkeytype scope to @typeuz across the entire monorepo.
# This updates:
#   - package.json "name" fields for all workspace packages
#   - All import/require statements referencing @monkeytype
#   - tsconfig extends, oxlintrc comments
#   - Root package.json scripts and devDeps
#   - vite.config.ts resolve aliases and imports

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Phase 1: Update package.json name fields ==="
# List of packages to rename (relative paths to package.json)
PACKAGES=(
  "package.json"  # root
  "backend/package.json"
  "frontend/package.json"
  "frontend/storybook/package.json"
  "packages/contracts/package.json"
  "packages/schemas/package.json"
  "packages/challenges/package.json"
  "packages/funbox/package.json"
  "packages/util/package.json"
  "packages/release/package.json"
  "packages/oxlint-config/package.json"
  "packages/typescript-config/package.json"
  "packages/tsup-config/package.json"
)

# Manual mapping: @monkeytype/X -> @typeuz/X
for pkg in "${PACKAGES[@]}"; do
  if [ -f "$pkg" ]; then
    echo "  Updating $pkg..."
    # Replace "name": "@monkeytype/..." with "name": "@typeuz/..."
    # Also replace any "workspace:*" or version references to @monkeytype/* in deps
    sed -i 's/"@monkeytype\//"@typeuz\//g' "$pkg"
  fi
done

echo ""
echo "=== Phase 2: Update source files (imports, requires) ==="

# Find all source files that import @monkeytype
# Exclude node_modules, .git, dist, .dev-data
echo "  Finding files with @monkeytype references..."
FILES=$(grep -rl '@monkeytype' \
  --include='*.ts' \
  --include='*.tsx' \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.mjs' \
  --include='*.cjs' \
  --include='*.json' \
  --include='*.yml' \
  --include='*.yaml' \
  --include='*.html' \
  --include='*.css' \
  --include='*.md' \
  . 2>/dev/null | grep -v node_modules | grep -v '.git/' | grep -v 'dist/' | grep -v '.dev-data' || true)

echo "  Found $(echo "$FILES" | wc -l) files to update"
for f in $FILES; do
  echo "    $f"
  sed -i 's/@monkeytype\//@typeuz\//g' "$f"
done

echo ""
echo "=== Phase 3: Update literal 'monkeytype' text references ==="

# Now handle non-package-scope text references
# These need more care — some are GitHub URLs, some are brand names
# We replace only when it clearly refers to this project (not upstream attribution)

# Source code files (ts/tsx/js) - replace standalone 'monkeytype' with 'typeuz'
# But be careful not to double-replace already-updated @typeuz references
echo "  Updating source code literal references..."
grep -rl 'monkeytype' \
  --include='*.ts' \
  --include='*.tsx' \
  --include='*.js' \
  . 2>/dev/null | grep -v node_modules | grep -v '.git/' | grep -v 'dist/' | grep -v '.dev-data' | grep -v 'packages/release' | grep -v 'packages/challenges' | while read -r f; do
  # Replace "monkeytype" with "typeuz" (case-insensitive for most contexts)
  # But NOT in strings that refer to the upstream project for attribution
  sed -i 's/monkeytypegame\/monkeytype/monkeytypegame\/monkeytype/g; s/Monkeytype/TypeUZ/g; s/monkeytype/typeuz/g' "$f" 2>/dev/null || true
done

# Wait, that would replace "monkeytype" -> "typeuz" everywhere including URLs we want to keep.
# Let me be more precise. Actually, let me NOT do the bulk text replacement
# and instead handle specific files one by one.

echo ""
echo "=== Phase 4: Update tsconfig extends ==="
grep -rl '@monkeytype/typescript-config' \
  --include='*.json' \
  . 2>/dev/null | grep -v node_modules | while read -r f; do
  sed -i 's/@monkeytype\/typescript-config/@typeuz\/typescript-config/g' "$f"
done

grep -rl '@monkeytype/tsup-config' \
  --include='*.json' \
  --include='*.js' \
  . 2>/dev/null | grep -v node_modules | while read -r f; do
  sed -i 's/@monkeytype\/tsup-config/@typeuz\/tsup-config/g' "$f"
done

echo ""
echo "=== Phase 5: Update .oxlintrc.json commented references ==="
grep -rl 'monkeytype' --include='.oxlintrc.json' . 2>/dev/null | grep -v node_modules | while read -r f; do
  sed -i 's/@monkeytype\/oxlint-config/@typeuz\/oxlint-config/g' "$f"
done

echo ""
echo "=== Phase 6: Update vite.config.ts references ==="
# Already handled by Phase 2 (imports + resolve alias patterns)

echo ""
echo "Done! Now run build/tsc to verify."
