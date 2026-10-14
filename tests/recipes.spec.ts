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
		const response = await page.goto(`/${link}`);
		expect(response?.status()).toBe(200);
		await expect(page.getByRole('heading', { name: 'Indkøbslisten' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Planen', exact: true })).toBeVisible();
		const metadata = await page.locator('script[type="application/ld+json"]').textContent();
		expect(JSON.parse(metadata!)['@type']).toBe('Recipe');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${link}$`));
		const stylesheet = await page.locator('link[rel="stylesheet"]').first().getAttribute('href');
		expect((await request.get(stylesheet!)).status()).toBe(200);
	}
	expect(errors).toEqual([]);
});

test('shopping list persists and steps toggle after client navigation', async ({ page }) => {
	await page.goto('/');
	await page.locator('main a[href="lasagne"]').click();
	await expect(page).toHaveURL('/lasagne');
	const ingredients = page.locator('.grid-list input[type="checkbox"]');
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
	expect(await sitemap.text()).toContain('/lasagne</loc>');
	expect((await request.get('/robots.txt')).status()).toBe(200);
	const response = await page.goto('/missing-recipe');
	expect(response?.status()).toBe(404);
	expect(response?.headers()['content-security-policy']).toContain("object-src 'none'");
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
	await page.getByRole('link', { name: 'Gå til Forsiden' }).click();
	await expect(page.getByRole('heading', { name: 'Seneste opskrifter' })).toBeVisible();
});
