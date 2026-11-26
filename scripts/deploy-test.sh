#!/usr/bin/env bash
#
# Deploy any branch, tag or commit to the TEST environment
# (https://cookiebookie-test.bybear.dk). Production is never touched.
#
#   scripts/deploy-test.sh                 deploy current HEAD
#   scripts/deploy-test.sh my-branch       deploy a branch (local, or origin/<branch>)
#   scripts/deploy-test.sh v1.2.0          deploy a tag
#   scripts/deploy-test.sh 3fa9c1e         deploy a commit
#   scripts/deploy-test.sh --dry-run [ref] build + smoke-test only; push nothing
#
# The ref is built from a temporary worktree, so your working tree and current branch are
# left alone. The tag bump is committed to deploy/mimir/services.test.yaml on origin/main
# (Argo watches main for manifests); production's services.yaml is not changed.
# Production deploys stay on scripts/deploy.sh, from main.
#
# Env: PLATFORM (default linux/amd64, what the cluster runs), IMAGE.
set -euo pipefail

IMAGE="${IMAGE:-ghcr.io/bjornnorgaard/cookiebookie}"
PLATFORM="${PLATFORM:-linux/amd64}"
DRY_RUN=false
REF=""
for arg in "$@"; do
	case "$arg" in
		--dry-run) DRY_RUN=true ;;
		-*) echo "Unknown option: $arg" >&2; exit 1 ;;
		*) [[ -z "$REF" ]] || { echo "Only one ref allowed." >&2; exit 1; }; REF="$arg" ;;
	esac
done
REF="${REF:-HEAD}"

cd "$(git rev-parse --show-toplevel)"
docker info >/dev/null 2>&1 || { echo "Docker is not running." >&2; exit 1; }
git fetch -q origin

if SHA="$(git rev-parse --verify -q "$REF^{commit}")"; then :
elif SHA="$(git rev-parse --verify -q "origin/$REF^{commit}")"; then :
else echo "Cannot resolve '$REF' to a commit." >&2; exit 1; fi

TAG="$IMAGE:$SHA"
BUILD_DIR="$(mktemp -d)"
BUMP_DIR="$(mktemp -d)"
NAME="cookiebookie-test-deploy-$$"
cleanup() {
	docker rm -f "$NAME" >/dev/null 2>&1 || true
	git worktree remove --force "$BUILD_DIR" >/dev/null 2>&1 || true
	git worktree remove --force "$BUMP_DIR" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Test deploy of '$REF' = $(git log -1 --format='%h %s' "$SHA")"
git worktree add -q --detach "$BUILD_DIR" "$SHA"

echo "==> Building $TAG ($PLATFORM)"
docker buildx build --platform "$PLATFORM" --load -t "$TAG" "$BUILD_DIR"

echo "==> Smoke-testing the container"
docker run -d --rm --name "$NAME" --platform "$PLATFORM" -p 3998:3000 "$TAG" >/dev/null
curl --fail --silent --retry 20 --retry-all-errors --retry-delay 1 --max-time 5 -o /dev/null http://127.0.0.1:3998/
curl --fail --silent -o /dev/null http://127.0.0.1:3998/lasagne
curl --fail --silent -o /dev/null http://127.0.0.1:3998/sitemap.xml
[[ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3998/missing-recipe)" == "404" ]]
echo "    ok"

if $DRY_RUN; then echo "==> Dry run: nothing pushed."; exit 0; fi

echo "==> Pushing $TAG"
docker push "$TAG"

echo "==> Pointing test at it (deploy/mimir/services.test.yaml on main)"
git worktree add -q --detach "$BUMP_DIR" origin/main
(
	cd "$BUMP_DIR"
	sed -i '/^  web:/,/^    ports:/ s/^      tag: .*/      tag: "'"$SHA"'"/' deploy/mimir/services.test.yaml
	git add deploy/mimir/services.test.yaml
	if git diff --staged --quiet; then
		echo "    tag already $SHA"
	else
		git commit -q -m "chore: bump web TEST image tag to $SHA [skip ci]"
		git push origin HEAD:main
	fi
)
echo "==> Deployed $SHA to test: https://cookiebookie-test.bybear.dk"
