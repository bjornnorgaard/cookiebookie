#!/usr/bin/env node
/**
 * Runs Lighthouse CI against the production build, once for mobile and once for desktop.
 *   npm run audit:lighthouse            builds the node-adapter site first, then audits
 *   LHCI_PORT=4211 npm run audit:lighthouse
 *   LHCI_RUNS=1 npm run audit:lighthouse -- --no-build   faster, noisier local run on an existing build
 * Needs Chrome (set CHROME_PATH if it is not found automatically).
 */
import { spawnSync } from 'node:child_process';

const run = (cmd, args, env = {}) =>
	spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } }).status ?? 1;

if (!process.argv.includes('--no-build')) {
	if (run('npm', ['run', 'build'], { ADAPTER: 'node' }) !== 0) process.exit(1);
}

let failed = false;
for (const preset of ['mobile', 'desktop']) {
	console.log(`\n=== Lighthouse (${preset}) ===`);
	if (run('npx', ['lhci', 'autorun', '--config=./lighthouserc.cjs'], { AUDIT_FORM_FACTOR: preset }) !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
