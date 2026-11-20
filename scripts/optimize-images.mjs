#!/usr/bin/env node
/**
 * Turns the untouched originals in /photos into web-ready derivatives.
 *
 *   photos/<name>.jpg  ->  static/images/recipes/<slug>/*.{avif,webp,jpg}
 *                          src/lib/data/images.generated.json (manifest)
 *
 * The originals are only ever READ. Everything written lives under
 * static/images/recipes and carries a size suffix, so it can never be
 * confused with (or overwrite) an original.
 *
 * Variants per photo:
 *   wide-<w>   full frame, original aspect ratio (hero on desktop)
 *   card-<w>   3:2 smart crop (cards + hero on phones)
 *   og-*       fixed crops for social previews + Recipe structured data
 *
 * Run: npm run images            (skips photos that have not changed)
 *      npm run images -- --force (rebuild everything)
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const photosDir = join(root, 'photos');
const outRoot = join(root, 'static', 'images', 'recipes');
const manifestPath = join(root, 'src', 'lib', 'data', 'images.generated.json');
const force = process.argv.includes('--force');

const WIDE_WIDTHS = [480, 800, 1200, 1600, 2400];
const CARD_WIDTHS = [400, 640, 960];
const CARD_RATIO = 3 / 2;
const SOCIAL = [
	{ name: 'og', w: 1200, h: 630 }, // Facebook / LinkedIn / X large card
	{ name: '16x9', w: 1600, h: 900 }, // Google Recipe rich results
	{ name: '4x3', w: 1200, h: 900 },
	{ name: '1x1', w: 1200, h: 1200 },
];

const FORMATS = {
	avif: (img) => img.avif({ quality: 50, effort: 5 }),
	webp: (img) => img.webp({ quality: 74, effort: 5 }),
	jpg: (img) => img.jpeg({ quality: 78, mozjpeg: true, progressive: true }),
};

/** "sørens pastaret.jpg" -> "sorens-pastaret" */
function slugify(name) {
	return name
		.toLowerCase()
		.replace(/æ/g, 'ae')
		.replace(/ø/g, 'o')
		.replace(/å/g, 'aa')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function fingerprint(file) {
	return createHash('sha1').update(await readFile(file)).digest('hex').slice(0, 16);
}

async function previous() {
	try {
		return JSON.parse(await readFile(manifestPath, 'utf8'));
	} catch {
		return {};
	}
}

async function build(file, slug, hash) {
	const dir = join(outRoot, slug);
	await rm(dir, { recursive: true, force: true });
	await mkdir(dir, { recursive: true });

	// rotate() bakes in EXIF orientation. Metadata (incl. GPS) is not copied to outputs.
	const base = sharp(file, { limitInputPixels: false }).rotate();
	const { width, height } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
	const entry = { hash, width, height, ratio: +(width / height).toFixed(4), wide: {}, card: {}, social: {} };

	const jobs = [];
	for (const [kind, widths, ratio] of [
		['wide', WIDE_WIDTHS, width / height],
		['card', CARD_WIDTHS, CARD_RATIO],
	]) {
		const usable = widths.filter((x) => x <= width);
		for (const w of usable.length ? usable : [width]) {
			const h = Math.round(w / ratio);
			for (const [ext, encode] of Object.entries(FORMATS)) {
				const name = `${kind}-${w}.${ext}`;
				jobs.push(
					encode(base.clone().resize(w, h, { fit: 'cover', position: 'attention' })).toFile(join(dir, name)),
				);
				(entry[kind][ext] ??= []).push({ src: `/images/recipes/${slug}/${name}`, w, h });
			}
		}
	}
	for (const { name, w, h } of SOCIAL) {
		const file = `${name}.jpg`;
		jobs.push(
			FORMATS.jpg(base.clone().resize(w, h, { fit: 'cover', position: 'attention' })).toFile(join(dir, file)),
		);
		entry.social[name] = { src: `/images/recipes/${slug}/${file}`, w, h };
	}
	await Promise.all(jobs);

	// Tiny blurred preview, inlined as a data URI for instant paint (blur-up).
	const lqip = await base.clone().resize(24, null).webp({ quality: 40 }).toBuffer();
	entry.blur = `data:image/webp;base64,${lqip.toString('base64')}`;

	// Average colour: used as the background while the image decodes.
	const { dominant } = await base.clone().resize(64).stats();
	entry.color = `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;

	return entry;
}

const manifest = await previous();
const files = (await readdir(photosDir)).filter((f) => /\.(jpe?g|png|tiff?|heic)$/i.test(f)).sort();
if (!files.length) {
	console.error(`No photos found in ${photosDir}`);
	process.exit(1);
}

const next = {};
for (const f of files) {
	const slug = slugify(parse(f).name);
	if (slug === 'placeholder') continue; // placeholders are drawn, not photographed (see below)
	const path = join(photosDir, f);
	const hash = await fingerprint(path);
	const cached = manifest[slug];
	if (!force && cached?.hash === hash && existsSync(join(outRoot, slug))) {
		next[slug] = cached;
		console.log(`= ${slug} (unchanged)`);
		continue;
	}
	console.log(`+ ${slug}  <-  ${f}`);
	next[slug] = await build(path, slug, hash);
}

// Keep entries for photos that are not in this checkout's photos/ folder but were generated earlier.
for (const [slug, entry] of Object.entries(manifest)) {
	if (slug !== 'placeholder' && !next[slug] && existsSync(join(outRoot, slug))) next[slug] = entry;
}

// Wireframe placeholder for recipes without a photo: social crops only, rendered from scripts/placeholder.svg.
{
	const dir = join(outRoot, 'placeholder');
	await rm(dir, { recursive: true, force: true });
	await mkdir(dir, { recursive: true });
	const svg = await readFile(join(root, 'scripts', 'placeholder.svg'));
	const social = {};
	for (const { name, w, h } of SOCIAL) {
		await sharp(svg, { density: 300 }).resize(w, h, { fit: 'cover' }).jpeg({ quality: 82 }).toFile(join(dir, `${name}.jpg`));
		social[name] = { src: `/images/recipes/placeholder/${name}.jpg`, w, h };
	}
	next.placeholder = { placeholder: true, social };
	console.log('+ placeholder (drawn)');
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify(next, null, '\t') + '\n');
console.log(`\nManifest: ${manifestPath}`);

// Size budgets (docs/specs/03-quality-gates.md): fail the build step if a generated file is too heavy.
{
	const { checkImageBudgets } = await import('./check-image-budgets.mjs');
	const { failures, checked } = await checkImageBudgets();
	if (failures.length) {
		console.error(`\n${failures.length} image(s) over budget:\n  ${failures.join('\n  ')}`);
		process.exit(1);
	}
	console.log(`\nOK: ${checked} generated images within budget.`);
}
