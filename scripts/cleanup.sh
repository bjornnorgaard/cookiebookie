#!/usr/bin/env bash
#
# Post-deploy housekeeping. Safe to run any time; deploy.sh runs it at the end.
#   - main is fast-forwarded to origin/main
#   - stale remote-tracking refs and worktrees are pruned
#   - local branches are deleted only when their upstream is gone AND their PR
#     was merged (or they are fully merged into main); anything else is reported
#   - old local copies of the deploy image are removed (the newest 2 are kept;
#     every tag stays in GHCR)
set -euo pipefail

IMAGE="${IMAGE:-ghcr.io/bjornnorgaard/cookiebookie}"
KEEP_IMAGES="${KEEP_IMAGES:-2}"
cd "$(git rev-parse --show-toplevel)"

echo "==> Syncing main"
git fetch --prune --quiet origin
if [[ "$(git branch --show-current)" == "main" ]]; then
	git merge --ff-only --quiet origin/main
fi
git worktree prune

echo "==> Cleaning local branches"
current="$(git branch --show-current)"
git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads | while read -r branch track; do
	[[ "$branch" == "main" || "$branch" == "$current" ]] && continue
	merged=false
	git merge-base --is-ancestor "$branch" main 2>/dev/null && merged=true
	if [[ "$track" == "[gone]" ]] && command -v gh >/dev/null; then
		[[ -n "$(gh pr list --state merged --head "$branch" --json number --jq '.[].number' 2>/dev/null)" ]] && merged=true
	fi
	if $merged; then
		git branch -D "$branch" >/dev/null && echo "    deleted $branch"
	else
		echo "    kept $branch (not merged: review by hand)"
	fi
done

if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
	echo "==> Cleaning old local images"
	docker images "$IMAGE" --format '{{.CreatedAt}}|{{.Tag}}' | sort -r | tail -n +"$((KEEP_IMAGES + 1))" | cut -d'|' -f2 \
		| while read -r tag; do docker rmi "$IMAGE:$tag" >/dev/null 2>&1 && echo "    removed $tag"; done
	docker image prune -f >/dev/null
fi

echo "==> Status"
git status -sb | head -1
git worktree list
