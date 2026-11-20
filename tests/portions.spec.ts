import { expect, test, type Page } from '@playwright/test';

// ristaffel: yield 4, "Kylling 500 gram", "Bananer: mindst en pr. pers".
const kylling = (page: Page) => page.locator('#ingredients li', { hasText: 'Kylling' });
const facts = (page: Page) => page.locator('dl div', { hasText: 'Portioner' }).locator('dd');

async function jsonLd(page: Page) {
	const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
	return raw.map((t) => JSON.parse(t)).find((i) => i['@type'] === 'Recipe');
}

test('server render shows the original amounts', async ({ request }) => {
	const html = await (await request.get('/ristaffel?p=8')).text();
	// SSR is always base yield, whatever ?p says; the count is applied after hydration.
	expect(html).toContain('500 gram');
	expect(html).not.toContain('1 kg');
});

test('stepper updates amounts, facts strip and the reset line', async ({ page }) => {
	await page.goto('/ristaffel');
	await expect(kylling(page)).toContainText('Kylling, 500 gram');
	await expect(facts(page)).toHaveText('4');
	await expect(page.getByText('Originalt: 4 portioner')).toBeHidden();

	const more = page.getByRole('button', { name: 'Flere portioner' });
	await more.click();
	await more.click();
	await expect(page.getByLabel('Antal portioner')).toHaveValue('6');
	await expect(kylling(page)).toContainText('Kylling, 750 g');
	await expect(facts(page)).toHaveText('6');
	await expect(page.getByText('Originalt: 4 portioner')).toBeVisible();
	await expect(page.locator('#ingredients li', { hasText: 'Bananer' })).toContainText('mindst en pr. pers (6 i alt)');

	await page.getByRole('button', { name: 'Nulstil', exact: true }).click();
	await expect(kylling(page)).toContainText('Kylling, 500 gram');
	await expect(facts(page)).toHaveText('4');
});

test('presets, typed input and limits', async ({ page }) => {
	await page.goto('/ristaffel');
	await page.getByRole('button', { name: '8', exact: true }).click();
	await expect(kylling(page)).toContainText('Kylling, 1 kg');

	const input = page.getByLabel('Antal portioner');
	await input.fill('3');
	await input.press('Tab');
	await expect(kylling(page)).toContainText('Kylling, 380 g');

	await input.fill('99');
	await input.press('Tab');
	await expect(input).toHaveValue('24');
	await expect(page.getByRole('button', { name: 'Flere portioner' })).toBeDisabled();

	await input.fill('1');
	await input.press('Tab');
	await expect(page.getByRole('button', { name: 'Færre portioner' })).toBeDisabled();
});

test('long-press keeps stepping', async ({ page }) => {
	await page.goto('/ristaffel');
	const more = page.getByRole('button', { name: 'Flere portioner' });
	await more.scrollIntoViewIfNeeded();
	const box = (await more.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.waitForTimeout(1200);
	await page.mouse.up();
	const value = Number(await page.getByLabel('Antal portioner').inputValue());
	expect(value).toBeGreaterThan(7);
});

test('the count persists per recipe', async ({ page }) => {
	await page.goto('/ristaffel');
	await page.getByRole('button', { name: '6', exact: true }).click();
	await page.reload();
	await expect(page.getByLabel('Antal portioner')).toHaveValue('6');
	await expect(kylling(page)).toContainText('Kylling, 750 g');

	// Another recipe is unaffected.
	await page.goto('/risotto');
	await expect(page.getByLabel('Antal portioner')).toHaveValue('2');
	await expect(page.getByText('Originalt')).toBeHidden();
});

test('?p= applies, and wins over the stored count', async ({ page }) => {
	await page.goto('/ristaffel?p=8');
	await expect(kylling(page)).toContainText('Kylling, 1 kg');
	await expect(facts(page)).toHaveText('8');
	await page.goto('/ristaffel?p=nonsense');
	await expect(page.getByLabel('Antal portioner')).toHaveValue('4');
});

test('JSON-LD keeps the original yield and ingredient text', async ({ page }) => {
	await page.goto('/ristaffel');
	const before = await jsonLd(page);
	await page.goto('/ristaffel?p=12');
	await expect(kylling(page)).toContainText('Kylling, 1,5 kg');
	const after = await jsonLd(page);
	expect(after).toEqual(before);
	expect(after.recipeYield).toEqual(['4', '4 portioner']);
	expect(after.recipeIngredient).toContain('500 gram Kylling');
	expect(after.recipeIngredient).toContain('0.5 liter Creme Fraiche');
	expect(after.recipeIngredient).toContain('Karry');
});

test('amounts quoted in step text scale too', async ({ page }) => {
	await page.goto('/risotto');
	const step1 = page.locator('#step1');
	await expect(step1).toContainText('Lav lige under en liter bouillon');
	await page.getByRole('button', { name: '4', exact: true }).click();
	await expect(step1).toContainText('Lav lige under 2 l bouillon');
	const ld = await jsonLd(page);
	expect(JSON.stringify(ld.recipeInstructions)).toContain('Lav lige under en liter bouillon');
});

test('ticks stay with the ingredient when the amount changes', async ({ page }) => {
	await page.goto('/ristaffel');
	await page.getByLabel('Kylling', { exact: false }).first().check();
	await page.getByRole('button', { name: 'Flere portioner' }).click();
	await expect(page.getByLabel('Kylling', { exact: false }).first()).toBeChecked();
});

test('no layout shift when the reset line appears', async ({ page }) => {
	await page.goto('/ristaffel');
	const list = page.locator('#ingredients');
	await list.scrollIntoViewIfNeeded();
	await page.waitForTimeout(1500); // let the on-scroll reveal animation settle
	// Relative to the section heading, so the page's own reveal animation does not matter.
	const top = () => list.evaluate((el) => el.getBoundingClientRect().y - document.getElementById('indkoeb')!.getBoundingClientRect().y);
	const before = await top();
	await page.getByRole('button', { name: 'Flere portioner' }).click();
	await expect(page.getByText('Originalt: 4 portioner')).toBeVisible();
	expect(await top()).toBeCloseTo(before, 0);
});
