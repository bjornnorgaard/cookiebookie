/**
 * The print sheet's photo is `loading="lazy"`: the sheet is `display: none` on screen, so a lazy image is never
 * fetched there, and recipe pages stop downloading a second copy of the hero next to the LCP image.
 *
 * Chrome and Firefox load lazy images before printing on their own. These helpers make it certain everywhere:
 * the in-app print button waits for the photo (`printWithPhotos`), and Ctrl/Cmd+P gets a best-effort nudge on
 * `beforeprint` (`loadPrintPhotos`), which may be too late for the first preview in some browsers.
 */
const photos = () => [...document.querySelectorAll<HTMLImageElement>('.ps-photo')];

/** Starts loading every print photo now. */
export function loadPrintPhotos(): HTMLImageElement[] {
	const imgs = photos();
	for (const img of imgs) img.loading = 'eager';
	return imgs;
}

/** Loads the print photos (up to `timeoutMs`), then opens the print dialog. */
export async function printWithPhotos(timeoutMs = 2000): Promise<void> {
	const pending = loadPrintPhotos()
		.filter((img) => !img.complete)
		.map((img) => new Promise<void>((done) => {
			img.addEventListener('load', () => done(), { once: true });
			img.addEventListener('error', () => done(), { once: true });
		}));
	if (pending.length) {
		await Promise.race([Promise.all(pending), new Promise((done) => setTimeout(done, timeoutMs))]);
	}
	window.print();
}
