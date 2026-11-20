import { expect, test, type Page } from '@playwright/test';

const GA = /googletagmanager\.com/;

// Stub Google so the suite never touches the network, while still counting requests.
async function stubGoogle(page: Page) {
	const hits: string[] = [];
	await page.route(GA, (route) => {
		hits.push(route.request().url());
		return route.fulfill({ contentType: 'text/javascript', body: '' });
	});
	return hits;
}

const gaCookies = async (page: Page) => (await page.context().cookies()).filter((c) => c.name.startsWith('_ga'));
const notice = (page: Page) => page.getByRole('region', { name: 'Privatliv' });

test('fresh visit: notice appears, nothing is requested or stored until a choice', async ({ page }) => {
	const hits = await stubGoogle(page);
	await page.goto('/');
	await expect(notice(page)).toBeVisible({ timeout: 5000 });
	await expect(notice(page).getByRole('button')).toHaveText(['Nej tak', 'Det er fint']);
	expect(hits).toEqual([]);
	expect(await gaCookies(page)).toEqual([]);
});

test('"Nej tak" keeps analytics off and the notice stays gone after reload', async ({ page }) => {
	const hits = await stubGoogle(page);
	await page.goto('/');
	await notice(page).getByRole('button', { name: 'Nej tak' }).click();
	await expect(notice(page)).toBeHidden();
	await expect(page.getByRole('status')).toContainText('Gemt');
	await page.reload();
	await page.waitForTimeout(2200);
	await expect(notice(page)).toBeHidden();
	expect(hits).toEqual([]);
	expect(await gaCookies(page)).toEqual([]);
});

test('"Det er fint" loads the script, is remembered, and can be withdrawn from the footer', async ({ page }) => {
	const hits = await stubGoogle(page);
	await page.goto('/');
	await notice(page).getByRole('button', { name: 'Det er fint' }).click();
	await expect.poll(() => hits.length).toBe(1);
	expect(hits[0]).toContain('G-ZT1Z6X8C7F');

	// Remembered: the script loads on the next visit with no notice.
	hits.length = 0;
	await page.reload();
	await expect.poll(() => hits.length).toBe(1);
	await page.waitForTimeout(2200);
	await expect(notice(page)).toBeHidden();

	// Footer link re-opens the notice; withdrawing clears cookies and disables sending.
	await page.context().addCookies([{ name: '_ga', value: 'GA1.1.1.1', url: page.url() }]);
	await page.getByRole('button', { name: 'Privatlivsindstillinger' }).click();
	await expect(notice(page)).toBeVisible();
	await notice(page).getByRole('button', { name: 'Nej tak' }).click();
	await expect.poll(async () => (await gaCookies(page)).length).toBe(0);
	expect(await page.evaluate(() => (window as unknown as Record<string, unknown>)['ga-disable-G-ZT1Z6X8C7F'])).toBe(true);
	await page.reload();
	await page.waitForTimeout(500);
	expect(await page.evaluate(() => JSON.parse(localStorage.getItem('consent')!).analytics)).toBe(false);
});

test('privacy page has the controls and is in the sitemap', async ({ page, request }) => {
	const hits = await stubGoogle(page);
	await page.goto('/privatliv');
	await expect(page.getByRole('heading', { name: 'Privatliv', level: 1 })).toBeVisible();
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/privatliv$/);
	await page.locator('#valg').locator('..').getByRole('button', { name: 'Det er fint' }).click();
	await expect(page.getByText('Besøgstælling er slået til.').first()).toBeVisible();
	await expect.poll(() => hits.length).toBe(1);
	const sitemap = await (await request.get('/sitemap.xml')).text();
	expect(sitemap).toContain('/privatliv</loc>');
});

test.describe('Global Privacy Control', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }));
	});

	test('is treated as "no" without asking', async ({ page }) => {
		const hits = await stubGoogle(page);
		await page.goto('/');
		await page.waitForTimeout(2200);
		await expect(notice(page)).toBeHidden();
		expect(hits).toEqual([]);
		expect(await gaCookies(page)).toEqual([]);
		await page.getByRole('button', { name: 'Privatlivsindstillinger' }).click();
		await expect(notice(page)).toBeVisible();
	});
});
