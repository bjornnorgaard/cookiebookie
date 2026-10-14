# Dependency review — 2026-10-14

Reviewed all 437 distinct npm packages in the lockfile, including optional platform packages, against the npm registry's latest stable tags. Updated direct packages and refreshed transitive versions within their parents' supported ranges. The tables below record exceptions instead of forcing unrelated breaking APIs into upstream packages.

## Direct packages

| Package | Locked | Latest stable |
| --- | --- | --- |
| @lhci/cli | 0.15.1 | 0.15.1 |
| @playwright/test | 1.64.0 | 1.64.0 |
| @skeletonlabs/skeleton | 5.0.1 | 5.0.1 |
| @skeletonlabs/skeleton-svelte | 5.0.1 | 5.0.1 |
| @sveltejs/adapter-node | 6.0.0 | 6.0.0 |
| @sveltejs/adapter-vercel | 7.0.0 | 7.0.0 |
| @sveltejs/kit | 3.0.1 | 3.0.1 |
| @sveltejs/vite-plugin-svelte | 7.3.1 | 7.3.1 |
| @tailwindcss/typography | 0.5.20 | 0.5.20 |
| @tailwindcss/vite | 4.3.3 | 4.3.3 |
| svelte | 5.57.2 | 5.57.2 |
| svelte-check | 4.7.6 | 4.7.6 |
| tailwindcss | 4.3.3 | 4.3.3 |
| tslib | 2.8.1 | 2.8.1 |
| typescript | 6.0.3 | 7.0.2 |
| vite | 8.3.4 | 8.3.4 |

TypeScript 7.0.2 was attempted, but SvelteKit 3.0.1 requires TypeScript ^6 and svelte-check 4.7.6 accepts only ^5 or ^6. TypeScript 7 also replaces the compiler API these tools consume. Keep 6.0.3 until both tools support 7; no force or legacy-peer-deps is used.

## Security updates beyond upstream ranges

Overrides upgrade Lighthouse to 13.5.0, postcss-selector-parser to 7.1.6, tmp to 0.2.7, basic-ftp to 6.2.3, uuid to 14.0.3, proxy-agent to 8.0.2 and sprintf-js to 1.1.3. Lighthouse collection and assertions exercise these updates. Remove overrides when parent packages adopt the versions.

The remaining npm audit finding is the unbounded precision issue in sprintf-js (the latest release remains affected). It appears as five moderate findings through argparse, js-yaml, @lhci/utils and @lhci/cli. LHCI calls js-yaml.safeLoad, which js-yaml 4 removed; upgrading that parent requires upstream code changes. This tooling is absent from the deployed container, which contains the bundled Node adapter output and package manifest.

## Runtime and workflow dependencies

Docker uses the latest stable Node major, 26. CI builds both adapters and runs production browser tests on Node 22, 24 and 26, and builds/smoke-tests the Docker image. Vercel supports Node 22/24, so its adapter explicitly targets nodejs24.x. Node >=22.19 is required by the upgraded Lighthouse.

GitHub Actions were checked against their latest releases: checkout v7, setup-node v7, upload-artifact v7, setup-buildx-action v4, login-action v4 and build-push-action v7.

## Transitive packages with newer stable tags

These versions are constrained by upstream ranges or exact pins. Major releases often change ESM/CommonJS exports or APIs (for example Express, yargs, rimraf and js-yaml), so replacing them globally would require changing their callers. All packages below were considered; security overrides above are the deliberate exceptions. A newer stable tag can also be older than an upstream-required prerelease; those upstream choices are retained.

