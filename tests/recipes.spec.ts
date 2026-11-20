import { expect, test } from '@playwright/test';

test('every published recipe renders with metadata and assets', async ({ page, request }) => {
	const errors: string[] = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Seneste opskrifter' })).toBeVisible();
	const links = await page.locator('main a').evaluateAll(elements =>
		elements.map(element => element.getAttribute('href')!)
	);
	expect(links.length).toBeGreaterThan(0);
	for (const link of links) {
		const response = await page.goto(link);
		expect(response?.status()).toBe(200);
		await expect(page.getByRole('heading', { name: 'Indkøbslisten' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Planen', exact: true })).toBeVisible();
		const metadata = await page.locator('script[type="application/ld+json"]').first().textContent();
		expect(JSON.parse(metadata!)['@type']).toBe('Recipe');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${link}$`));
		const stylesheet = await page.locator('link[rel="stylesheet"]').first().getAttribute('href');
		expect((await request.get(stylesheet!)).status()).toBe(200);
	}
	expect(errors).toEqual([]);
});

test('shopping list persists and steps toggle after client navigation', async ({ page }) => {
	await page.goto('/');
	await page.locator('main a[href="/lasagne"]').click();
	await expect(page).toHaveURL('/lasagne');
	const ingredients = page.locator('#ingredients input[type="checkbox"]');
	const first = ingredients.first();
	const id = await first.getAttribute('id');
	await first.check();
	await expect(page.locator(`label[for=${JSON.stringify(id)}]`)).toHaveClass(/line-through/);
	await page.reload();
	const persisted = page.locator(`input[id=${JSON.stringify(id)}]`);
	await expect(persisted).toBeChecked();
	await persisted.uncheck();
	await page.reload();
	await expect(persisted).not.toBeChecked();
	const step = page.locator('#step1 input');
	await step.check();
	await expect(page.locator('#step1 label')).toHaveClass(/(?:^|\s)line-through(?:\s|$)/);
	await step.uncheck();
	await expect(page.locator('#step1 label')).not.toHaveClass(/(?:^|\s)line-through(?:\s|$)/);
});

test('sitemap, robots, CSP and missing recipes retain their behavior', async ({ page, request }) => {
	const sitemap = await request.get('/sitemap.xml');
	expect(sitemap.status()).toBe(200);
	expect(sitemap.headers()['content-type']).toContain('application/xml');
	const xml = await sitemap.text();
	expect(xml).toContain('/lasagne</loc>');
	expect(xml).toContain('/images/recipes/lasagne/16x9.jpg');
	expect((await request.get('/robots.txt')).status()).toBe(200);
	const response = await page.goto('/missing-recipe');
	expect(response?.status()).toBe(404);
	expect(response?.headers()['content-security-policy']).toContain("object-src 'none'");
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
	await page.getByRole('link', { name: 'Gå til Forsiden' }).click();
	await expect(page.getByRole('heading', { name: 'Seneste opskrifter' })).toBeVisible();
});

test('recipe photos are responsive, modern formats and fall back to the placeholder', async ({ page, request }) => {
	await page.goto('/lasagne');
	const sources = await page.locator('picture source').evaluateAll(els => els.map(e => e.getAttribute('type')));
	expect(sources).toContain('image/avif');
	expect(sources).toContain('image/webp');
	const img = page.locator('picture img').first();
	await expect(img).toHaveAttribute('sizes', /.+/);
	await expect(img).toHaveAttribute('srcset', /\d+w/);
	const og = await page.locator('meta[property="og:image"]').getAttribute('content');
	expect(og).toContain('/images/recipes/lasagne/og.jpg');
	expect((await request.get(new URL(og!).pathname)).status()).toBe(200);

	await page.goto('/tomatsalat');
	await expect(page.locator('.recipe-image').first()).toHaveAttribute('data-placeholder', 'true');
	const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
	expect(ld.image).toHaveLength(3);
});
