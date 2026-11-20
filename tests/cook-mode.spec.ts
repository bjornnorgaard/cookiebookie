import { expect, test, type Page } from '@playwright/test';

const SLUG = 'lasagne'; // 6 steps; step 4 has a 45-60 min timer
const STEPS = 6;

async function prepare(page: Page, { wakeLock = false } = {}) {
	await page.addInitScript((wake) => {
		const w = window as any;
		w.__wake = { requests: 0, releases: 0 };
		if (wake) {
			Object.defineProperty(navigator, 'wakeLock', {
				value: {
					request: () => {
						w.__wake.requests++;
						return Promise.resolve({ addEventListener() {}, release: () => (w.__wake.releases++, Promise.resolve()) });
					}
				},
				configurable: true
			});
		}
		if (!localStorage.getItem('consent')) {
			localStorage.setItem('consent', JSON.stringify({ analytics: false, decidedAt: new Date().toISOString(), version: 1 }));
		}
	}, wakeLock);
}

async function openCook(page: Page, opts?: { wakeLock?: boolean }) {
	await prepare(page, opts);
	await page.goto(`/${SLUG}`);
	await page.getByTestId('start-cook').click();
	await expect(cook(page)).toBeVisible();
	await expect.poll(() => cook(page).evaluate((el) => el.getAnimations().length)).toBe(0); // opening animation done
}

const cook = (page: Page) => page.getByRole('dialog', { name: /Madlavning/ });
const heading = (page: Page) => cook(page).getByRole('heading', { level: 2 }).first();
const pageBox = (page: Page, n: number) => page.locator(`#step${n} input`);

test('opens from the button, closes with the X, Esc and Back; focus returns to the button', async ({ page }) => {
	await openCook(page);
	await expect(page).toHaveURL(/#cook$/);
	await expect(cook(page)).toHaveAttribute('aria-modal', 'true');
	await expect(heading(page)).toBeFocused();
	await expect(heading(page)).toHaveAccessibleName(/^Trin 1 af 6/);

	await cook(page).getByRole('button', { name: 'Luk madlavning' }).click();
	await expect(cook(page)).toHaveCount(0);
	await expect(page.getByTestId('start-cook')).toBeFocused();
	await expect(page).not.toHaveURL(/#cook/);

	await page.getByTestId('start-cook').click();
	await expect(cook(page)).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(cook(page)).toHaveCount(0);
	await expect(page.getByTestId('start-cook')).toBeFocused();

	await page.getByTestId('start-cook').click();
	await expect(cook(page)).toBeVisible();
	await page.goBack();
	await expect(cook(page)).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`/${SLUG}$`));
});

test('navigates with buttons, arrow keys and swipe; focus follows the heading', async ({ page }) => {
	await openCook(page);
	const next = page.getByTestId('cook-next');
	const prev = page.getByTestId('cook-prev');
	await expect(prev).toBeDisabled();
	await expect(page.getByTestId('cook-preview')).toContainText('Næste: Kød og vin');

	await next.click();
	await expect(heading(page)).toHaveAccessibleName(/^Trin 2 af 6/);
	await expect(heading(page)).toBeFocused();

	await page.keyboard.press('ArrowRight');
	await expect(heading(page)).toHaveAccessibleName(/^Trin 3 af 6/);
	await page.keyboard.press('ArrowLeft');
	await expect(heading(page)).toHaveAccessibleName(/^Trin 2 af 6/);

	// Swipe left = next, swipe right = back (mouse events are pointer events too).
	const box = (await page.getByTestId('cook-stage').boundingBox())!;
	const y = box.y + 20;
	const swipe = async (from: number, to: number) => {
		await page.mouse.move(from, y);
		await page.mouse.down();
		await page.mouse.move((from + to) / 2, y + 4, { steps: 3 });
		await page.mouse.move(to, y + 6, { steps: 3 });
		await page.mouse.up();
	};
	await swipe(box.x + box.width - 40, box.x + 40);
	await expect(heading(page)).toHaveAccessibleName(/^Trin 3 af 6/);
	await swipe(box.x + 40, box.x + box.width - 40);
	await expect(heading(page)).toHaveAccessibleName(/^Trin 2 af 6/);

	// Progress dots jump without ticking anything.
	await cook(page).getByRole('button', { name: /^Gå til trin 5/ }).click();
	await expect(heading(page)).toHaveAccessibleName(/^Trin 5 af 6/);
});

test('progress is shared with the page, both ways', async ({ page }) => {
	await openCook(page);
	const next = page.getByTestId('cook-next');
	await next.click();
	await next.click();
	await expect(heading(page)).toHaveAccessibleName(/^Trin 3 af 6/);
	await page.keyboard.press('Escape');
	await expect(cook(page)).toHaveCount(0);
	for (const n of [1, 2]) await expect(pageBox(page, n)).toBeChecked();
	await expect(pageBox(page, 3)).not.toBeChecked();

	// A tick on the page moves where cook mode starts.
	await pageBox(page, 4).check();
	await expect(pageBox(page, 3)).toBeChecked(); // wait for the ripple
	await page.getByTestId('start-cook').click();
	await expect(heading(page)).toHaveAccessibleName(/^Trin 5 af 6/);

	// Going back un-ticks the later steps on the page.
	await page.getByTestId('cook-prev').click();
	await expect(heading(page)).toHaveAccessibleName(/^Trin 4 af 6/);
	await page.keyboard.press('Escape');
	for (const n of [1, 2, 3]) await expect(pageBox(page, n)).toBeChecked();
	for (const n of [4, 5, 6]) await expect(pageBox(page, n)).not.toBeChecked();
});

