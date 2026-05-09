#!/bin/bash
# -----------------------------------------------------------------------------
# Purpose: Publish this repo to GitHub using Git CLI + GitHub CLI (no PAT argv).
# Last modified: 2026-05-09 — Cursor Agent
# Completeness: 90/100
# Prereqs: brew install gh; gh auth login; git repo at script root.
# -----------------------------------------------------------------------------

set -euo pipefail

cd "$(dirname "$0")"

OWNER="T1MM0"
REPO="envault-ux"
FULL_NAME="$OWNER/$REPO"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  echo "Then authenticate: gh auth login"
  exit 1
fi

# gh auth status exits 1 if any stale host entry exists — verify the active token instead.
if ! gh api user -q .login >/dev/null 2>&1; then
  echo "Cannot reach GitHub with gh. Run: gh auth login"
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "✗ Current directory is not a git repository."
  exit 1
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "→ No commits yet; creating initial commit..."
  git add -A
  git commit -m "chore: initial publish"
fi

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  echo "✗ Could not determine current branch."
  exit 1
fi

REMOTE_URL_FROM_CONFIG() {
  local protocol
  protocol="$(gh config get git_protocol 2>/dev/null || echo https)"
  if [[ "$protocol" == "ssh" ]]; then
    echo "git@github.com:${FULL_NAME}.git"
  else
    echo "https://github.com/${FULL_NAME}.git"
  fi
}

echo "→ Target: ${FULL_NAME} (branch: ${BRANCH})"

if git remote get-url origin >/dev/null 2>&1; then
  echo "→ Remote origin exists — pushing..."
  git push -u origin "$BRANCH"
else
  if gh repo view "$FULL_NAME" >/dev/null 2>&1; then
    echo "→ Repository exists — adding origin and pushing..."
    git remote add origin "$(REMOTE_URL_FROM_CONFIG)"
    git push -u origin "$BRANCH"
  else
    echo "→ Creating repository and pushing..."
    gh repo create "$FULL_NAME" \
      --public \
      --description "EnVault — Secure environment variable management UI with human-in-the-loop approval workflows" \
      --source=. \
      --remote=origin \
      --push
  fi
fi

echo ""
echo "✓ Done! $(gh repo view --json url -q .url)"
