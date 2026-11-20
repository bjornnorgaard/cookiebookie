import { expect, test, type Page } from '@playwright/test';

/**
 * Runtime image budgets (docs/specs/03-quality-gates.md, section 3): cold cache, phone viewport.
 * Build-time per-file budgets live in scripts/check-image-budgets.mjs.
 */
test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

/** Bytes transferred for image responses while loading `path`, without scrolling. */
async function imageTransfer(page: Page, path: string) {
	const pending: Promise<{ url: string; bytes: number }>[] = [];
	page.on('requestfinished', request => {
		if (request.resourceType() !== 'image') return;
		pending.push(
			request.sizes().then(s => ({ url: request.url(), bytes: s.responseBodySize + s.responseHeadersSize }))
		);
	});
	await page.goto(path);
	await page.waitForLoadState('networkidle');
	const images = await Promise.all(pending);
	return { images, total: images.reduce((sum, i) => sum + i.bytes, 0) };
}

test('home page loads at most 250 kB of images on a phone', async ({ page }) => {
	const { images, total } = await imageTransfer(page, '/');
	expect(images.length).toBeGreaterThan(0);
	expect(total, images.map(i => `${i.url} ${i.bytes}`).join('\n')).toBeLessThanOrEqual(250_000);
});

test('a recipe page loads at most 150 kB of images on a phone', async ({ page }) => {
	const { images, total } = await imageTransfer(page, '/lasagne');
	expect(images.length).toBeGreaterThan(0);
	expect(total, images.map(i => `${i.url} ${i.bytes}`).join('\n')).toBeLessThanOrEqual(150_000);
});

test('photos are never served wider than 2x their display width', async ({ page }) => {
	for (const path of ['/', '/lasagne']) {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
		const wide = await page.locator('.recipe-image picture img').evaluateAll(imgs =>
			imgs
				.map(img => img as HTMLImageElement)
				.filter(img => img.complete && img.clientWidth > 0)
				.filter(img => img.naturalWidth > 2 * img.clientWidth)
				.map(img => `${img.currentSrc} natural ${img.naturalWidth}px for ${img.clientWidth}px`)
		);
		expect(wide, path).toEqual([]);
	}
});
