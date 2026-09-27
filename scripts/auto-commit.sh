#!/usr/bin/env bash
# Claude Code Stop hook: commit and push whatever changed during the turn.
#
# Wired up in .claude/settings.json. A safety net so work in a local session
# always reaches GitHub; Claude still makes its own, well-described commits.
#
# Skips (does nothing) when:
#   - running in a Claude Code cloud session (those commit and push themselves)
#   - AUTO_COMMIT=0 is set
#   - on main/master or a detached HEAD (never pushes to the default branch)
#   - a merge, rebase or cherry-pick is in progress
#   - there is nothing to commit
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && exit 0
[ "${AUTO_COMMIT:-1}" = "0" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch=$(git symbolic-ref --quiet --short HEAD) || exit 0
case "$branch" in main | master) exit 0 ;; esac

git_dir=$(git rev-parse --git-dir)
for marker in MERGE_HEAD rebase-merge rebase-apply CHERRY_PICK_HEAD; do
  [ -e "$git_dir/$marker" ] && exit 0
done

git add -A
if ! git diff --cached --quiet; then
  files=$(git diff --cached --name-only)
  count=$(printf '%s\n' "$files" | wc -l | tr -d ' ')
  git commit --quiet -m "WIP: auto-commit ${count} file(s) from Claude Code session" \
    -m "$(printf '%s\n' "$files" | head -n 20)" || exit 0
fi

# Push anything not yet on the remote (including commits Claude made itself).
if [ -z "$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)" ] ||
  [ -n "$(git log '@{u}..HEAD' --oneline 2>/dev/null)" ]; then
  git push --quiet -u origin "$branch" 2>&1 | tail -n 3
fi
exit 0
