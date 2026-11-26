// Production entry for the Node build: adapter-node's own server (env, graceful shutdown, socket activation)
// plus long-lived caching for recipe photos. Run with `node server.js` after `ADAPTER=node npm run build`.
//
// adapter-node only marks /_app/immutable/* as cacheable. Photos live in static/images and keep stable names,
// so their URLs carry a content hash (`?v=…`, written by scripts/optimize-images.mjs) and are safe to cache for a year.
// HTML compression lives in src/hooks.server.ts.
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Loaded by URL so type checking (checkJs over the repo root) does not crawl the generated build.
/** @type {{ server: import('node:http').Server }} */
const { server } = await import(new URL('./build/index.js', import.meta.url).href);

const IMMUTABLE = 'public, max-age=31536000, immutable';
const client = fileURLToPath(new URL('./build/client', import.meta.url));

/** Every file under build/client/images, as a URL path ("/images/recipes/lasagne/card-640.avif"). */
const photos = new Set(
	readdirSync(join(client, 'images'), { recursive: true, withFileTypes: true })
		.filter((d) => d.isFile())
		.map((d) => '/' + relative(client, join(d.parentPath, d.name)).split(sep).join('/')),
);

// Runs before adapter-node's handler; sirv keeps headers already set on the response.
server.prependListener('request', (req, res) => {
	const url = req.url ?? '';
	const q = url.indexOf('?');
	if (q < 0 || !/(^|&)v=/.test(url.slice(q + 1))) return;
	let path;
	try {
		path = decodeURIComponent(url.slice(0, q));
	} catch {
		return;
	}
	if (photos.has(path)) res.setHeader('cache-control', IMMUTABLE);
});
