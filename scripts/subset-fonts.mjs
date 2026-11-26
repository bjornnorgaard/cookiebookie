#!/usr/bin/env node
/**
 * Writes the site's web fonts: src/lib/fonts/*.woff2 and src/lib/fonts/fonts.css.
 *   npm run fonts            (needs fontTools: `pip install fonttools brotli`, or set PYFTSUBSET)
 *
 * Fraunces and Inter are variable fonts, and most of their bytes are per-glyph variation data, so file size follows
 * the glyph count. Each font gets three faces with disjoint unicode-ranges:
 *   core    a subset cut from the Fontsource Latin file to CORE below: what Danish recipe pages actually use. Every page loads this.
 *   latin   the rest of Fontsource's Latin range, served from the untouched Fontsource file. Downloaded only when a page has such a character.
 *   ext     Fontsource's Latin Extended file, as before.
 * Axes (wght, and opsz on Fraunces) and all OpenType features are kept, so text looks exactly as with the full files.
 * Add a character to CORE if it shows up in most pages; anything else already falls back to the `latin` face.
 *
 * It also writes metric-matched fallback faces ('Fraunces Fallback Georgia', 'Inter Fallback Arial', …): local system
 * fonts scaled with size-adjust and ascent/descent/line-gap overrides so text set in them takes the same space as the
 * web font. Listed right after the web font in the stacks in src/app.css, they keep the swap from shifting the layout.
 * Metrics come from @capsizecss/metrics; xWidthAvg is the letter-frequency-weighted average glyph width.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { entireMetricsCollection as metrics } from '@capsizecss/metrics/entireMetricsCollection';

const OUT = 'src/lib/fonts';
const PYFTSUBSET = process.env.PYFTSUBSET || 'pyftsubset';

/** Code points in the core subset: ASCII plus the Latin-1 and punctuation Danish text uses. */
const CORE = [
	[0x20, 0x7e],
	0xa0, 0xa7, 0xab, 0xb0, 0xb7, 0xbb, [0xbc, 0xbe], [0xc4, 0xc6], 0xc9, 0xd6, 0xd7, 0xd8, 0xdc,
	[0xe0, 0xe1], [0xe4, 0xe6], [0xe8, 0xeb], 0xf6, 0xf8, 0xfc,
	[0x2013, 0x2014], [0x2018, 0x2019], [0x201c, 0x201e], 0x2022, 0x2026, [0x2039, 0x203a], 0x20ac, 0x2212,
];

// From @fontsource-variable/*/index.css (latin and latin-ext subsets).
const LATIN = [
	[0x0000, 0x00ff], 0x0131, [0x0152, 0x0153], [0x02bb, 0x02bc], 0x02c6, 0x02da, 0x02dc, 0x0304, 0x0308, 0x0329,
	[0x2000, 0x206f], 0x20ac, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215, 0xfeff, 0xfffd,
];
const LATIN_EXT =
	'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

/**
 * fallbacks: [label, capsize key, local() names for regular, local() names for bold]. Liberation and Tinos/Arimo are
 * metric-compatible with Times New Roman and Arial, so they share those metrics (Linux; Chrome's local() does not
 * follow fontconfig aliases). Order matters: the first installed one wins.
 */
const FONTS = [
	{
		family: 'Fraunces Variable', pkg: 'fraunces', axes: 'standard', name: 'fraunces', metrics: 'fraunces', short: 'Fraunces',
		fallbacks: [
			['Georgia', 'georgia', ['Georgia'], ['Georgia Bold', 'Georgia-Bold']],
			['Times', 'timesNewRoman', ['Times New Roman', 'TimesNewRomanPSMT', 'Liberation Serif', 'Tinos'], ['Times New Roman Bold', 'TimesNewRomanPS-BoldMT', 'Liberation Serif Bold', 'Tinos Bold']],
			['Noto', 'notoSerif', ['Noto Serif', 'NotoSerif-Regular'], ['Noto Serif Bold', 'NotoSerif-Bold']],
		],
	},
	{
		family: 'Inter Variable', pkg: 'inter', axes: 'wght', name: 'inter', metrics: 'inter', short: 'Inter',
		fallbacks: [
			['Arial', 'arial', ['Arial', 'ArialMT', 'Liberation Sans', 'Arimo'], ['Arial Bold', 'Arial-BoldMT', 'Liberation Sans Bold', 'Arimo Bold']],
			['Roboto', 'roboto', ['Roboto', 'Roboto-Regular'], ['Roboto Bold', 'Roboto-Bold']],
		],
	},
];

