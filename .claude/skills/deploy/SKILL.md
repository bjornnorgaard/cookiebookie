---
name: deploy
description: Deploy Cookie Bookie. Pushing main deploys production (GitHub Actions builds the image and bumps the Mimir tag; Vercel builds main too), then the test environment is synced to the same image. Use only when the user explicitly asks to deploy or release.
---

# Deploy Cookie Bookie

**Pushing to `main` is a production deploy.** Only push to `main` when the user has asked to deploy (or to push, knowing it deploys). Never deploy as a side effect of other work.

| Environment | Manifest | How it updates |
| --- | --- | --- |
| **Production** (https://cookiebookie.bybear.dk) | `deploy/mimir/services.yaml` | The `Deploy` workflow (`.github/workflows/deploy.yaml`) runs on every push to `main` (except changes under `deploy/mimir/**`): builds `ghcr.io/bjornnorgaard/cookiebookie:<commit sha>`, pushes it and commits the tag bump with `[skip ci]`. Argo rolls the cluster out from `main`. |
| **Test** (https://cookiebookie-test.bybear.dk) | `deploy/mimir/services.test.yaml` | Explicit only. Synced to production after every deploy (step 6), or `scripts/deploy-test.sh <branch\|tag\|sha>` to try something that is not on `main`. |
| **Vercel** | — | Builds `main` on push through its GitHub integration. Nothing to run. |

## Steps

1. If photos changed: `npm run images`, commit the generated files under `static/images/recipes` and `src/lib/data/images.generated.json`. The originals in `photos/` are never deployed or committed. If fonts changed: `npm run fonts` and commit `src/lib/fonts/`.
2. Validate: `npm run check` and `npm test` (and `npm run audit:lighthouse` for performance work).
3. Get the change onto `main`: commit, `git pull --rebase origin main` (the workflow's tag-bump commits land there between pushes), push.
4. Watch the run: `gh run list --workflow Deploy --limit 1`, then `gh run watch <id> --exit-status`.
5. Verify production: `git pull --rebase origin main` and check the new sha in `deploy/mimir/services.yaml`; production serves the new build within about a minute (compare the `_app/immutable/...` bundle names in `curl -s https://cookiebookie.bybear.dk/lasagne`).
6. **Sync test to production.** Set the same sha in `deploy/mimir/services.test.yaml`, commit and push:
   ```sh
   SHA=<sha from services.yaml>
   sed -i '/^  web:/,/^    ports:/ s/^      tag: .*/      tag: "'"$SHA"'"/' deploy/mimir/services.test.yaml
   git commit -am "chore: bump web TEST image tag to $SHA (sync with production) [skip ci]" && git push origin main
   ```
   No rebuild: the image is already in GHCR. Verify https://cookiebookie-test.bybear.dk serves the same bundle names as production.
7. Cleanup: `scripts/cleanup.sh` fast-forwards local `main`, prunes stale refs, worktrees and merged branches, and removes old local deploy images. Confirm `git status` is clean and `main` matches `origin/main`.

## Fallback and notes

- **Actions unavailable:** `scripts/deploy.sh` does the same locally (build for `linux/amd64`, smoke-test `/`, `/lasagne`, `/sitemap.xml` and a 404, push, bump `services.yaml`, push with `[skip ci]`, then cleanup). Needs Docker and `docker login ghcr.io` with `write:packages`. Do not run it while the workflow is deploying the same commit; the two race on the tag bump. Then do step 6.
- Re-run the workflow by hand: `gh workflow run Deploy`.
- The image tag is the commit that was built, not the bump commit that follows it.
- Rollback: set `tag` in `deploy/mimir/services.yaml` (and `services.test.yaml`) back to an earlier sha (older images stay in GHCR), commit and push with `[skip ci]`. Changes under `deploy/mimir/**` do not trigger the workflow.
- Cluster access (`kubectl`, context `admin@mimir`) only works on the LAN; when it does not, verify through the public URLs.
