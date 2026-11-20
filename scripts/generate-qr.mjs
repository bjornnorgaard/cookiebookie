// Build-time QR codes: one inline-SVG path per recipe, written to src/lib/data/qr.generated.ts.
// A small self-contained QR encoder (byte mode, error correction M, versions 1-10) so the site ships no QR library.
// Runs automatically before `npm run build` (prebuild); run `node scripts/generate-qr.mjs` after adding a recipe.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- Reed-Solomon over GF(256)

const ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]; // level M
const NUM_BLOCKS = [-1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5]; // level M

const mul = (x, y) => {
	let z = 0;
	for (let i = 7; i >= 0; i--) {
		z = (z << 1) ^ ((z >>> 7) * 0x11d);
		z ^= ((y >>> i) & 1) * x;
	}
	return z;
};

function divisor(degree) {
	const result = new Array(degree).fill(0);
	result[degree - 1] = 1;
	let root = 1;
	for (let i = 0; i < degree; i++) {
		for (let j = 0; j < degree; j++) {
			result[j] = mul(result[j], root);
			if (j + 1 < degree) result[j] ^= result[j + 1];
		}
		root = mul(root, 2);
	}
	return result;
}

function remainder(data, div) {
	const result = div.map(() => 0);
	for (const b of data) {
		const factor = b ^ result.shift();
		result.push(0);
		div.forEach((coef, i) => (result[i] ^= mul(coef, factor)));
	}
	return result;
}

// ---------------------------------------------------------------- layout helpers

function rawModules(ver) {
	let r = (16 * ver + 128) * ver + 64;
	if (ver >= 2) {
		const n = Math.floor(ver / 7) + 2;
		r -= (25 * n - 10) * n - 55;
		if (ver >= 7) r -= 36;
	}
	return r;
}

function alignPositions(ver) {
	if (ver === 1) return [];
	const n = Math.floor(ver / 7) + 2;
	const size = ver * 4 + 17;
	const step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
	const result = [6];
	for (let pos = size - 7; result.length < n; pos -= step) result.splice(1, 0, pos);
	return result;
}

// ---------------------------------------------------------------- encoder