/** Regular metrics cover weights up to 549, bold ones the rest (headings), so bold fallback text is scaled for bold. */
const BANDS = [
	['100 549', 'regular', 2],
	['550 900', '700', 3],
];
const pct = (n) => `${(n * 100).toFixed(2)}%`;
function fallbackFaces(f) {
	let out = '';
	for (const [label, key, regularNames, boldNames] of f.fallbacks) {
		for (const [range, variant, namesIndex] of BANDS) {
			const web = metrics[f.metrics].variants?.[variant] ?? metrics[f.metrics];
			const local = metrics[key].variants?.[variant] ?? metrics[key];
			const names = namesIndex === 2 ? regularNames : boldNames;
			const sizeAdjust = web.xWidthAvg / web.unitsPerEm / (local.xWidthAvg / local.unitsPerEm);
			out += `
@font-face {
  font-family: '${f.short} Fallback ${label}';
  font-weight: ${range};
  src: ${names.map((n) => `local('${n}')`).join(', ')};
  size-adjust: ${pct(sizeAdjust)};
  ascent-override: ${pct(web.ascent / web.unitsPerEm / sizeAdjust)};
  descent-override: ${pct(Math.abs(web.descent) / web.unitsPerEm / sizeAdjust)};
  line-gap-override: ${pct(web.lineGap / web.unitsPerEm / sizeAdjust)};
}
`;
		}
	}
	return out;
}

const expand = (ranges) => new Set(ranges.flatMap((r) => (Array.isArray(r) ? Array.from({ length: r[1] - r[0] + 1 }, (_, i) => r[0] + i) : [r])));
const hex = (n) => n.toString(16).toUpperCase().padStart(4, '0');
/** Sorted code points -> "U+0020-007E,U+00A0,…". */
function toRange(points) {
	const sorted = [...points].sort((a, b) => a - b);
	const parts = [];
	for (let i = 0; i < sorted.length; i++) {
		let j = i;
		while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
		parts.push(i === j ? `U+${hex(sorted[i])}` : `U+${hex(sorted[i])}-${hex(sorted[j])}`);
		i = j;
	}
	return parts.join(',');
}

const core = expand(CORE);
const rest = new Set([...expand(LATIN)].filter((c) => !core.has(c)));
const coreRange = toRange(core);
const restRange = toRange(rest);

const face = (family, src, range) => `@font-face {
  font-family: '${family}';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url('${src}') format('woff2-variations');
  unicode-range: ${range};
}
`;

mkdirSync(OUT, { recursive: true });
let css = `/* Generated by scripts/subset-fonts.mjs (npm run fonts). Do not edit; change CORE in the script instead.
 * Per font: a small core subset every page uses, the rest of Latin and Latin Extended only when a page needs them. */
`;
for (const f of FONTS) {
	const files = `@fontsource-variable/${f.pkg}/files`;
	const source = `node_modules/${files}/${f.name}-latin-${f.axes}-normal.woff2`;
	const outFile = `${f.name}-core-${f.axes}-normal.woff2`;
	execFileSync(PYFTSUBSET, [
		source,
		`--unicodes=${coreRange.replaceAll('U+', '')}`,
		'--layout-features=*',
		'--flavor=woff2',
		`--output-file=${OUT}/${outFile}`,
	]);
	console.log(`${outFile}: ${(statSync(`${OUT}/${outFile}`).size / 1024).toFixed(1)} kB (from ${(statSync(source).size / 1024).toFixed(1)} kB)`);
	css += `\n/* ${f.family}: Latin Extended */\n${face(f.family, `${files}/${f.name}-latin-ext-${f.axes}-normal.woff2`, LATIN_EXT)}`;
	css += `\n/* ${f.family}: rest of Latin */\n${face(f.family, `${files}/${f.name}-latin-${f.axes}-normal.woff2`, restRange)}`;
	css += `\n/* ${f.family}: core */\n${face(f.family, `./${outFile}`, coreRange)}`;
	css += `\n/* ${f.family}: metric-matched fallbacks */${fallbackFaces(f)}`;
}
writeFileSync(`${OUT}/fonts.css`, css);
console.log(`wrote ${OUT}/fonts.css`);