| Package | Locked version(s) | Latest stable |
| --- | --- | --- |
| @formatjs/ecma402-abstract | 2.3.6 | 3.2.0 |
| @formatjs/fast-memoize | 2.2.7 | 3.1.7 |
| @formatjs/icu-messageformat-parser | 2.11.4 | 3.5.21 |
| @formatjs/icu-skeleton-parser | 1.8.16 | 2.1.12 |
| @formatjs/intl-localematcher | 0.6.2 | 0.9.0 |
| @internationalized/date | 3.12.3 | 3.12.4 |
| @opentelemetry/api-logs | 0.220.0 | 0.223.0 |
| @opentelemetry/instrumentation | 0.220.0 | 0.223.0 |
| @oxc-project/types | 0.153.0 | 0.154.0 |
| @paulirish/trace_engine | 0.0.65 | 0.0.66 |
| @polka/url | 1.0.0-next.29 | 0.5.0 |
| @sentry/conventions | 0.16.0 | 0.27.0 |
| @sentry/core | 10.76.2 | 11.7.0 |
| @sentry/node | 10.76.2 | 11.7.0 |
| @sentry/node-core | 10.76.2 | 10.75.2 |
| @sentry/opentelemetry | 10.76.2 | 11.7.0 |
| @sentry/server-utils | 10.76.2 | 11.7.0 |
| @zag-js/accordion | 1.43.0 | 1.46.0 |
| @zag-js/anatomy | 1.43.0 | 1.46.0 |
| @zag-js/aria-hidden | 1.43.0 | 1.46.0 |
| @zag-js/auto-resize | 1.43.0 | 1.46.0 |
| @zag-js/avatar | 1.43.0 | 1.46.0 |
| @zag-js/carousel | 1.43.0 | 1.46.0 |
| @zag-js/collapsible | 1.43.0 | 1.46.0 |
| @zag-js/collection | 1.43.0 | 1.46.0 |
| @zag-js/combobox | 1.43.0 | 1.46.0 |
| @zag-js/core | 1.43.0 | 1.46.0 |
| @zag-js/date-picker | 1.43.0 | 1.46.0 |
| @zag-js/date-utils | 1.43.0 | 1.46.0 |
| @zag-js/dialog | 1.43.0 | 1.46.0 |
| @zag-js/dismissable | 1.43.0 | 1.46.0 |
| @zag-js/dom-query | 1.43.0 | 1.46.0 |
| @zag-js/file-upload | 1.43.0 | 1.46.0 |
| @zag-js/file-utils | 1.43.0 | 1.46.0 |
| @zag-js/floating-panel | 1.43.0 | 1.46.0 |
| @zag-js/focus-trap | 1.43.0 | 1.46.0 |
| @zag-js/focus-visible | 1.43.0 | 1.46.0 |
| @zag-js/i18n-utils | 1.43.0 | 1.46.0 |
| @zag-js/interact-outside | 1.43.0 | 1.46.0 |
| @zag-js/listbox | 1.43.0 | 1.46.0 |
| @zag-js/live-region | 1.43.0 | 1.46.0 |
| @zag-js/marquee | 1.43.0 | 1.46.0 |
| @zag-js/menu | 1.43.0 | 1.46.0 |
| @zag-js/pagination | 1.43.0 | 1.46.0 |
| @zag-js/popover | 1.43.0 | 1.46.0 |
| @zag-js/popper | 1.43.0 | 1.46.0 |
| @zag-js/progress | 1.43.0 | 1.46.0 |
| @zag-js/qr-code | 1.43.0 | 1.46.0 |
| @zag-js/radio-group | 1.43.0 | 1.46.0 |
| @zag-js/rating-group | 1.43.0 | 1.46.0 |
| @zag-js/rect-utils | 1.43.0 | 1.46.0 |
| @zag-js/remove-scroll | 1.43.0 | 1.46.0 |
| @zag-js/scroll-snap | 1.43.0 | 1.46.0 |
| @zag-js/slider | 1.43.0 | 1.46.0 |
| @zag-js/steps | 1.43.0 | 1.46.0 |
| @zag-js/store | 1.43.0 | 1.46.0 |
| @zag-js/svelte | 1.43.0 | 1.46.0 |
| @zag-js/switch | 1.43.0 | 1.46.0 |
| @zag-js/tabs | 1.43.0 | 1.46.0 |
| @zag-js/tags-input | 1.43.0 | 1.46.0 |
| @zag-js/toast | 1.43.0 | 1.46.0 |
| @zag-js/toggle-group | 1.43.0 | 1.46.0 |
| @zag-js/tooltip | 1.43.0 | 1.46.0 |
| @zag-js/tree-view | 1.43.0 | 1.46.0 |
| @zag-js/types | 1.43.0 | 1.46.0 |
| @zag-js/utils | 1.43.0 | 1.46.0 |
| abbrev | 3.0.1 | 5.0.0 |
| agent-base | 7.1.4, 9.0.0 | 9.0.0 |
| ansi-escapes | 3.2.0 | 7.3.0 |
| ansi-regex | 3.0.1, 4.1.1, 5.0.1, 6.4.0 | 6.4.0 |
| ansi-styles | 3.2.1, 4.3.0, 6.2.3 | 7.0.0 |
| argparse | 1.0.10 | 3.0.2 |
| aria-query | 5.3.1 | 5.3.2 |
| array-flatten | 1.1.1 | 3.0.0 |
| ast-types | 0.13.4 | 0.16.3 |
| balanced-match | 1.0.2, 4.0.4 | 4.0.4 |
| body-parser | 1.20.8 | 2.3.0 |
| brace-expansion | 1.1.21, 5.0.12 | 5.0.12 |
| camelcase | 5.3.1 | 10.0.0 |
| chalk | 2.4.2 | 6.0.1 |
| chardet | 0.7.0 | 2.2.0 |
| chokidar | 4.0.3 | 5.0.0 |
| chrome-launcher | 0.13.4, 1.2.2 | 1.2.2 |
| chromium-bidi | 157.0.8090-0 | 158.0.8104-0 |
| cli-cursor | 2.1.0 | 5.0.0 |
| cli-width | 2.2.1 | 4.1.0 |
| cliui | 6.0.0, 8.0.1, 9.0.1 | 9.0.1 |
| color-convert | 1.9.3, 2.0.1 | 3.1.3 |
| color-name | 1.1.3, 1.1.4 | 2.1.1 |
| concat-map | 0.0.1 | 0.0.2 |
| configstore | 7.1.0 | 8.0.0 |
| content-disposition | 0.5.4 | 3.0.0 |
| content-type | 1.0.5 | 3.1.1 |
| cookie | 0.7.2, 2.0.1 | 2.0.1 |
| cookie-signature | 1.0.7 | 1.2.2 |
| debug | 2.6.9, 4.4.3 | 4.4.3 |
| decamelize | 1.2.0 | 7.0.0 |
| define-lazy-prop | 2.0.0 | 3.0.0 |
| devalue | 5.9.4 | 6.0.3 |
| devtools-protocol | 0.0.1687809, 0.0.1696802 | 0.0.1718299 |
| dot-prop | 9.0.0 | 10.2.0 |
| emoji-regex | 10.6.0, 8.0.0 | 11.0.0 |
| escape-string-regexp | 1.0.5, 4.0.0 | 5.0.0 |
| estree-walker | 2.0.2 | 3.0.3 |
| express | 4.22.3 | 5.3.0 |
| fast-uri | 3.1.8 | 4.2.2 |
| figures | 2.0.0 | 6.1.0 |
| file-uri-to-path | 1.0.0 | 2.0.0 |
| finalhandler | 1.3.2 | 2.1.1 |
| find-up | 4.1.0 | 8.0.0 |
| glob | 13.0.6, 7.2.3 | 13.0.6 |
| has-flag | 3.0.0 | 5.0.1 |
| https-proxy-agent | 7.0.6, 9.1.0 | 9.1.0 |
| iconv-lite | 0.4.24 | 0.7.3 |
| inquirer | 6.5.2 | 14.2.3 |
| intl-messageformat | 10.7.18 | 12.1.3 |
| ipaddr.js | 1.9.1 | 2.5.0 |
| is-docker | 2.2.1 | 4.0.0 |
| is-fullwidth-code-point | 2.0.0, 3.0.0 | 5.1.0 |
| is-wsl | 2.2.0 | 3.1.1 |
| js-yaml | 3.15.2 | 5.4.3 |
| lighthouse-logger | 1.2.0, 2.0.2 | 2.0.2 |
| lightningcss | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-android-arm64 | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-darwin-arm64 | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-darwin-x64 | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-freebsd-x64 | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-linux-arm-gnueabihf | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-linux-arm64-gnu | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-linux-arm64-musl | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-linux-x64-gnu | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-linux-x64-musl | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-win32-arm64-msvc | 1.32.0, 1.33.0 | 1.33.0 |
| lightningcss-win32-x64-msvc | 1.32.0, 1.33.0 | 1.33.0 |
| locate-path | 5.0.0 | 8.0.0 |
| lru-cache | 11.5.3, 7.18.3 | 11.5.3 |
| magic-string | 0.30.21, 1.4.3 | 1.4.3 |
| media-typer | 0.3.0 | 2.0.0 |
| merge-descriptors | 1.0.3 | 2.0.0 |
| mime | 1.6.0 | 4.1.1 |
| mime-db | 1.52.0, 1.54.0 | 1.54.0 |
| mime-types | 2.1.35 | 3.0.2 |
| mimic-fn | 1.2.0 | 5.0.0 |
| minimatch | 10.2.6, 3.1.5 | 10.2.6 |
| mkdirp | 0.5.6 | 3.0.1 |
| ms | 2.0.0, 2.1.3 | 2.1.3 |
| mute-stream | 0.0.7 | 4.0.0 |
| nanoid | 3.3.20 | 6.0.2 |
| negotiator | 0.6.3, 0.6.4 | 1.1.0 |
| node-fetch | 2.7.0 | 3.3.2 |
| nopt | 8.1.0 | 10.0.1 |
| obug | 2.2.1 | 3.0.0 |
| onetime | 2.0.1 | 8.0.0 |
| open | 7.4.2, 8.4.2 | 11.0.4 |
| p-limit | 2.3.0 | 7.3.3 |
| p-locate | 4.1.0 | 7.0.0 |
| p-try | 2.2.0 | 3.0.0 |
| path-exists | 4.0.0 | 5.0.0 |
| path-is-absolute | 1.0.1 | 2.0.0 |
| path-to-regexp | 0.1.13 | 8.4.2 |
| quickjs-wasi | 2.2.0 | 3.6.2 |
| range-parser | 1.2.1 | 1.3.0 |
| raw-body | 2.5.3 | 4.0.0 |
| readdirp | 4.1.2 | 5.1.1 |
| restore-cursor | 2.0.0 | 5.1.0 |
| rimraf | 3.0.2 | 6.1.3 |
| run-async | 2.4.1 | 4.0.6 |
| rxjs | 6.6.7 | 7.8.2 |
| send | 0.19.2 | 1.2.1 |
| serve-static | 1.16.3 | 2.2.1 |
| signal-exit | 3.0.7 | 4.1.0 |
| source-map | 0.6.1 | 0.8.0 |
| string-width | 2.1.1, 4.2.3, 7.2.0, 8.3.0 | 8.3.0 |
| strip-ansi | 4.0.0, 5.2.0, 6.0.1, 7.2.0 | 7.2.0 |
| supports-color | 5.5.0 | 11.0.0 |
| tslib | 1.14.1 (rxjs) | 2.8.1 |
| tr46 | 0.0.3 | 7.0.0 |
| type-fest | 4.41.0 | 5.10.0 |
| type-is | 1.6.18 | 3.0.0 |
| undici-types | 8.9.0 | 8.12.1 |
| webidl-conversions | 3.0.1 | 8.0.1 |
| whatwg-url | 5.0.0 | 17.3.0 |
| wrap-ansi | 6.2.0, 7.0.0, 9.0.2 | 10.0.2 |
| ws | 7.5.13, 8.22.0 | 8.22.0 |
| y18n | 4.0.3, 5.0.8 | 5.0.8 |
| yargs | 15.4.1, 17.7.3, 18.2.0 | 18.2.0 |
| yargs-parser | 13.1.2, 18.1.3, 21.1.1, 22.0.0 | 22.0.0 |