/** @returns {{ size: number, modules: boolean[][] }} */
export function encode(text) {
	const bytes = [...new TextEncoder().encode(text)];

	let ver = 1;
	for (; ver <= 10; ver++) {
		const cap = Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
		if (4 + 8 + bytes.length * 8 <= cap * 8) break;
	}
	if (ver > 10) throw new Error(`Text too long for the built-in QR encoder: ${text}`);

	const dataCapacity = Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];

	// Bit stream: mode (0100), 8-bit length, bytes, terminator, padding.
	const bits = [];
	const push = (v, n) => {
		for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1);
	};
	push(0b0100, 4);
	push(bytes.length, 8);
	bytes.forEach((b) => push(b, 8));
	push(0, Math.min(4, dataCapacity * 8 - bits.length));
	push(0, (8 - (bits.length % 8)) % 8);
	for (let pad = 0xec; bits.length < dataCapacity * 8; pad ^= 0xec ^ 0x11) push(pad, 8);
	const data = [];
	for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));

	// Split into blocks, add error correction, interleave.
	const nBlocks = NUM_BLOCKS[ver];
	const eccLen = ECC_PER_BLOCK[ver];
	const rawCodewords = Math.floor(rawModules(ver) / 8);
	const nShort = nBlocks - (rawCodewords % nBlocks);
	const shortLen = Math.floor(rawCodewords / nBlocks);
	const div = divisor(eccLen);
	const blocks = [];
	for (let i = 0, k = 0; i < nBlocks; i++) {
		const dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1));
		k += dat.length;
		const ecc = remainder(dat, div);
		if (i < nShort) dat.push(0);
		blocks.push(dat.concat(ecc));
	}
	const all = [];
	for (let i = 0; i < blocks[0].length; i++) {
		blocks.forEach((b, j) => {
			if (i !== shortLen - eccLen || j >= nShort) all.push(b[i]);
		});
	}

	// Matrix with function patterns.
	const size = ver * 4 + 17;
	const modules = Array.from({ length: size }, () => new Array(size).fill(false));
	const isFn = Array.from({ length: size }, () => new Array(size).fill(false));
	const set = (x, y, dark) => {
		modules[y][x] = dark;
		isFn[y][x] = true;
	};

	for (let i = 0; i < size; i++) {
		set(6, i, i % 2 === 0);
		set(i, 6, i % 2 === 0);
	}
	const finder = (cx, cy) => {
		for (let dy = -4; dy <= 4; dy++) {
			for (let dx = -4; dx <= 4; dx++) {
				const dist = Math.max(Math.abs(dx), Math.abs(dy));
				const x = cx + dx;
				const y = cy + dy;
				if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, dist !== 2 && dist !== 4);
			}
		}
	};
	finder(3, 3);
	finder(size - 4, 3);
	finder(3, size - 4);
	const pos = alignPositions(ver);
	pos.forEach((cy, i) =>
		pos.forEach((cx, j) => {
			if ((i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0)) return;
			for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
		})
	);

	const drawFormat = (mask) => {
		const d = (0 << 3) | mask; // level M = 0b00
		let rem = d;
		for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
		const f = ((d << 10) | rem) ^ 0x5412;
		const bit = (i) => ((f >>> i) & 1) !== 0;
		for (let i = 0; i <= 5; i++) set(8, i, bit(i));
		set(8, 7, bit(6));
		set(8, 8, bit(7));
		set(7, 8, bit(8));
		for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
		for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
		for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
		set(8, size - 8, true);
	};
	drawFormat(0);

	if (ver >= 7) {
		let rem = ver;
		for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
		const v = (ver << 12) | rem;
		for (let i = 0; i < 18; i++) {
			const dark = ((v >>> i) & 1) !== 0;
			const a = size - 11 + (i % 3);
			const b = Math.floor(i / 3);
			set(a, b, dark);
			set(b, a, dark);
		}
	}

	// Zig-zag data placement.
	let n = 0;
	for (let right = size - 1; right >= 1; right -= 2) {
		if (right === 6) right = 5;
		for (let vert = 0; vert < size; vert++) {
			for (let j = 0; j < 2; j++) {
				const x = right - j;
				const upward = ((right + 1) & 2) === 0;
				const y = upward ? size - 1 - vert : vert;
				if (!isFn[y][x] && n < all.length * 8) {
					modules[y][x] = ((all[n >>> 3] >>> (7 - (n & 7))) & 1) !== 0;
					n++;
				}
			}
		}
	}

	const MASKS = [
		(x, y) => (x + y) % 2 === 0,
		(x, y) => y % 2 === 0,
		(x, y) => x % 3 === 0,
		(x, y) => (x + y) % 3 === 0,
		(x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
		(x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
		(x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
		(x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
	];
	const applyMask = (m) => {
		for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!isFn[y][x] && MASKS[m](x, y)) modules[y][x] = !modules[y][x];
	};

	let best = 0;
	let bestScore = Infinity;
	for (let m = 0; m < 8; m++) {
		applyMask(m);
		drawFormat(m);
		const s = penalty(modules, size);
		if (s < bestScore) {
			best = m;
			bestScore = s;
		}
		applyMask(m);
	}
	applyMask(best);
	drawFormat(best);
	return { size, modules };
}

function penalty(modules, size) {
	let score = 0;
	const lines = [];
	for (let i = 0; i < size; i++) {
		lines.push(modules[i].map((d) => (d ? '1' : '0')).join(''));
		lines.push(modules.map((row) => (row[i] ? '1' : '0')).join(''));
	}
	for (const line of lines) {
		for (const run of line.match(/0+|1+/g)) if (run.length >= 5) score += 3 + (run.length - 5);
		score += 40 * (line.match(/(?=(00001011101|10111010000))/g) || []).length;
	}
	for (let y = 0; y < size - 1; y++) {
		for (let x = 0; x < size - 1; x++) {
			const c = modules[y][x];
			if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) score += 3;
		}
	}
	const dark = modules.flat().filter(Boolean).length;
	score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
	return score;
}

/** SVG path data (one rectangle per horizontal run of dark modules), in module units. */
export function toPath({ size, modules }) {
	let d = '';
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (!modules[y][x]) continue;
			let len = 1;
			while (x + len < size && modules[y][x + len]) len++;
			d += `M${x} ${y}h${len}v1h-${len}z`;
			x += len;
		}
	}
	return d;
}

// ---------------------------------------------------------------- main

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const siteUrl = readFileSync(join(root, 'src/lib/constants/site.ts'), 'utf8').match(/siteUrl\s*=\s*['"]([^'"]+)['"]/)?.[1];
	if (!siteUrl) throw new Error('siteUrl not found in src/lib/constants/site.ts');

	const dir = join(root, 'src/recipes');
	const slugs = readdirSync(dir)
		.filter((f) => f.endsWith('.ts'))
		.map((f) => readFileSync(join(dir, f), 'utf8').match(/slug:\s*["']([^"']+)["']/)?.[1])
		.filter(Boolean)
		.sort();

	const entries = slugs.map((slug) => {
		const code = encode(`${siteUrl}/${slug}`);
		return `\t${JSON.stringify(slug)}: { size: ${code.size}, d: ${JSON.stringify(toPath(code))} }`;
	});

	const out =
		`// Generated by scripts/generate-qr.mjs (runs before every build). Do not edit.\n` +
		`// One QR code per recipe page, as an SVG path in module units.\n\n` +
		`export const qrCodes: Record<string, { size: number; d: string }> = {\n${entries.join(',\n')}\n};\n`;
	writeFileSync(join(root, 'src/lib/data/qr.generated.ts'), out);
	console.log(`QR codes written for ${slugs.length} recipes`);
}