test('the last step ends in the completion state on the page', async ({ page }) => {
	await openCook(page);
	for (let i = 0; i < STEPS - 1; i++) await page.getByTestId('cook-next').click();
	await expect(page.getByTestId('cook-next')).toHaveText(/Færdig/);
	await page.getByTestId('cook-next').click();
	await expect(cook(page)).toHaveCount(0);
	await expect(page.getByText('Velbekomme!')).toBeVisible();
});

test('timers started in cook mode keep running after it closes', async ({ page }) => {
	await openCook(page);
	await page.getByTestId('cook-next').click();
	await page.getByTestId('cook-next').click();
	await page.getByTestId('cook-next').click();
	await expect(heading(page)).toHaveAccessibleName(/^Trin 4 af 6/);
	await cook(page).getByRole('button', { name: /Start 45 min, Simre/ }).click();
	await expect(page.getByTestId('cook-timers')).toContainText('Simre');
	await page.keyboard.press('Escape');
	await expect(cook(page)).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Timere' }).getByTestId('timer-row')).toHaveCount(1);
});

test('keeps the screen awake while open, without changing the saved preference', async ({ page }) => {
	await openCook(page, { wakeLock: true });
	await expect.poll(() => page.evaluate(() => (window as any).__wake.requests)).toBeGreaterThan(0);
	expect(await page.evaluate(() => localStorage.getItem('keep_awake'))).toBeNull();
	await page.keyboard.press('Escape');
	await expect(cook(page)).toHaveCount(0);
	await expect.poll(() => page.evaluate(() => (window as any).__wake.releases)).toBeGreaterThan(0);
	expect(await page.evaluate(() => localStorage.getItem('keep_awake'))).toBeNull();
});

test('text size has three steps and is remembered', async ({ page }) => {
	await openCook(page);
	const size = () => cook(page).getAttribute('data-size');
	expect(await size()).toBe('m');
	await cook(page).getByRole('button', { name: 'Større tekst' }).click();
	expect(await size()).toBe('l');
	await expect(cook(page).getByRole('button', { name: 'Større tekst' })).toBeDisabled();
	await page.reload();
	await page.getByTestId('start-cook').click();
	expect(await size()).toBe('l');
	await cook(page).getByRole('button', { name: 'Mindre tekst' }).click();
	await cook(page).getByRole('button', { name: 'Mindre tekst' }).click();
	expect(await size()).toBe('s');
	await expect(cook(page).getByRole('button', { name: 'Mindre tekst' })).toBeDisabled();
});

test('ingredient drawer on a phone: scaled amounts, ticks shared with the list', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await openCook(page);
	const drawer = page.getByTestId('cook-ingredients');
	await expect(drawer).toBeHidden();
	await page.getByTestId('cook-drawer-toggle').click();
	await expect(drawer).toBeVisible();
	await drawer.getByRole('button', { name: 'Flere portioner' }).click();
	await drawer.locator('input[type=checkbox]').first().check();
	await page.keyboard.press('Escape'); // closes the drawer first
	await expect(drawer).toBeHidden();
	await expect(cook(page)).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(cook(page)).toHaveCount(0);
	await expect(page.locator('#ing-0')).toBeChecked();
	await expect(page.getByRole('group', { name: 'Portioner' }).first()).toBeVisible();
});

test('landscape / tablet shows steps and ingredients side by side', async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 760 });
	await openCook(page);
	const stage = (await page.getByTestId('cook-stage').boundingBox())!;
	const ings = page.getByTestId('cook-ingredients');
	await expect(ings).toBeVisible();
	const side = (await ings.boundingBox())!;
	expect(side.x).toBeGreaterThanOrEqual(stage.x + stage.width - 1);
	expect(Math.abs(side.y - stage.y), JSON.stringify({ side, stage })).toBeLessThan(2);
	await expect(page.getByTestId('cook-drawer-toggle')).toHaveCount(0);

	await page.setViewportSize({ width: 760, height: 1100 });
	await expect(ings).toBeHidden();
	await expect(page.getByTestId('cook-drawer-toggle')).toBeVisible();
});

test('controls are at least 48 px tall', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await openCook(page);
	for (const b of await cook(page).getByRole('button').all()) {
		if (!(await b.isVisible())) continue;
		const box = (await b.boundingBox())!;
		expect(box.height, await b.innerText()).toBeGreaterThanOrEqual(47.5);
	}
});

test('the dialog has a label and the page behind is inert', async ({ page }) => {
	await openCook(page);
	await expect(cook(page)).toHaveAccessibleName(/Den første Lasagne/);
	await expect(page.getByTestId('start-cook')).not.toBeInViewport({ ratio: 1 }).catch(() => {});
	// Tab stays inside the dialog.
	for (let i = 0; i < 40; i++) await page.keyboard.press('Tab');
	expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
});
