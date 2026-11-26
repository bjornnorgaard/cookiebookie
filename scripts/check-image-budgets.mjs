#!/usr/bin/env node
/**
 * Fails when a generated recipe image is heavier than its budget (docs/specs/03-quality-gates.md, section 3).
 *
 *   node scripts/check-image-budgets.mjs     (also wired into `npm run images`)
 *
 * Budgets are given in kB (1000 bytes) for the avif variant of each size; webp and jpg
 * carry a looser allowance because they are fallbacks that few browsers pick.
 */
import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const recipesDir = join(root, 'static', 'images', 'recipes');

/** Max kB for the avif file of each variant. Sizes the spec does not name are interpolated. */
const AVIF_KB = {
	'card-400': 25,
	'card-640': 40,
	'card-800': 55,
	'card-960': 70,
	'wide-480': 25,
	'wide-800': 50,
	'wide-1200': 80,
	'wide-1600': 110,
	'wide-2400': 200
};
const FALLBACK_FACTOR = { avif: 1, webp: 2.5, jpg: 2.5 };
const SOCIAL_KB = 250; // og, 16x9, 4x3, 1x1 (jpg)

export function budgetFor(file) {
	const [name, ext] = file.split('.');
	if (AVIF_KB[name] && FALLBACK_FACTOR[ext]) return AVIF_KB[name] * FALLBACK_FACTOR[ext] * 1000;
	if (ext === 'jpg' && /^(og|\d+x\d+)$/.test(name)) return SOCIAL_KB * 1000;
	return null; // unknown file: not budgeted
}

export async function checkImageBudgets({ quiet = false } = {}) {
	if (!existsSync(recipesDir)) return { failures: [], checked: 0 };
	const failures = [];
	let checked = 0;
	const rows = [];
	for (const slug of (await readdir(recipesDir)).sort()) {
		const dir = join(recipesDir, slug);
		if (!(await stat(dir)).isDirectory()) continue;
		for (const file of (await readdir(dir)).sort()) {
			const limit = budgetFor(file);
			if (limit === null) continue;
			const size = (await stat(join(dir, file))).size;
			checked++;
			rows.push({ slug, file, size, limit });
			if (size > limit) failures.push(`${slug}/${file}: ${(size / 1000).toFixed(1)} kB > ${limit / 1000} kB`);
		}
	}
	if (!quiet) {
		// Largest share of budget used per variant, so a PR shows how close each size is.
		const worst = new Map();
		for (const r of rows) {
			const key = r.file.split('.').slice(0, 1) + '.' + r.file.split('.')[1];
			if (!worst.has(key) || r.size / r.limit > worst.get(key).size / worst.get(key).limit) worst.set(key, r);
		}
		console.log('\nImage budgets (largest file per variant):');
		for (const [key, r] of [...worst].filter(([k]) => k.endsWith('.avif') || /^(og|\d+x\d+)\./.test(k))) {
			console.log(`  ${key.padEnd(16)} ${(r.size / 1000).toFixed(1).padStart(6)} kB / ${r.limit / 1000} kB  (${r.slug})`);
		}
	}
	return { failures, checked };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const { failures, checked } = await checkImageBudgets();
	if (failures.length) {
		console.error(`\n${failures.length} image(s) over budget:\n  ${failures.join('\n  ')}`);
		process.exit(1);
	}
	console.log(`\nOK: ${checked} generated images within budget.`);
}
