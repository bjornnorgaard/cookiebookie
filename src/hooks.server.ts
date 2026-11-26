import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { constants, createBrotliCompress, createGzip } from 'node:zlib';
import type { Handle } from '@sveltejs/kit/hooks';
import { dev } from '$app/env';

/**
 * Compresses server-rendered responses (HTML, sitemap, RSS) on the Node build. adapter-node precompresses static
 * files but sends SSR output as is. Vercel compresses at its edge, so this stays off there.
 */
const enabled = !dev && !process.env.VERCEL;
const COMPRESSIBLE = /^(text\/|application\/(json|xml|rss\+xml|ld\+json))/;
const MIN_BYTES = 1024;

function encodingFor(accept: string | null): 'br' | 'gzip' | null {
	if (!accept) return null;
	const offered = (name: string) =>
		accept.split(',').some((part) => {
			const [token, ...params] = part.trim().split(';');
			const q = params.find((p) => p.trim().startsWith('q='));
			return token.trim() === name && (!q || Number(q.trim().slice(2)) > 0);
		});
	return offered('br') ? 'br' : offered('gzip') ? 'gzip' : null;
}

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (!enabled || !response.body || event.request.method === 'HEAD') return response;

	const type = response.headers.get('content-type') ?? '';
	const length = Number(response.headers.get('content-length') ?? Infinity);
	if (!COMPRESSIBLE.test(type) || response.headers.has('content-encoding') || length < MIN_BYTES) return response;

	const encoding = encodingFor(event.request.headers.get('accept-encoding'));
	if (!encoding) return response;

	// Quality 5 brotli: close to max ratio for small pages at a fraction of the CPU of the default (11).
	const compressor =
		encoding === 'br'
			? createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
			: createGzip({ level: 6 });
	const body = Readable.fromWeb(response.body as NodeReadableStream).pipe(compressor);

	const headers = new Headers(response.headers);
	headers.set('content-encoding', encoding);
	headers.delete('content-length');
	headers.append('vary', 'Accept-Encoding');
	return new Response(Readable.toWeb(body) as ReadableStream, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
};
