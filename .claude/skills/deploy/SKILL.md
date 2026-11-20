---
name: deploy
description: Deploy Cookie Bookie. Builds the Docker image locally, pushes it to GHCR, bumps the Mimir image tag and lets Vercel build main. Use only when the user explicitly asks to deploy or release.
---

# Deploy Cookie Bookie

Deploys are **local and explicit**. Remote CI does not build or push the Docker image; the `Deploy` workflow only runs when someone triggers it by hand. Never deploy as a side effect of other work, only when the user asks.

There are two targets, both driven by what is on `main`:

| Target | How it updates |
| --- | --- |
| **Vercel** | Builds `main` automatically on push through its GitHub integration. Nothing to run. |
| **Mimir cluster** (production; there is no separate test tag in `deploy/mimir/services.yaml`) | `scripts/deploy.sh` builds the image locally, pushes `ghcr.io/bjornnorgaard/cookiebookie:<commit sha>` and commits the new `web.image.tag` to `deploy/mimir/services.yaml`. |

## Steps

1. Get the change onto `main` (PR + merge). The script refuses to run from another branch, with uncommitted changes, or when `main` differs from `origin/main`.
2. If photos changed: `npm run images`, commit the generated files under `static/images/recipes` and `src/lib/data/images.generated.json`. The originals in `photos/` are never deployed or committed.
3. Validate: `npm run check` and `npm test`.
4. Optional rehearsal that pushes nothing: `scripts/deploy.sh --dry-run`.
5. Deploy: `scripts/deploy.sh`. It builds for `linux/amd64` (override with `PLATFORM=`), smoke-tests the container (`/`, `/lasagne`, `/sitemap.xml`, a 404), runs `docker push`, rewrites the tag and pushes a `[skip ci]` commit to `main`.
6. Cleanup: `scripts/deploy.sh` runs `scripts/cleanup.sh` at the end (also runnable alone). It fast-forwards local `main` to `origin/main`, prunes stale remote refs and worktrees, deletes local branches whose upstream is gone and whose PR was merged (anything else is reported, never deleted), and removes old local copies of the deploy image (newest 2 kept). Also delete merged remote branches and stale worktrees you created yourself; confirm `git status` is clean and `main` matches `origin/main`.
7. Verify: Vercel deployment is green, the new tag is in `deploy/mimir/services.yaml`, and the cluster rolled out (needs access to the LAN cluster; `kubectl` context `admin@mimir`).

## Notes

- Requires Docker running and a `docker login ghcr.io` with `write:packages`.
- The image tag is the commit that was built, not the bump commit that follows it.
- Rollback: set `tag` in `deploy/mimir/services.yaml` back to an earlier commit sha (older images stay in GHCR), commit and push with `[skip ci]`.
- To use remote CI once anyway: `gh workflow run Deploy`.
