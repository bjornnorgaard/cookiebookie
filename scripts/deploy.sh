#!/usr/bin/env bash
#
# Local deploy: build the Docker image on this machine, push it to GHCR and
# point the Mimir cluster at it. No remote CI involved.
#
#   scripts/deploy.sh             build, smoke-test, push, bump tag, push commit
#   scripts/deploy.sh --dry-run   build + smoke-test only; push nothing
#
# Env: PLATFORM (default linux/amd64, what the cluster runs), IMAGE.
set -euo pipefail

IMAGE="${IMAGE:-ghcr.io/bjornnorgaard/cookiebookie}"
PLATFORM="${PLATFORM:-linux/amd64}"
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

cd "$(git rev-parse --show-toplevel)"

[[ "$(git branch --show-current)" == "main" ]] || { echo "Deploy from main (currently on $(git branch --show-current))." >&2; exit 1; }
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || { echo "Working tree has uncommitted changes." >&2; exit 1; }
git fetch -q origin main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || { echo "main is not in sync with origin/main (pull or push first)." >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker is not running." >&2; exit 1; }

SHA="$(git rev-parse HEAD)"
TAG="$IMAGE:$SHA"
echo "==> Building $TAG ($PLATFORM)"
docker buildx build --platform "$PLATFORM" --load -t "$TAG" .

echo "==> Smoke-testing the container"
NAME="cookiebookie-deploy-$$"
docker run -d --rm --name "$NAME" --platform "$PLATFORM" -p 3999:3000 "$TAG" >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT
curl --fail --silent --retry 20 --retry-all-errors --retry-delay 1 --max-time 5 -o /dev/null http://127.0.0.1:3999/
curl --fail --silent -o /dev/null http://127.0.0.1:3999/lasagne
curl --fail --silent -o /dev/null http://127.0.0.1:3999/sitemap.xml
[[ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3999/missing-recipe)" == "404" ]]
echo "    ok"

if $DRY_RUN; then echo "==> Dry run: nothing pushed."; exit 0; fi

echo "==> Pushing $TAG"
docker push "$TAG"

echo "==> Pointing the cluster at it (deploy/mimir/services.yaml)"
sed -i.bak '/^  web:/,/^    ports:/ s/^      tag: .*/      tag: "'"$SHA"'"/' deploy/mimir/services.yaml
rm -f deploy/mimir/services.yaml.bak
git add deploy/mimir/services.yaml
if git diff --staged --quiet; then
	echo "    tag already $SHA"
else
	git commit -q -m "chore: bump web image tag to $SHA [skip ci]"
	git push origin main
fi
echo "==> Deployed $SHA. Vercel builds main on push by itself."
